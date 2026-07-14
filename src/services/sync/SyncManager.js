import { createOfflineQueue } from './offlineQueue'
import { devError } from '@/utils/logger'

/**
 * SyncManager (v3.1 — Sync Engine) — orquestador de la cola de mutaciones
 * offline. Plain JS, nunca dentro de React (ver docs/01_ARCHITECTURE.md:
 * "Un Hook nunca debe renderizar JSX" — este módulo ni siquiera es un
 * hook). Nunca importa un servicio: cada servicio registra su propio
 * `type` con `registerHandler()`, evitando un import circular y
 * manteniendo a SyncManager agnóstico de dominio (mismo espíritu que
 * `ProviderManager` con sus Providers — el orquestador no sabe qué es un
 * favorito o un perfil, solo sabe "repetir esta operación registrada").
 *
 * `createSyncManager({isOnline, storage})` es una factory (no un
 * singleton directo) para poder construir instancias independientes en
 * tests — dos instancias con `storage` separado simulan dos dispositivos.
 * La app real usa el `export default` de más abajo.
 */
export function createSyncManager({ isOnline, storage } = {}) {
  const resolveIsOnline = isOnline || (() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const queue = createOfflineQueue(storage)
  const handlers = new Map()

  function registerHandler(type, replayFn) {
    handlers.set(type, replayFn)
  }

  /**
   * Punto de integración que cada service call site usa en vez de llamar
   * a Supabase directo. `ownErrorMessage` es el mensaje genérico que ESE
   * servicio ya lanza para un error real de Supabase (`{error}` con
   * `if (error) throw new Error(GENERIC_ERROR)`, patrón ya usado en toda
   * la app) — permite distinguir "error real" (se re-lanza, preserva el
   * revert optimista de `useUserCollection.js`) de "falló la red antes de
   * llegar a ese chequeo" (se encola) sin sniffear el tipo/mensaje de la
   * excepción nativa de fetch, que es fràgil y varía por navegador.
   *
   * `optimisticResult` (opcional): valor a resolver cuando la operación se
   * encola en vez de ejecutarse. La mayoría de los call sites no leen el
   * valor resuelto (ej. `useUserCollection.toggle()` solo espera a que la
   * promesa no rechace) — pero `profilesAccountService.updateProfile()` sí
   * (`ProfileContext.jsx` reemplaza el perfil local con lo que esto
   * resuelve), así que sin esto la UI perdería el resto de los campos del
   * perfil al fusionar `undefined`.
   */
  async function run({ type, key, payload, merge = false, ownErrorMessage, optimisticResult } = {}, executeFn) {
    if (!resolveIsOnline()) {
      queue.upsertEntry({ key, type, payload }, { merge })
      return optimisticResult
    }

    try {
      return await executeFn()
    } catch (err) {
      if (ownErrorMessage && err?.message === ownErrorMessage) throw err
      queue.upsertEntry({ key, type, payload }, { merge })
      return optimisticResult
    }
  }

  /**
   * Repite cada operación encolada con su handler registrado. Para en el
   * primer fallo (sigue offline u otro error transitorio) en vez de seguir
   * intentando el resto — la próxima reconexión real vuelve a disparar
   * `flush()` completo.
   */
  async function flush() {
    for (const entry of queue.getEntries()) {
      const handler = handlers.get(entry.type)
      if (!handler) continue
      try {
        await handler(entry.payload)
        queue.removeEntry(entry.key)
      } catch (err) {
        devError('[SyncManager] flush interrumpido, se reintentará en la próxima reconexión:', err)
        break
      }
    }
  }

  // Auto-flush: una vez que vuelve la conexión, y una vez al cargar la app
  // (por si quedaron operaciones de una sesión offline anterior). Diferido
  // con `queueMicrotask` a propósito — nunca síncrono acá: los servicios
  // que importan este módulo (collectionService.js/historyService.js/
  // profilesAccountService.js) recién registran sus handlers DESPUÉS de
  // que la evaluación de este archivo termina (ES modules resuelven el
  // grafo de importaciones antes de reanudar el importador) — un flush
  // síncrono acá correría siempre con la lista de handlers vacía.
  if (typeof window !== 'undefined') {
    window.addEventListener('online', flush)
    queueMicrotask(flush)
  }

  return { registerHandler, run, flush, getEntries: queue.getEntries }
}

export default createSyncManager()
