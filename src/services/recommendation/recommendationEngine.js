import { listFavorites } from '@/services/favoritesService'
import { listWatchLater } from '@/services/watchLaterService'
import { listHistory } from '@/services/historyService'
import { getAnime, getRecommendations as getAnimeRecommendations } from '@/providers/ProviderManager'
import { buildTasteProfile, rankedKeys } from './tasteProfile'
import { rankCandidates, scoreCandidate } from './scoring'
import { getCached, setCached } from '@/utils/cache'
import { isAbortError } from '@/utils/apiCascade'
import { devError } from '@/utils/logger'

/**
 * RecommendationEngine (v2.6) — primer sistema de recomendaciones
 * personalizadas de AnimeCLZ. Completamente independiente de React/Context
 * (ver docs/01_ARCHITECTURE.md: "Un Hook nunca debe renderizar JSX" — acá
 * ni siquiera hay un hook, son funciones puras + servicios, igual que
 * `searchService.js`/`historyService.js`). Vive en `services/`, nunca
 * dentro de un componente.
 *
 * Sin IA externa — todo se calcula localmente combinando datos que ya
 * existen (favoritos/historial/Mi Lista, ver `tasteProfile.js`/
 * `scoring.js` para el detalle) contra un `candidatePool` que el LLAMADOR
 * ya tiene cargado (v2.6: `Home.jsx` pasa sus 5 filas ya existentes,
 * dedupeadas) — el engine nunca dispara sus propias consultas de catálogo
 * completo, solo el enriquecimiento acotado de géneros/estudios (ver
 * `SEED_LIMIT`) y las llamadas de Supabase que ya usan otras pantallas.
 */

// FASE 7 — TTL configurable (no hardcodeado dentro de la función).
export const RECOMMENDATIONS_CACHE_TTL = 15 * 60 * 1000

// FASE 8 — cuántos favoritos y cuántas entradas de historial se enriquecen
// con géneros/estudios reales (`ProviderManager.getAnime`, sin tocar ese
// archivo). Acotado a propósito: enriquecer TODA la colección de un
// usuario activo sería una llamada por cada anime que alguna vez guardó —
// "no llamadas innecesarias" (FASE 8) se traduce acá en un límite real.
const SEED_LIMIT = 6

// "Sigue viendo": mismo umbral de 90% ya usado en AnimeDetail.jsx/
// EpisodeCard.jsx (v2.1) para el badge "Visto" — reutilizado, no
// inventado. Sin `durationSeconds` registrado se asume incompleto (nunca
// se asume terminado sin un dato real).
function isIncomplete(entry) {
  if (!entry.durationSeconds) return true
  return (entry.secondsWatched / entry.durationSeconds) * 100 < 90
}

// `listHistory` puede traer varias filas por anime (un episodio cada una).
// CLAUDE.md ya documenta que "Continuar viendo" se deriva agrupando por
// `mal_id` y quedándose con la más reciente (`updated_at desc`, orden que
// `listHistory` ya trae) — acá se implementa por primera vez esa derivación
// (History.jsx todavía no lo hace, fuera de alcance de este sprint).
function dedupeHistoryByAnime(history) {
  const byAnime = new Map()
  for (const entry of history) {
    if (!byAnime.has(entry.id)) byAnime.set(entry.id, entry)
  }
  return [...byAnime.values()]
}

function dedupeCandidatesById(candidates) {
  const seen = new Map()
  for (const candidate of candidates) {
    if (candidate?.id && !seen.has(candidate.id)) seen.set(candidate.id, candidate)
  }
  return [...seen.values()]
}

/**
 * FASE 5 — nunca recomendar: ya vistos (cualquier entrada de historial,
 * completa o no — si ya lo empezaste, no es un descubrimiento), favoritos,
 * Mi Lista, ni duplicados dentro del propio resultado.
 */
function excludeEngaged(candidates, engagedIds) {
  const seen = new Set()
  return candidates.filter((candidate) => {
    if (!candidate?.id || engagedIds.has(candidate.id) || seen.has(candidate.id)) return false
    seen.add(candidate.id)
    return true
  })
}

// Enriquecimiento acotado: solo estos `SEED_LIMIT` favoritos + `SEED_LIMIT`
// entradas de historial más recientes llaman a `ProviderManager.getAnime`
// para conocer sus géneros/estudios reales (ver auditoría del sprint: esa
// data no está guardada en `favorites`/`watch_history`). Fallos
// individuales se ignoran (ese anime simplemente no aporta al perfil de
// gustos) — nunca rompe el resto del cálculo.
async function enrichSeeds(seeds, signal) {
  const enrichedById = new Map()
  await Promise.all(
    seeds.map(async (seed) => {
      try {
        const full = await getAnime(seed.id, signal)
        if (full) enrichedById.set(seed.id, { genres: full.genres || [], studios: full.studios || [] })
      } catch (err) {
        if (isAbortError(err)) throw err
        devError('[recommendationEngine] no se pudo enriquecer', seed.id, err)
      }
    }),
  )
  return enrichedById
}

