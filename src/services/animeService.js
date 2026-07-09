import jikan from '@/api/jikan'

// ---------------------------------------------------------------------
// Data source note (v0.8): every function below talks to Jikan directly.
// The canonical model (mapAnime/mapAnimeDetail) is what the rest of the
// app actually consumes — pages/hooks never see Jikan's raw shape. That
// separation is deliberate groundwork for a future Supabase migration:
// when AnimeCLZ gets its own database, this file's exported function
// *signatures* (getTopRated, discoverAnime, getAnimeById, ...) stay the
// same, but their bodies would read from Supabase first and only fall
// back to Jikan as an on-demand importer for anime Supabase doesn't have
// yet. No code elsewhere needs to change for that swap. See ROADMAP.md
// "Sprint 4+" for the planned repository split.
// ---------------------------------------------------------------------

// Canonical anime model used by lists/cards (Home, catalog pages, search,
// favorites). Kept lean on purpose — components never see the raw Jikan
// payload. `poster`/`posterSmall` are exposed separately so components can
// build a real `srcset` instead of upscaling a single small image.
function mapAnime(raw) {
  const posterLarge = raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || null
  const posterSmall = raw.images?.jpg?.image_url || posterLarge

  return {
    id: raw.mal_id,
    title: raw.title,
    poster: posterLarge,
    posterSmall,
    backdrop: posterLarge,
    score: typeof raw.score === 'number' ? raw.score : null,
    year: raw.year || raw.aired?.prop?.from?.year || null,
    type: raw.type || null,
    episodes: raw.episodes ?? null,
    status: raw.status || null,
    duration: raw.duration || null,
    genres: raw.genres?.map((g) => g.name) || [],
    synopsis: raw.synopsis || null,
    trailerUrl: raw.trailer?.embed_url || null,
  }
}

// Extended model for the anime detail page — same base fields as mapAnime
// plus everything AnimeDetail needs (ranking, staff, classification, etc.).
function mapAnimeDetail(raw) {
  return {
    ...mapAnime(raw),
    titleJapanese: raw.title_japanese || null,
    rank: raw.rank ?? null,
    popularity: raw.popularity ?? null,
    season: raw.season || null,
    rating: raw.rating || null,
    studios: raw.studios?.map((s) => s.name) || [],
    producers: raw.producers?.map((p) => p.name) || [],
    licensors: raw.licensors?.map((l) => l.name) || [],
    themes: raw.themes?.map((t) => t.name) || [],
    demographics: raw.demographics?.map((d) => d.name) || [],
  }
}

// Recommendation feeds (both the global Home feed and the per-anime one)
// only return id/title/image per entry — never fabricate the missing
// score/genres/year, just leave them null/empty like the rest of the app.
function mapSparseAnime(entry) {
  const posterLarge = entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url || null
  return {
    id: entry.mal_id,
    title: entry.title,
    poster: posterLarge,
    posterSmall: entry.images?.jpg?.image_url || posterLarge,
    backdrop: posterLarge,
    score: null,
    year: null,
    type: null,
    episodes: null,
    status: null,
    duration: null,
    genres: [],
    synopsis: null,
    trailerUrl: null,
  }
}

function mapPagination(pagination) {
  return {
    hasNextPage: Boolean(pagination?.has_next_page),
    currentPage: pagination?.current_page ?? 1,
    lastPage: pagination?.last_visible_page ?? 1,
  }
}

