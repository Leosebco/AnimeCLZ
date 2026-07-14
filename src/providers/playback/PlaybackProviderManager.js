import * as AnimeThemesProvider from './animethemes/AnimeThemesProvider'
import * as ConsumetProvider from './consumet/ConsumetProvider'
import * as EnimeProvider from './enime/EnimeProvider'
import { firstSuccessful, isAbortError } from '@/utils/apiCascade'
import { getCached, getStaleCached, setCached } from '@/utils/cache'
import { devError } from '@/utils/logger'

/**
 * Playback Provider Engine (v2.1) — orquestador multi-proveedor de
 * REPRODUCCIÓN, misma filosofía que `providers/ProviderManager.js` pero
 * completamente independiente de él (ese motor resuelve datos/metadatos de
 * catálogo; este resuelve fuentes de video reproducibles — no se mezclan).
 *
 * Expone 2 métodos: `getEpisodes(animeId)` (catálogo propio del proveedor
 * de reproducción — qué tiene disponible para reproducir, distinto de
 * `ProviderManager.getEpisodes()`, que es metadata de Jikan/AniList) y
 * `getSources(animeId, episodeNumber)` (servidores/calidades/subtítulos/
 * audio/información para un episodio puntual — ver `@typedef VideoSource`
 * en `providers/models.js`).
 *
 * `PLAYBACK_PROVIDERS` es el único punto de extensión: agregar un
 * proveedor real nuevo (el día que exista uno con licencia para episodios
 * completos) es agregarlo a este array — ningún otro archivo necesita
 * tocarse. Los 5 stubs (`consumet/`, `animekai/`, `animepahe/`, `hianime/`,
 * `youtube/`) están definidos y exportan el contrato completo, pero quedan
 * deliberadamente FUERA de este array (mismo criterio ya usado en
 * `ProviderManager.js` para excluir `TMDBProvider`: incluir un proveedor
 * que siempre falla no aporta nada, solo ruido en `devError`).
 *
 * **v2.2** agrega un segundo contrato, en paralelo, sin tocar nada de lo de
 * arriba: `getEpisodeSources(animeId, episodeNumber)` (cascada sobre
 * `VIDEO_PROVIDERS`, ver más abajo) y `getProvidersHealth()`. Piensa en
 * episodios COMPLETOS (Consumet/Enime, ambos inertes hoy — ver
 * `VideoProviderInterface.js`), mientras que `getEpisodes`/`getSources` de
 * arriba siguen resolviendo openings/endings reales vía AnimeThemes — dos
 * preguntas distintas, dos cascadas distintas, un solo archivo.
 */
const PLAYBACK_PROVIDERS = [{ id: 'animethemes', ...AnimeThemesProvider }]

// v2.2 — Sistema de reproducción multi-provider (episodios completos, ver
// `VideoProviderInterface.js` y docs/07_PLAYER_SYSTEM.md/
// docs/15_API_GUIDELINES.md). Array separado de `PLAYBACK_PROVIDERS`
// porque implementan un contrato distinto (4 métodos, no 2) — no se
// mezclan entre sí. Único punto de extensión para "Futuro Provider": el
// día que exista uno real con licencia, agregarlo acá es el único cambio
// necesario. Orden = prioridad de la cascada de `getEpisodeSources()`.
const VIDEO_PROVIDERS = [
  { id: 'consumet', ...ConsumetProvider },
  { id: 'enime', ...EnimeProvider },
]

const CACHE_TTL = {
  getEpisodes: 6 * 60 * 60 * 1000,
  getSources: 6 * 60 * 60 * 1000,
  // Episodios completos (v2.2): TTL más corto a propósito — esta pieza
  // todavía no tiene ningún proveedor real conectado, así que un valor
  // corto evita que un futuro proveedor real quede "pegado" media hora sin
  // datos por culpa de un TTL heredado de las fuentes ya reales de arriba.
  getEpisodeSources: 30 * 60 * 1000,
}

const EMPTY_RESULT_TTL = 60 * 1000

function isResultEmpty(result) {
  if (Array.isArray(result)) return result.length === 0
  if (result && Array.isArray(result.sources)) return result.sources.length === 0
  return result === null || result === undefined
}

async function withCache(method, key, run) {
  const cacheKey = `pbm:${method}:${key}`
  const cached = getCached(cacheKey)
  if (cached !== undefined) return cached

  const result = await run()
  if (!isResultEmpty(result)) {
    setCached(cacheKey, result, CACHE_TTL[method])
    return result
  }

  const stale = getStaleCached(cacheKey)
  if (stale !== undefined && !isResultEmpty(stale)) {
    setCached(cacheKey, stale, EMPTY_RESULT_TTL)
    return stale
  }

  setCached(cacheKey, result, EMPTY_RESULT_TTL)
  return result
}

async function runGetEpisodes(animeId, signal) {
  const settled = await Promise.allSettled(
    PLAYBACK_PROVIDERS.map((provider) => provider.getEpisodes(animeId, signal)),
  )

  for (const outcome of settled) {
    if (outcome.status === 'rejected' && isAbortError(outcome.reason)) throw outcome.reason
  }

  const catalog = []
  settled.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      devError(`[PlaybackProviderManager] getEpisodes (${PLAYBACK_PROVIDERS[index].id}) falló:`, outcome.reason)
      return
    }
    for (const entry of outcome.value || []) {
      catalog.push({ ...entry, provider: PLAYBACK_PROVIDERS[index].id })
    }
  })
  return catalog
}

