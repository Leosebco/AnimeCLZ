import * as AniListProvider from './anilist/AniListProvider'
import * as JikanProvider from './jikan/JikanProvider'
import { firstSuccessful, isAbortError } from '@/utils/apiCascade'
import { mergeAnimeFields } from './models'
import { getCached, getStaleCached, setCached } from '@/utils/cache'
import { devError } from '@/utils/logger'
import { recordProviderCall, detectProviderTag } from '@/services/gateway/metrics'

/**
 * Provider Engine (v1.9) — único orquestador multi-proveedor de datos de
 * anime. Expone 7 métodos (`search/getAnime/getEpisodes/getCharacters/
 * getRelations/getRecommendations/getGallery`); cada proveedor concreto
 * (AniList, Jikan) implementa exactamente esa misma interfaz (ver
 * `anilist/AniListProvider.js`/`jikan/JikanProvider.js`).
 *
 * **v2.0 — conectado a `AnimeDetail.jsx`** (sus 6 secciones dependientes de
 * un id de anime: ficha, personajes, episodios, relaciones, recomendados,
 * galería). Home/Explorar/Buscar/Temporada siguen en
 * `providers/AnimeProvider.js` (100% Jikan) — necesitan una familia de
 * métodos que este motor todavía no tiene (Trending/TopRated/MásPopular/
 * MejorValorado/Temporada, con paginación real) — ver CLAUDE.md para el
 * detalle de por qué se difirió a un sprint propio.
 *
 * `PROVIDERS` es el único punto de extensión: agregar un proveedor real
 * nuevo es agregarlo a este array, en orden de prioridad — ningún otro
 * archivo necesita tocarse.
 */
const PROVIDERS = [
  { id: 'anilist', ...AniListProvider },
  { id: 'jikan', ...JikanProvider },
]

const CACHE_TTL = {
  search: 5 * 60 * 1000,
  getAnime: 30 * 60 * 1000,
  getEpisodes: 30 * 60 * 1000,
  getCharacters: 60 * 60 * 1000,
  getRelations: 60 * 60 * 1000,
  getRecommendations: 30 * 60 * 1000,
  getGallery: 6 * 60 * 60 * 1000,
}

// Un resultado vacío se cachea mucho menos tiempo que uno real: si ambas
// fuentes fallaron de forma transitoria, no queremos que un "sin datos"
// quede pegado hasta que expire el TTL normal.
const EMPTY_RESULT_TTL = 60 * 1000

function isResultEmpty(result) {
  if (Array.isArray(result)) return result.length === 0
  if (result && Array.isArray(result.data)) return result.data.length === 0
  return result === null || result === undefined
}

// v2.0 — "usar el último resultado válido" (nunca un vacío mientras exista
// algo mejor en caché, aunque esté vencido): si la consulta fresca vuelve
// vacía (ambos proveedores fallaron o genuinamente no tienen datos), se
// sirve el valor viejo no vacío que quede en caché — con un TTL corto para
// reintentar de verdad pronto — en vez de dejar pasar el vacío a la UI.
// Solo si tampoco hay nada guardado se devuelve el vacío real (que termina
// en `EmptyState`, el último recurso).
// v3.2 — Backend Gateway & Observability: `recordProviderCall` es un
// no-op en producción (ver services/gateway/metrics.js) y nunca lanza —
// instrumentar acá (el único choque de los 7 métodos) cubre cache hit/
// miss/stale, latencia y proveedor servido sin tocar la lógica de caché
// en sí, que queda exactamente igual.
async function withCache(method, key, run) {
  const cacheKey = `pm:${method}:${key}`
  const cached = getCached(cacheKey)
  if (cached !== undefined) {
    recordProviderCall({
      method,
      cacheHit: true,
      durationMs: 0,
      providerTag: detectProviderTag(cached),
      success: !isResultEmpty(cached),
    })
    return cached
  }

  const startedAt = Date.now()
  const result = await run()
  const durationMs = Date.now() - startedAt

  if (!isResultEmpty(result)) {
    setCached(cacheKey, result, CACHE_TTL[method])
    recordProviderCall({ method, cacheHit: false, durationMs, providerTag: detectProviderTag(result), success: true })
    return result
  }

  const stale = getStaleCached(cacheKey)
  if (stale !== undefined && !isResultEmpty(stale)) {
    setCached(cacheKey, stale, EMPTY_RESULT_TTL)
    recordProviderCall({
      method,
      cacheHit: false,
      stale: true,
      durationMs,
      providerTag: detectProviderTag(stale),
      success: true,
    })
    return stale
  }

  setCached(cacheKey, result, EMPTY_RESULT_TTL)
  recordProviderCall({ method, cacheHit: false, durationMs, providerTag: detectProviderTag(result), success: false })
  return result
}

