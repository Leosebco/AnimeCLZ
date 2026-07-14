/**
 * Cola de mutaciones offline (v3.1 — Sync Engine). Persistencia pura, sin
 * conocimiento de Supabase/dominio — ver `SyncManager.js` para el
 * orquestador que decide CUÁNDO encolar/repetir una operación.
 *
 * Cada entrada: `{ key, type, payload, createdAt }`. `key` identifica la
 * MISMA intención lógica (ej. "este favorito de este perfil") — encolar de
 * nuevo con la misma `key` reemplaza la entrada anterior (última intención
 * gana, nunca se acumulan duplicados) salvo que se pida `merge: true`
 * (fusiona el `payload` nuevo dentro del existente en vez de reemplazarlo —
 * lo usa `profile:update` para no perder un campo editado antes offline).
 */

const STORAGE_KEY = 'animeclz:syncQueue'

// `localStorage` puede no existir (script de Node/test) o fallar (JSON
// corrupto, `QuotaExceededError` en modo privado de Safari) — ante
// cualquier problema, cae en silencio a un `Map` en memoria en vez de
// romper el flujo optimista de la UI. El `Map` también es lo único
// disponible fuera de un navegador, lo que hace este módulo testeable sin
// jsdom.
function createDefaultStorage() {
  const memory = new Map()
  const hasLocalStorage = typeof localStorage !== 'undefined'

  return {
    read() {
      if (hasLocalStorage) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          return raw ? JSON.parse(raw) : []
        } catch {
          return memory.get(STORAGE_KEY) || []
        }
      }
      return memory.get(STORAGE_KEY) || []
    },
    write(entries) {
      if (hasLocalStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
          return
        } catch {
          // cae a memoria abajo
        }
      }
      memory.set(STORAGE_KEY, entries)
    },
  }
}

/**
 * `storage` es inyectable (dos instancias con `storage` propio simulan dos
 * dispositivos independientes en los scripts de verificación) — por
 * defecto usa `createDefaultStorage()` (localStorage real o memoria).
 */
export function createOfflineQueue(storage = createDefaultStorage()) {
  function getEntries() {
    return storage.read()
  }

  function upsertEntry({ key, type, payload }, { merge = false } = {}) {
    const entries = getEntries()
    const index = entries.findIndex((entry) => entry.key === key)

    if (index === -1) {
      storage.write([...entries, { key, type, payload, createdAt: Date.now() }])
      return
    }

    const existing = entries[index]
    const merged = merge ? { ...existing.payload, ...payload } : payload
    const next = [...entries]
    next[index] = { ...existing, payload: merged, createdAt: Date.now() }
    storage.write(next)
  }

  function removeEntry(key) {
    storage.write(getEntries().filter((entry) => entry.key !== key))
  }

  return { getEntries, upsertEntry, removeEntry }
}
