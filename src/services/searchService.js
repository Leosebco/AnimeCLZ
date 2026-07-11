import { anilistRequest } from '@/api/anilist'
import { searchAnime } from './animeService'
import { searchCharacterCandidates } from './characterSearchService'
import { withFallback, isAbortError } from '@/utils/apiCascade'
import { devError } from '@/utils/logger'

/**
 * SearchService (v1.7) — buscador global (`/buscar` y el autocompletar del
 * Navbar). Único punto de entrada: `searchAll(query, signal)` →
 * `{ anime, characters }`, dos grupos SEPARADOS (a diferencia de
 * `characterSearchService.js`, que fusiona todo en una sola lista para
 * elegir UN avatar — acá el usuario quiere ver "qué animes coinciden" y
 * "qué personajes coinciden" como dos resultados distintos, tal como
 * muestran los ejemplos del pedido: "Naruto" → animes Naruto/Naruto
 * Shippuden/Boruto + personajes Naruto Uzumaki/Sasuke/Kakashi).
 *
 * AniList primero (múltiples resultados de anime, no solo "el mejor
 * match" como en el selector de avatar) → si falla o da 0, Jikan de
 * respaldo (`searchAnime`, ya existente, sin tocar). Los personajes
 * reusan `characterSearchService.js` — misma cascada, sin duplicar la
 * query GraphQL una segunda vez.
 *
 * Por qué se puede linkear un resultado de AniList al detalle real
 * (100% Jikan, sin duplicar esa página): AniList expone `idMal` en cada
 * anime — el mismo id de MyAnimeList. Verificado en vivo: buscar "Naruto"
 * en AniList da `idMal: 20`, el mal_id real. Un resultado sin `idMal`
 * (raro — entradas no cruzadas con MAL) se descarta: no tiene detalle al
 * que navegar en esta app.
 */
const ANILIST_ANIME_SEARCH = `
query ($search: String, $perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      idMal
      title { romaji english }
      coverImage { large medium }
      averageScore
      seasonYear
      startDate { year }
      format
      status
      genres
      episodes
      description(asHtml: false)
    }
  }
}
`

const ANILIST_FORMAT_LABELS = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
}

// Mismas claves que STATUS_LABELS en constants/index.js — así un resultado
// de AniList usa el mismo lookup de traducción que ya usan Hero/AnimeCard
// para uno de Jikan, sin código extra.
const ANILIST_STATUS_LABELS = {
  RELEASING: 'Currently Airing',
  FINISHED: 'Finished Airing',
  NOT_YET_RELEASED: 'Not yet aired',
  CANCELLED: 'Finished Airing',
  HIATUS: 'Currently Airing',
}

function animeTitle(title) {
  return title?.english || title?.romaji || 'Sin título'
}

// Misma forma canónica que `mapAnime()` en animeService.js — así
// AnimeCard/MovieGrid renderizan un resultado de AniList sin distinguir la
// fuente. Se descartan entradas sin `idMal`: no tienen detalle real al que
// navegar en esta app (AnimeDetail.jsx es 100% Jikan, a propósito).
function mapAniListAnime(node) {
  if (!node.idMal) return null
  const poster = node.coverImage?.large || node.coverImage?.medium || null
  return {
    id: node.idMal,
    title: animeTitle(node.title),
    poster,
    posterSmall: node.coverImage?.medium || poster,
    backdrop: poster,
    score: typeof node.averageScore === 'number' ? node.averageScore / 10 : null,
    year: node.seasonYear || node.startDate?.year || null,
    type: ANILIST_FORMAT_LABELS[node.format] || node.format || null,
    episodes: node.episodes ?? null,
    status: ANILIST_STATUS_LABELS[node.status] || node.status || null,
    duration: null,
    genres: node.genres || [],
    synopsis: node.description || null,
    trailerUrl: null,
    source: 'anilist',
  }
}

function dedupeAnimeById(list) {
  const byId = new Map()
  for (const item of list) {
    if (!byId.has(item.id)) byId.set(item.id, item)
  }
  return [...byId.values()]
}

async function searchAnimeViaAniList(query, signal) {
  const data = await anilistRequest(ANILIST_ANIME_SEARCH, { search: query, perPage: 15 }, signal)
  const results = (data?.Page?.media || []).map(mapAniListAnime).filter(Boolean)
  return dedupeAnimeById(results)
}

async function searchAnimeViaJikan(query, filters, signal) {
  const { data } = await searchAnime(query, filters, signal)
  return data
}

/**
 * Búsqueda de anime. Con filtros restrictivos activos (género/tipo/estado/
 * puntuación — no solo Orden/Año), Jikan queda como primario: ya traduce
 * ese vocabulario completo hoy, y armar el mismo mapeo contra los enums de
 * AniList es un trabajo aparte que no hace falta para el síntoma reportado
 * (la búsqueda de TEXTO sin filtrar es la que fallaba). AniList sigue de
 * respaldo también en ese caso — nunca depende únicamente de Jikan.
 *
 * `onFailure` solo se dispara si TAMBIÉN falló el respaldo (ver
 * `withFallback` en utils/apiCascade.js) — es la señal real de "ninguna de
 * las dos fuentes respondió" para este grupo, no "dio 0 resultados".
 */
async function searchAnimeGroup(query, filters, signal, onFailure) {
  const hasRestrictiveFilters = Boolean(filters?.genre || filters?.type || filters?.status || filters?.minScore)
  const onError = (err, stage) => devError(`[searchService] anime (${stage}) falló:`, err)

  if (hasRestrictiveFilters) {
    return withFallback(
      () => searchAnimeViaJikan(query, filters, signal),
      () => searchAnimeViaAniList(query, signal),
      { onError, onFailure },
    )
  }

  return withFallback(
    () => searchAnimeViaAniList(query, signal),
    () => searchAnimeViaJikan(query, filters, signal),
    { onError, onFailure },
  )
}

// `degraded: true` significa "ni AniList ni Jikan respondieron" para al
// menos uno de los dos grupos, Y el resultado final quedó vacío — nunca se
// expone un código de estado HTTP en la UI, `Search.jsx` solo usa este
// booleano para elegir entre "sin resultados" (búsqueda sana, 0 matches
// genuinos) y un mensaje amigable de "no pudimos completar la búsqueda"
// (ambas fuentes caídas a la vez — raro, pero real).
export async function searchAll(query, filters, signal) {
  const trimmed = query.trim()
  if (!trimmed) return { anime: [], characters: [], degraded: false }

  let animeFailed = false
  let charactersFailed = false

  const [anime, characters] = await Promise.all([
    searchAnimeGroup(trimmed, filters, signal, () => {
      animeFailed = true
    }).catch((err) => {
      if (isAbortError(err)) throw err
      animeFailed = true
      return []
    }),
    searchCharacterCandidates(trimmed, signal, () => {
      charactersFailed = true
    }).catch((err) => {
      if (isAbortError(err)) throw err
      charactersFailed = true
      return []
    }),
  ])

  const degraded = (animeFailed || charactersFailed) && anime.length === 0 && characters.length === 0
  return { anime, characters, degraded }
}
