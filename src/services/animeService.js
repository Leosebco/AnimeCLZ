import jikan from '@/api/jikan'

// Canonical anime model used by lists/cards (Home, catalog pages, search,
// favorites). Kept lean on purpose — components never see the raw Jikan
// payload.
function mapAnime(raw) {
  return {
    id: raw.mal_id,
    title: raw.title,
    poster: raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || null,
    backdrop: raw.images?.jpg?.large_image_url || null,
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
  return {
    id: entry.mal_id,
    title: entry.title,
    poster: entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url || null,
    backdrop: entry.images?.jpg?.large_image_url || null,
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
  const { query, genre, type, orderBy, sort, year, page = 1, limit = 20 } = filters

  const params = { page, limit }
  if (orderBy) params.order_by = orderBy
  if (sort) params.sort = sort
  if (query) params.q = query.trim()
  if (genre) params.genres = genre
  if (type) params.type = type
  if (year) {
    params.start_date = `${year}-01-01`
    params.end_date = `${year}-12-31`
  }

  return fetchList('/anime', params, signal)
}

export async function searchAnime(query, filters = {}, signal) {
  return discoverAnime({ ...filters, query }, signal)
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
