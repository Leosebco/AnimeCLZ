import { anilistRequest } from '@/api/anilist'
import { searchAnime } from './animeService'
import { searchCharacterCandidates } from './characterSearchService'
import { withFallback, isAbortError } from '@/utils/apiCascade'
import { mergeAnimeFields } from '@/providers/models'
import { rankAnimeResults, rankCharacterResults } from '@/utils/searchRanking'
import { devError } from '@/utils/logger'

/**
 * SearchService (v1.7, motor híbrido desde v2.4) — buscador global
 * (`/buscar` y el autocompletar del Navbar). Único punto de entrada:
 * `searchAll(query, filters, signal)` → `{ anime, characters, degraded }`,
 * dos grupos SEPARADOS (a diferencia de `characterSearchService.js`, que
 * fusiona todo en una sola lista para elegir UN avatar — acá el usuario
 * quiere ver "qué animes coinciden" y "qué personajes coinciden" como dos
 * resultados distintos).
 *
 * **v2.4** — búsqueda de texto sin filtros restrictivos: AniList y Jikan se
 * consultan en PARALELO y se FUSIONAN (`searchAnimeFused`/`fuseAnimeLists`,
 * ver más abajo) en vez del cascade anterior (probar uno, si daba 0 probar
 * el otro). Con filtros restrictivos activos (género/tipo/estado/score)
 * sigue siendo cascade con Jikan primero — sin cambios, decisión ya
 * razonada. El resultado final de cada grupo se reordena con
 * `utils/searchRanking.js` (coincidencia exacta/parcial/alias) antes de
 * devolverse — ver la auditoría de causa raíz del sprint v2.4 para el caso
 * real que motivó esto ("Pokémon" con tilde rankeaba peor que sin tilde).
 * Los personajes siguen reusando `characterSearchService.js`.
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
//
// v2.4 — `titleRomaji`/`titleEnglish` son campos NUEVOS, aditivos (nada que
// ya consumía `title` se rompe): permiten que `searchRanking.js` puntúe una
// consulta en romaji (p. ej. "shingeki no kyojin") contra el título real
// aunque `title` ya haya resuelto al inglés ("Attack on Titan") — sin esto,
// el ranking nunca vería el romaji porque `animeTitle()` ya lo descarta.
function mapAniListAnime(node) {
  if (!node.idMal) return null
  const poster = node.coverImage?.large || node.coverImage?.medium || null
  return {
    id: node.idMal,
    title: animeTitle(node.title),
    titleRomaji: node.title?.romaji || null,
    titleEnglish: node.title?.english || null,
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

// v2.4 — fusión real: conserva TODO anime que cualquiera de las dos listas
// conozca; para uno que aparece en ambas, combina campo por campo con
// `mergeAnimeFields` (mismo algoritmo que ya usa `ProviderManager.search()`
// para lo mismo, reutilizado acá como función pura — no se pasa por el
// orquestador, sigue sin tocarse). `primaryList` gana cuando un campo tiene
// datos en ambos lados.
function fuseAnimeLists(primaryList, secondaryList) {
  const byId = new Map()
  for (const item of primaryList) byId.set(item.id, item)
  for (const item of secondaryList) {
    const existing = byId.get(item.id)
    byId.set(item.id, existing ? mergeAnimeFields(existing, item) : item)
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
 * v2.4 — motor híbrido real (antes esto era un `withFallback`: probar
 * AniList, y solo si daba 0 probar Jikan — nunca mostraba resultados de
 * AMBAS fuentes juntos, y "Fusionar resultados... Eliminar duplicados"
 * pedía exactamente eso). Ahora se consultan AniList y Jikan en PARALELO
 * (`Promise.allSettled`, nunca uno depende del otro para arrancar) y se
 * fusionan con `fuseAnimeLists`. Costo real y aceptado: una búsqueda de
 * texto ahora siempre paga la latencia de Jikan también, incluso cuando
 * AniList solo ya alcanzaba — antes esa consulta no se disparaba. Se acepta
 * porque es exactamente lo que pide una fusión de verdad, y el caso más
 * lento (Jikan degradado) ya no compone con una segunda espera secuencial
 * en el grupo de personajes (ver `characterSearchService.js`).
 *
 * `onFailure` solo se dispara si AMBAS fuentes fallan — es la señal real de
 * "ninguna de las dos respondió" para este grupo, no "dio 0 resultados".
 */
async function searchAnimeFused(query, signal, onFailure) {
  const onError = (err, stage) => devError(`[searchService] anime (${stage}) falló:`, err)

  const [aniListOutcome, jikanOutcome] = await Promise.allSettled([
    searchAnimeViaAniList(query, signal),
    searchAnimeViaJikan(query, {}, signal),
  ])

  for (const outcome of [aniListOutcome, jikanOutcome]) {
    if (outcome.status === 'rejected' && isAbortError(outcome.reason)) throw outcome.reason
  }

  if (aniListOutcome.status === 'rejected') onError(aniListOutcome.reason, 'anilist')
  if (jikanOutcome.status === 'rejected') onError(jikanOutcome.reason, 'jikan')

  if (aniListOutcome.status === 'rejected' && jikanOutcome.status === 'rejected') {
    onFailure?.(jikanOutcome.reason)
    return []
  }

  const aniListList = aniListOutcome.status === 'fulfilled' ? aniListOutcome.value : []
  const jikanList = jikanOutcome.status === 'fulfilled' ? jikanOutcome.value : []
  return fuseAnimeLists(aniListList, jikanList)
}

/**
 * Con filtros restrictivos activos (género/tipo/estado/puntuación — no solo
 * Orden/Año), Jikan queda como primario: ya traduce ese vocabulario
 * completo hoy, y armar el mismo mapeo contra los enums de AniList es un
 * trabajo aparte que no hace falta acá. AniList sigue de respaldo (cascada,
 * no fusión) en ese caso — sin cambios respecto a antes de v2.4, decisión
 * ya razonada y no revisitada este sprint.
 */
async function searchAnimeGroup(query, filters, signal, onFailure) {
  const hasRestrictiveFilters = Boolean(filters?.genre || filters?.type || filters?.status || filters?.minScore)

  if (hasRestrictiveFilters) {
    const onError = (err, stage) => devError(`[searchService] anime (${stage}) falló:`, err)
    return withFallback(
      () => searchAnimeViaJikan(query, filters, signal),
      () => searchAnimeViaAniList(query, signal),
      { onError, onFailure },
    )
  }

  return searchAnimeFused(query, signal, onFailure)
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

  // v2.4 — Ranking: reordena lo que ya volvió (coincidencia exacta > empieza
  // con > contiene > alias, con popularidad/score de desempate — ver
  // utils/searchRanking.js) en vez de dejarlo en el orden crudo de la API.
  // Auditoría del sprint confirmó un caso real: "Pokémon" (con tilde)
  // devolvía "Pokémon Evolutions" antes que el anime principal.
  return {
    anime: rankAnimeResults(anime, trimmed),
    characters: rankCharacterResults(characters, trimmed),
    degraded,
  }
}