function rethrowIfAborted(settled) {
  for (const outcome of settled) {
    if (outcome.status === 'rejected' && isAbortError(outcome.reason)) throw outcome.reason
  }
}

function buildFilterKey(filters = {}) {
  const { genre, type, status, minScore, orderBy, sort, year } = filters
  return [genre, type, status, minScore, orderBy, sort, year].map((value) => value ?? '').join('|')
}

async function runSearch(query, filters, signal) {
  const settled = await Promise.allSettled(PROVIDERS.map((provider) => provider.search(query, filters, signal)))
  rethrowIfAborted(settled)

  const byId = new Map()
  settled.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      devError(`[ProviderManager] search (${PROVIDERS[index].id}) falló:`, outcome.reason)
      return
    }
    for (const item of outcome.value || []) {
      const existing = byId.get(item.id)
      byId.set(item.id, existing ? mergeAnimeFields(existing, item) : item)
    }
  })

  const data = [...byId.values()]
  return { data, pagination: { hasNextPage: false, currentPage: 1, lastPage: 1, total: data.length } }
}

/**
 * Búsqueda de anime — consulta todos los proveedores en paralelo y
 * FUSIONA resultados (no se detiene en el primero que responda), tal como
 * pide la sección "Orden de consulta": eliminar duplicados, fusionar
 * resultados. En un duplicado (mismo `id`/`idMal`/`mal_id`, ya es el mismo
 * espacio numérico hoy) se combinan los mejores campos de ambas fuentes
 * vía `mergeAnimeFields`, priorizando el proveedor que aparece primero en
 * `PROVIDERS` (AniList).
 */
export async function search(query, filters = {}, signal) {
  return withCache('search', `${query}:${buildFilterKey(filters)}`, () => runSearch(query, filters, signal))
}

async function runGetAnime(id, signal) {
  const settled = await Promise.allSettled(PROVIDERS.map((provider) => provider.getAnime(id, signal)))
  rethrowIfAborted(settled)

  let merged = null
  const contributingSources = []

  settled.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      devError(`[ProviderManager] getAnime (${PROVIDERS[index].id}) falló:`, outcome.reason)
      return
    }
    if (outcome.value) {
      merged = mergeAnimeFields(merged, outcome.value)
      contributingSources.push(PROVIDERS[index].id)
    }
  })

  if (!merged) return null
  return { ...merged, source: contributingSources.join('+') }
}

/**
 * Ficha de anime — AniList primero, Jikan completa lo que falte. Nunca
 * reemplaza un campo bueno de AniList por uno peor de Jikan
 * (`mergeAnimeFields`, `providers/models.js`). `rank`/`popularity`/
 * `producers`/`licensors`/`themes`/`demographics` siempre llegan de Jikan
 * (AniList no tiene un equivalente real — ver `AniListProvider.getAnime`).
 */
export async function getAnime(id, signal) {
  return withCache('getAnime', String(id), () => runGetAnime(id, signal))
}

/**
 * Episodios — primero-no-vacío-gana entre proveedores (hoy siempre Jikan:
 * AniList no tiene listado de episodios en su schema público, ver
 * `AniListProvider.getEpisodes`). Cada episodio ya viene normalizado al
 * shape de `providers/models.js` (`createEpisode`) — preparado para
 * múltiples fuentes de video futuras, sin implementar reproducción.
 */