/**
 * Catálogo combinado de todos los proveedores de reproducción activos —
 * "¿qué hay disponible para reproducir de este anime?". Cada elemento
 * queda tagueado con `provider` para saber de dónde vino.
 */
export async function getEpisodes(animeId, signal) {
  return withCache('getEpisodes', String(animeId), () => runGetEpisodes(animeId, signal))
}

async function runGetSources(animeId, episodeNumber, signal) {
  const settled = await Promise.allSettled(
    PLAYBACK_PROVIDERS.map((provider) => provider.getSources(animeId, episodeNumber, signal)),
  )

  for (const outcome of settled) {
    if (outcome.status === 'rejected' && isAbortError(outcome.reason)) throw outcome.reason
  }

  const sources = []
  const subtitleLanguages = new Set()
  const audioLanguages = new Set()
  const info = []

  settled.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      devError(`[PlaybackProviderManager] getSources (${PLAYBACK_PROVIDERS[index].id}) falló:`, outcome.reason)
      return
    }
    const result = outcome.value
    if (!result) return
    sources.push(...(result.sources || []))
    for (const lang of result.subtitleLanguages || []) subtitleLanguages.add(lang)
    for (const lang of result.audioLanguages || []) audioLanguages.add(lang)
    if (result.info) info.push({ provider: PLAYBACK_PROVIDERS[index].id, ...result.info })
  })

  return {
    sources,
    subtitleLanguages: [...subtitleLanguages],
    audioLanguages: [...audioLanguages],
    info,
  }
}

/**
 * Fuentes reproducibles (servidores/calidades) + idiomas de subtítulo/audio
 * disponibles + información, para un episodio puntual — FUSIONA todos los
 * proveedores activos (no se detiene en el primero, más proveedores = más
 * opciones para el usuario, tal como pide "no acoplar a un solo
 * proveedor"). Si un proveedor no tiene subtítulos, `subtitleLanguages`
 * simplemente no los incluye — el reproductor los oculta automáticamente
 * sin necesitar un caso especial.
 */
export async function getSources(animeId, episodeNumber, signal) {
  const key = `${animeId}:${episodeNumber}`
  return withCache('getSources', key, () => runGetSources(animeId, episodeNumber, signal))
}

// --- v2.2 — Sistema de reproducción multi-provider (episodios completos) ---
// Cascada de PRIMERO-NO-VACÍO-GANA (no fusión, a diferencia de getSources
// de arriba) — orden de prioridad explícito: Consumet → Enime → Futuro
// Provider (agregar a `VIDEO_PROVIDERS`) → vacío. Mismo criterio ya usado
// por `ProviderManager.getEpisodes/getRelations/getRecommendations/
// getGallery` (ver ese archivo) para el mismo tipo de pregunta ("¿alguna
// fuente tiene esto?"), reutilizando `firstSuccessful` en vez de reimplementar
// el mismo loop de cascada a mano.
const isEpisodeSourcesEmpty = (result) => !result?.sources?.length

async function runGetEpisodeSources(animeId, episodeNumber, signal) {
  return firstSuccessful(
    VIDEO_PROVIDERS.map(
      (provider) => async () => {
        const result = await provider.getEpisodeSources(animeId, episodeNumber, signal)
        return result?.sources?.length ? { ...result, provider: provider.id } : result
      },
    ),
    {
      isEmpty: isEpisodeSourcesEmpty,
      onError: (err) => devError('[PlaybackProviderManager] getEpisodeSources falló:', err),
      emptyValue: { sources: [], info: null },
    },
  )
}

/**
 * Fuentes de un EPISODIO COMPLETO (v2.2, distinto de `getSources()` de
 * arriba, que resuelve openings/endings vía AnimeThemes) — cascada sobre
 * `VIDEO_PROVIDERS` en su orden de prioridad, nunca fusiona. Caché de 30
 * minutos solo para resultados con datos reales — un resultado vacío
 * (todos los proveedores fallaron o genuinamente no tienen el episodio)
 * NUNCA se cachea con ese TTL largo, solo con el `EMPTY_RESULT_TTL` corto
 * ya existente (60s) para no pegar un "sin datos" transitorio. Nunca lanza
 * hacia React salvo un abort real.
 */
export async function getEpisodeSources(animeId, episodeNumber, signal) {
  const key = `${animeId}:${episodeNumber}`
  return withCache('getEpisodeSources', key, () => runGetEpisodeSources(animeId, episodeNumber, signal))
}

/**
 * Salud de cada proveedor de video registrado (v2.2, ver
 * `VideoProviderInterface.js`) — nunca lanza, ni siquiera si un
 * `healthCheck()` individual falla (se envuelve en su propio try/catch y
 * se reporta como no disponible en vez de tumbar la agregación completa).
 * @returns {Promise<Array<{id: string} & import('./VideoProviderInterface').ProviderHealth>>}
 */
export async function getProvidersHealth(signal) {
  const results = await Promise.all(
    VIDEO_PROVIDERS.map(async (provider) => {
      try {
        const health = await provider.healthCheck(signal)
        return { id: provider.id, ...health }
      } catch (err) {
        return {
          id: provider.id,
          available: false,
          responseTimeMs: null,
          lastError: err?.message || 'healthCheck falló',
          checkedAt: new Date().toISOString(),
        }
      }
    }),
  )
  return results
}