function toContinueWatchingCard(entry) {
  return { id: entry.id, title: entry.title, poster: entry.poster, posterSmall: entry.poster, type: null, year: null, score: null, status: null, genres: [] }
}

/**
 * Recomendaciones de Home para el perfil activo (v2.6, FASE 4/6) — nunca
 * lanza salvo abort real (mismo criterio que `ProviderManager`/
 * `PlaybackProviderManager`: un fallo total de una categoría resuelve a
 * fila vacía, no a una excepción que tumbe todo Home). Devuelve un array
 * de filas ya listas para `MovieRow` (`{ id, title, items }`), en el orden
 * en que deben mostrarse.
 */
export async function getHomeRecommendations({ profileId, candidatePool = [], signal } = {}) {
  if (!profileId) return []

  const cacheKey = `recommendations:${profileId}`
  const cached = getCached(cacheKey)
  if (cached !== undefined) return cached

  const [favorites, watchLater, historyRaw] = await Promise.all([
    listFavorites(profileId).catch((err) => {
      devError('[recommendationEngine] listFavorites falló:', err)
      return []
    }),
    listWatchLater(profileId).catch((err) => {
      devError('[recommendationEngine] listWatchLater falló:', err)
      return []
    }),
    listHistory(profileId).catch((err) => {
      devError('[recommendationEngine] listHistory falló:', err)
      return []
    }),
  ])

  const history = dedupeHistoryByAnime(historyRaw)
  const engagedIds = new Set([...favorites.map((f) => f.id), ...watchLater.map((w) => w.id), ...history.map((h) => h.id)])

  const seeds = dedupeCandidatesById([...favorites.slice(0, SEED_LIMIT), ...history.slice(0, SEED_LIMIT)])
  const enrichedById = await enrichSeeds(seeds, signal)
  const tasteProfile = buildTasteProfile({ favorites, history, watchLater, enrichedById })

  const pool = excludeEngaged(dedupeCandidatesById(candidatePool), engagedIds)
  const ranked = rankCandidates(pool, tasteProfile)

  const rows = []

  // "Sigue viendo" — no es una recomendación calculada, es un pass-through
  // honesto (pedido explícito del sprint como categoría, FASE 4).
  const continueWatching = history.filter(isIncomplete).slice(0, 12)
  if (continueWatching.length) {
    rows.push({ id: 'continue-watching', title: '▶️ Sigue viendo', items: continueWatching.map(toContinueWatchingCard) })
  }

  // "Porque viste {título}" — el anime más reciente del historial (ya
  // viene `updated_at desc`), usando `ProviderManager.getRecommendations`
  // (recomendaciones reales POR ANIME de Jikan/AniList, no una heurística
  // propia) — una señal externa real distinta del ranking por perfil.
  const mostRecent = history[0]
  if (mostRecent) {
    try {
      const perAnime = await getAnimeRecommendations(mostRecent.id, { limit: 12 }, signal)
      const filtered = excludeEngaged(perAnime?.data || [], engagedIds)
      if (filtered.length) {
        rows.push({ id: 'because-watched', title: `Porque viste ${mostRecent.title}`, items: filtered })
      }
    } catch (err) {
      if (isAbortError(err)) throw err
      devError('[recommendationEngine] getRecommendations por anime falló:', err)
    }
  }

  // "Recomendado para ti" — el pool principal, rankeado por las 4 señales.
  if (ranked.length) {
    rows.push({ id: 'for-you', title: '✨ Recomendado para ti', items: ranked.slice(0, 12) })
  }

  // "Descubre algo diferente" — candidatos SIN solapamiento con tus
  // géneros más frecuentes (lo inverso de "Recomendado para ti"), buen
  // score propio como piso de calidad — nunca solo lo más popular al azar.
  const topGenres = new Set(rankedKeys(tasteProfile.genreAffinity).slice(0, 3))
  if (topGenres.size > 0) {
    const different = pool
      .filter((candidate) => !(candidate.genres || []).some((genre) => topGenres.has(genre)))
      .filter((candidate) => typeof candidate.score === 'number' && candidate.score >= 7)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 12)
    if (different.length) {
      rows.push({ id: 'discover-different', title: '🔀 Descubre algo diferente', items: different })
    }
  }

  setCached(cacheKey, rows, RECOMMENDATIONS_CACHE_TTL)
  return rows
}

// Expuesto para testing/depuración puntual (script de verificación del
// sprint) — no lo consume ningún componente directamente.
export const __internal = { scoreCandidate, buildTasteProfile, dedupeHistoryByAnime, excludeEngaged }