export async function getEpisodes(id, options = {}, signal) {
  const key = `${id}:${options.page ?? 1}:${options.limit ?? 12}`
  return withCache('getEpisodes', key, () =>
    firstSuccessful(
      PROVIDERS.map((provider) => () => provider.getEpisodes(id, options, signal)),
      {
        isEmpty: (result) => !result?.data?.length,
        onError: (err) => devError('[ProviderManager] getEpisodes falló:', err),
        emptyValue: { data: [], pagination: { hasNextPage: false, currentPage: 1, lastPage: 1 } },
      },
    ),
  )
}

function nameKey(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}

function mergeCharacter(primary, secondary) {
  return {
    ...secondary,
    ...primary,
    voiceActor: primary.voiceActor || secondary.voiceActor || null,
    image: primary.image || secondary.image || null,
  }
}

async function runGetCharacters(id, signal) {
  const settled = await Promise.allSettled(PROVIDERS.map((provider) => provider.getCharacters(id, signal)))
  rethrowIfAborted(settled)

  const byName = new Map()
  settled.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      devError(`[ProviderManager] getCharacters (${PROVIDERS[index].id}) falló:`, outcome.reason)
      return
    }
    for (const character of outcome.value || []) {
      const key = nameKey(character.name)
      if (!key) continue
      const existing = byName.get(key)
      byName.set(key, existing ? mergeCharacter(existing, character) : character)
    }
  })

  return [...byName.values()]
}

/**
 * Personajes — combina AniList + Jikan (pedido explícito), deduplicados
 * por nombre normalizado a un conjunto de palabras (minúsculas, sin
 * puntuación, orden alfabético) — así "Uzumaki, Naruto" (Jikan) y "Naruto
 * Uzumaki" (AniList) producen la misma clave sin un heurístico frágil de
 * "voltear la coma". En un duplicado se conservan los campos más
 * completos de ambas fuentes (voiceActor/image no nulos).
 */
export async function getCharacters(id, signal) {
  return withCache('getCharacters', String(id), () => runGetCharacters(id, signal))
}

/**
 * Relaciones (Precuela/Secuela/OVA/Especiales/Películas/Spin-off, si
 * existen) — primero-no-vacío-gana, AniList primero, Jikan de respaldo.
 */
export async function getRelations(id, signal) {
  return withCache('getRelations', String(id), () =>
    firstSuccessful(
      PROVIDERS.map((provider) => () => provider.getRelations(id, signal)),
      { onError: (err) => devError('[ProviderManager] getRelations falló:', err), emptyValue: [] },
    ),
  )
}

/**
 * Recomendaciones — AniList primero, Jikan si no existen (pedido
 * explícito, el caso más simple: primero-no-vacío-gana).
 */
export async function getRecommendations(id, options = {}, signal) {
  const key = `${id}:${options.limit ?? 12}`
  return withCache('getRecommendations', key, () =>
    firstSuccessful(
      PROVIDERS.map((provider) => () => provider.getRecommendations(id, options, signal)),
      {
        isEmpty: (result) => !result?.data?.length,
        onError: (err) => devError('[ProviderManager] getRecommendations falló:', err),
        emptyValue: { data: [], pagination: { hasNextPage: false, currentPage: 1, lastPage: 1 } },
      },
    ),
  )
}

/**
 * Galería (imágenes promocionales) — primero-no-vacío-gana, AniList
 * primero, Jikan de respaldo. AniList no tiene un concepto real de galería
 * en su schema público (solo `coverImage`/`bannerImage` únicos), así que en
 * la práctica hoy es siempre Jikan — ver `AniListProvider.getGallery`.
 */
export async function getGallery(id, signal) {
  return withCache('getGallery', String(id), () =>
    firstSuccessful(
      PROVIDERS.map((provider) => () => provider.getGallery(id, signal)),
      { onError: (err) => devError('[ProviderManager] getGallery falló:', err), emptyValue: [] },
    ),
  )
}