// Jikan occasionally repeats the same mal_id within a single page under
// load (its cache layer is known to be flaky) — dedupe defensively so React
// list keys stay unique regardless of upstream quirks.
function dedupeById(list) {
  const seen = new Set()
  return list.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

async function fetchList(path, params, signal) {
  const response = await jikan.get(path, { params, signal })
  return {
    data: dedupeById(response.data.data.map(mapAnime)),
    pagination: mapPagination(response.data.pagination),
  }
}

export async function getTrending({ page = 1, limit = 12 } = {}, signal) {
  return fetchList('/top/anime', { filter: 'airing', page, limit }, signal)
}

export async function getTopRated({ page = 1, limit = 12 } = {}, signal) {
  return fetchList('/top/anime', { page, limit }, signal)
}

export async function getCurrentSeason({ page = 1, limit = 12 } = {}, signal) {
  return fetchList('/seasons/now', { page, limit }, signal)
}

export async function getMovies({ page = 1, limit = 12 } = {}, signal) {
  return fetchList(
    '/anime',
    { type: 'movie', order_by: 'popularity', sort: 'asc', page, limit },
    signal,
  )
}

// "Más Populares" (member count, filter=bypopularity) is a distinct MAL
// ranking from "Top Anime" (overall rank) and "Mejor Valorados" (raw score).
export async function getMostPopular({ page = 1, limit = 12 } = {}, signal) {
  return fetchList('/top/anime', { filter: 'bypopularity', page, limit }, signal)
}

export async function getBestRated({ page = 1, limit = 12 } = {}, signal) {
  return fetchList('/anime', { order_by: 'score', sort: 'desc', page, limit }, signal)
}

// Jikan has no personalized recommendations (no user auth). The public
// "recent recommendations" feed pairs two real anime per entry — we flatten
// and dedupe those pairs into a single real (never fabricated) list.
export async function getRecommendations({ limit = 12 } = {}, signal) {
  const response = await jikan.get('/recommendations/anime', { signal })
  const seen = new Set()
  const data = []

  for (const rec of response.data.data) {
    for (const entry of rec.entry) {
      if (data.length >= limit || seen.has(entry.mal_id)) continue
      seen.add(entry.mal_id)
      data.push(mapSparseAnime(entry))
    }
  }

  return { data, pagination: { hasNextPage: false, currentPage: 1, lastPage: 1 } }
}

export async function getAnimeByGenre(genreId, { page = 1, limit = 12 } = {}, signal) {
  return fetchList(
    '/anime',
    { genres: genreId, order_by: 'popularity', sort: 'asc', page, limit },
    signal,
  )
}

// `orderBy`/`sort` are intentionally NOT defaulted here. Forcing a sort on
// top of a text search (`q`) adds real load on MAL's search backend and
// made the search endpoint fail far more often in practice — and it isn't
// meaningful anyway, since relevance (Jikan/MAL's own default) is what a
// name search actually needs. Explorar (no query) supplies its own default
// order; Buscar only forwards one if the user explicitly picked it.
export async function discoverAnime(filters = {}, signal) {
  const { query, genre, type, status, minScore, orderBy, sort, year, page = 1, limit = 20 } = filters

  const params = { page, limit }
  if (orderBy) params.order_by = orderBy
  if (sort) params.sort = sort
  if (query) params.q = query.trim()
  if (genre) params.genres = genre
  if (type) params.type = type
  if (status) params.status = status
  if (minScore) params.min_score = minScore
  if (year) {
    params.start_date = `${year}-01-01`
    params.end_date = `${year}-12-31`
  }

  return fetchList('/anime', params, signal)
}

export async function searchAnime(query, filters = {}, signal) {
  return discoverAnime({ ...filters, query }, signal)
}

// Lightweight, unpaginated version of discoverAnime used by the Navbar's
// instant-results dropdown — same endpoint/relevance ordering, just capped
// small so the preview stays snappy.
export async function quickSearchAnime(query, signal) {
  if (!query.trim()) return []
  const { data } = await discoverAnime({ query, limit: 5 }, signal)
  return data
}

export async function getAnimeById(id, signal) {
  const response = await jikan.get(`/anime/${id}`, { signal })
  return mapAnimeDetail(response.data.data)
}

// Main cast only ("Personajes principales") — each entry already carries
// the Japanese voice actor when Jikan has one on file.
export async function getAnimeCharacters(id, signal) {
  const response = await jikan.get(`/anime/${id}/characters`, { signal })
  return response.data.data
    .filter((entry) => entry.role === 'Main')
    .slice(0, 12)
    .map((entry) => {
      const voiceActor = entry.voice_actors?.find((va) => va.language === 'Japanese')
      return {
        id: entry.character.mal_id,
        name: entry.character.name,
        role: entry.role,
        image: entry.character.images?.jpg?.image_url || null,
        voiceActor: voiceActor?.person?.name || null,
      }
    })
}

// Real episode list (number/title/air date) — Jikan doesn't host video, so
// this is metadata only, not a player. Still real, useful information (as
// MAL/AniList themselves show), unlike a placeholder list with nothing behind it.
export async function getAnimeEpisodes(id, { page = 1, limit = 12 } = {}, signal) {
  const response = await jikan.get(`/anime/${id}/episodes`, { params: { page, limit }, signal })
  return {
    data: response.data.data.map((ep) => ({
      id: ep.mal_id,
      number: ep.mal_id,
      title: ep.title || ep.title_romanji || `Episodio ${ep.mal_id}`,
      aired: ep.aired || null,
      score: typeof ep.score === 'number' ? ep.score : null,
      filler: Boolean(ep.filler),
    })),
    pagination: mapPagination(response.data.pagination),
  }
}

// Per-anime recommendations, shown as a carousel reusing AnimeCard/MovieRow.
export async function getAnimeRecommendations(id, { limit = 12 } = {}, signal) {
  const response = await jikan.get(`/anime/${id}/recommendations`, { signal })
  const data = response.data.data.slice(0, limit).map((rec) => mapSparseAnime(rec.entry))
  return { data, pagination: { hasNextPage: false, currentPage: 1, lastPage: 1 } }
}

// Relations only carry id/type/name/url (no images/score) — grouped by
// relation type (Prequel, Sequel, Spin-off, OVA, Movie, Special...) for a
// lightweight linked list instead of fetching full details per entry.
export async function getAnimeRelations(id, signal) {
  const response = await jikan.get(`/anime/${id}/relations`, { signal })
  return response.data.data
    .map((group) => ({
      relation: group.relation,
      items: group.entry.filter((entry) => entry.type === 'anime'),
    }))
    .filter((group) => group.items.length > 0)
}

export async function getAnimePictures(id, signal) {
  const response = await jikan.get(`/anime/${id}/pictures`, { signal })
  return response.data.data.map((picture) => ({
    small: picture.jpg?.image_url || null,
    large: picture.jpg?.large_image_url || picture.jpg?.image_url || null,
  }))
}

// Picks a random entry from the current top-rated list so the Home hero
// always shows a real, well-known anime — never a fabricated "featured" pick.
export async function getFeaturedAnime(signal) {
  const { data } = await getTopRated({ limit: 20 }, signal)
  if (!data.length) return null
  return data[Math.floor(Math.random() * data.length)]
}

// Several real, distinct top-rated picks for the Hero carousel — shuffled
// client-side so the same handful of titles don't always land in the same
// order, still 100% real data (no fabricated "featured" flag anywhere).
export async function getFeaturedSlides({ count = 6 } = {}, signal) {
  const { data } = await getTopRated({ limit: 20 }, signal)
  const shuffled = [...data].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Búsqueda global de personajes — usada por el selector de avatar "elegir
// un personaje de anime" (ver AvatarPicker.jsx). A diferencia de
// getAnimeCharacters (personajes DE un anime), este endpoint (/characters)
// no devuelve a qué anime pertenece cada personaje en la respuesta de
// lista — por eso el grid de resultados solo muestra imagen + nombre; el
// anime real se resuelve aparte (getCharacterAnime) solo para el personaje
// que el usuario efectivamente selecciona, no para los 12 de golpe.
export async function searchCharacters(query, signal) {
  if (!query.trim()) return []
  const response = await jikan.get('/characters', { params: { q: query.trim(), limit: 12 }, signal })
  return response.data.data.map((character) => ({
    id: character.mal_id,
    name: character.name,
    image: character.images?.jpg?.image_url || null,
  }))
}

// Solo se llama al confirmar un personaje elegido en AvatarPicker — para
// mostrar "Naruto Uzumaki — Naruto" antes de guardar, no en el grid.
export async function getCharacterAnime(id, signal) {
  const response = await jikan.get(`/characters/${id}`, { signal })
  return response.data.data.anime?.[0]?.anime?.title || null
}
