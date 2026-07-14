import { anilistRequest } from '@/api/anilist'
import { createStaffMember, createExternalLink } from '../models'

/**
 * Adaptador REAL de AniList para el Provider Engine (v1.9, +`getGallery` en
 * v2.0) — antes era un stub (`createStubProvider`, 21 métodos calcados de
 * Jikan, cada uno lanzaba error). Implementa el contrato de 7 métodos que
 * `ProviderManager.js` espera de cualquier proveedor, sobre la API pública
 * GraphQL de AniList (`anilistRequest`, `src/api/anilist.js` — no se tocó
 * ese archivo, ya es un transporte correcto). Sin scraping: todo campo
 * viene de queries reales contra `graphql.anilist.co`.
 *
 * Nota deliberada: las queries de `search()`/`getCharacters()` se parecen
 * a las que ya existen en `services/searchService.js`/
 * `characterSearchService.js` (buscador global de v1.7) — es una
 * superposición aceptada, no un descuido: ese buscador ya es una función
 * en producción, verificada en vivo, y no se tocó/reutilizó desde acá para
 * no arriesgarla (ver CLAUDE.md).
 */

const ANILIST_FORMAT_LABELS = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
}

const ANILIST_STATUS_LABELS = {
  RELEASING: 'Currently Airing',
  FINISHED: 'Finished Airing',
  NOT_YET_RELEASED: 'Not yet aired',
  CANCELLED: 'Finished Airing',
  HIATUS: 'Currently Airing',
}

// Mismas claves que RELATION_LABELS en constants/index.js, para que un
// grupo de relaciones de AniList use la misma traducción que uno de Jikan
// sin código adicional en la UI el día que esto se conecte.
const ANILIST_RELATION_LABELS = {
  PREQUEL: 'Prequel',
  SEQUEL: 'Sequel',
  SIDE_STORY: 'Side story',
  SPIN_OFF: 'Spin-off',
  ALTERNATIVE: 'Alternative version',
  SUMMARY: 'Summary',
  ADAPTATION: 'Adaptation',
  CHARACTER: 'Character',
  PARENT: 'Parent story',
  OTHER: 'Other',
}

function animeTitle(title) {
  return title?.english || title?.romaji || 'Sin título'
}

function poster(coverImage) {
  return coverImage?.large || coverImage?.medium || null
}

// Misma forma canónica que mapAnime()/mapAnimeDetail() en animeService.js
// — así ProviderManager puede fusionar/completar campos entre proveedores
// sin distinguir de dónde vino cada uno.
function mapAniListAnime(node) {
  if (!node?.idMal) return null
  const posterUrl = poster(node.coverImage)
  return {
    id: node.idMal,
    title: animeTitle(node.title),
    poster: posterUrl,
    posterSmall: node.coverImage?.medium || posterUrl,
    backdrop: posterUrl,
    score: typeof node.averageScore === 'number' ? node.averageScore / 10 : null,
    year: node.seasonYear || node.startDate?.year || null,
    type: ANILIST_FORMAT_LABELS[node.format] || node.format || null,
    episodes: node.episodes ?? null,
    status: ANILIST_STATUS_LABELS[node.status] || node.status || null,
    duration: node.duration ? `${node.duration} min per ep` : null,
    genres: node.genres || [],
    synopsis: node.description || null,
    trailerUrl: node.trailer?.site === 'youtube' && node.trailer?.id
      ? `https://www.youtube.com/embed/${node.trailer.id}`
      : null,
    source: 'anilist',
  }
}

function dedupeAnimeById(list) {
  const byId = new Map()
  for (const item of list) {
    if (item && !byId.has(item.id)) byId.set(item.id, item)
  }
  return [...byId.values()]
}

// v2.7 — Media Hub. Un mismo miembro de staff puede aparecer en varios
// `edges` (un rol distinto cada vez, p. ej. "Director" y "Storyboard") —
// se agrupan por persona y sus roles se unen en un solo string, en vez de
// mostrar la misma cara varias veces en la grilla.
function mapStaff(staffField) {
  const edges = staffField?.edges || []
  const byPerson = new Map()
  for (const edge of edges) {
    const node = edge?.node
    const name = node?.name?.full
    if (!node?.id || !name) continue
    const existing = byPerson.get(node.id)
    if (existing) {
      if (edge.role) existing.roles.push(edge.role)
    } else {
      byPerson.set(node.id, {
        id: node.id,
        name,
        image: node.image?.medium || null,
        roles: edge.role ? [edge.role] : [],
      })
    }
  }
  return [...byPerson.values()].map((person) =>
    createStaffMember({
      id: `anilist:${person.id}`,
      name: person.name,
      role: person.roles.join(', ') || null,
      image: person.image,
      provider: 'anilist',
    }),
  )
}

// v2.7 — Media Hub. `externalLinks` mezcla plataformas de streaming
// (`type: 'STREAMING'`) con enlaces informativos (sitio oficial, redes
// sociales) bajo el mismo campo — se separan acá, una sola vez, para que
// `getAnime()` exponga dos listas ya listas para sus respectivas secciones.
// Los enlaces marcados `isDisabled` por AniList (rotos/discontinuados) se
// descartan — mostrarlos sería ofrecer un link que la propia fuente ya
// sabe que no funciona.
function mapExternalLinks(linksField) {
  const links = (linksField || []).filter((link) => link?.url && !link.isDisabled)
  const streamingPlatforms = links
    .filter((link) => link.type === 'STREAMING')
    .map((link) =>
      createExternalLink({
        id: `anilist:${link.id}`,
        name: link.site,
        url: link.url,
        type: link.type,
        icon: link.icon,
        color: link.color,
        language: link.language,
        note: link.notes,
        provider: 'anilist',
      }),
    )
  const officialLinks = links
    .filter((link) => link.type !== 'STREAMING')
    .map((link) =>
      createExternalLink({
        id: `anilist:${link.id}`,
        name: link.site,
        url: link.url,
        type: link.type,
        icon: link.icon,
        color: link.color,
        language: link.language,
        note: link.notes,
        provider: 'anilist',
      }),
    )
  return { officialLinks, streamingPlatforms }
}

// v2.7 — Media Hub. `anime.studios` (string[]) sigue viniendo de Jikan sin
// cambios (lo consume InfoGrid/StudioCard tal como está) — esto es un
// campo NUEVO y aparte, solo para enlazar cada estudio a su página real en
// AniList cuando el nombre coincide (`StudioCard` decide qué hacer si no
// hay match, ver ese componente).
function mapStudioLinks(studiosField) {
  const nodes = studiosField?.nodes || []
  return nodes
    .filter((studio) => studio?.name && studio?.siteUrl)
    .map((studio) => ({ name: studio.name, siteUrl: studio.siteUrl }))
}

const SEARCH_QUERY = `
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

export async function search(query, filters, signal) {
  const data = await anilistRequest(SEARCH_QUERY, { search: query, perPage: 15 }, signal)
  const results = (data?.Page?.media || []).map(mapAniListAnime).filter(Boolean)
  return dedupeAnimeById(results)
}

const ANIME_QUERY = `
query ($id: Int) {
  Media(idMal: $id, type: ANIME) {
    idMal
    title { romaji english native }
    coverImage { large medium }
    averageScore
    seasonYear
    startDate { year }
    format
    status
    genres
    episodes
    duration
    season
    description(asHtml: false)
    trailer { id site }
    studios(isMain: true) { nodes { id name siteUrl } }
    staff(perPage: 10, sort: RELEVANCE) {
      edges { role node { id name { full } image { medium } } }
    }
    externalLinks { id url site type language icon color notes isDisabled }
  }
}
`

export async function getAnime(id, signal) {
  const data = await anilistRequest(ANIME_QUERY, { id: Number(id) }, signal)
  const media = data?.Media
  if (!media) return null

  const base = mapAniListAnime(media)
  if (!base) return null

  const { officialLinks, streamingPlatforms } = mapExternalLinks(media.externalLinks)

  return {
    ...base,
    titleJapanese: media.title?.native || null,
    // AniList no tiene un equivalente real de rank/popularity/producers/
    // licensors/themes/demographics de MAL — dejarlos vacíos a propósito
    // para que el merge los complete siempre desde Jikan, en vez de
    // mapear un campo de AniList que mide algo distinto bajo ese nombre.
    rank: null,
    popularity: null,
    season: media.season?.toLowerCase() || null,
    rating: null,
    studios: [],
    producers: [],
    licensors: [],
    themes: [],
    demographics: [],
    // v2.7 — Media Hub: los 4 campos siguientes son exclusivos de AniList,
    // sin equivalente de fallback en Jikan (ver JikanProvider.js — no se
    // tocó, `mergeAnimeFields` ya trata una clave ausente como vacía).
    staff: mapStaff(media.staff),
    studioLinks: mapStudioLinks(media.studios),
    officialLinks,
    streamingPlatforms,
  }
}

// El schema público de AniList no tiene listado de episodios individuales
// (solo el conteo agregado `episodes` en Media) — no hay ninguna llamada
// real que hacer acá. Esto es un no-op permanente y deliberado, no un
// stub pendiente: no se debe "completar" inventando datos de episodio.
export async function getEpisodes() {
  return { data: [], pagination: { hasNextPage: false, currentPage: 1, lastPage: 1 } }
}

const CHARACTERS_QUERY = `
query ($id: Int) {
  Media(idMal: $id, type: ANIME) {
    characters(sort: [ROLE, RELEVANCE], perPage: 12) {
      edges {
        role
        voiceActors(language: JAPANESE) { name { full } }
        node { id name { full } image { large medium } }
      }
    }
  }
}
`

export async function getCharacters(id, signal) {
  const data = await anilistRequest(CHARACTERS_QUERY, { id: Number(id) }, signal)
  const edges = data?.Media?.characters?.edges || []
  return edges
    .filter((edge) => edge.role === 'MAIN' && edge.node)
    .map((edge) => ({
      id: `anilist:${edge.node.id}`,
      name: edge.node.name?.full,
      role: 'Main',
      image: edge.node.image?.large || edge.node.image?.medium || null,
      voiceActor: edge.voiceActors?.[0]?.name?.full || null,
      source: 'anilist',
    }))
}

const RELATIONS_QUERY = `
query ($id: Int) {
  Media(idMal: $id, type: ANIME) {
    relations {
      edges {
        relationType
        node { idMal title { romaji english } type }
      }
    }
  }
}
`

export async function getRelations(id, signal) {
  const data = await anilistRequest(RELATIONS_QUERY, { id: Number(id) }, signal)
  const edges = data?.Media?.relations?.edges || []
  const groups = new Map()

  for (const edge of edges) {
    const node = edge.node
    if (!node || node.type !== 'ANIME' || !node.idMal) continue
    const relation = ANILIST_RELATION_LABELS[edge.relationType] || edge.relationType
    if (!groups.has(relation)) groups.set(relation, [])
    groups.get(relation).push({
      mal_id: node.idMal,
      name: animeTitle(node.title),
      type: 'anime',
      url: `https://myanimelist.net/anime/${node.idMal}`,
    })
  }

  return [...groups.entries()].map(([relation, items]) => ({ relation, items }))
}

const RECOMMENDATIONS_QUERY = `
query ($id: Int, $perPage: Int) {
  Media(idMal: $id, type: ANIME) {
    recommendations(sort: RATING_DESC, perPage: $perPage) {
      nodes {
        mediaRecommendation { idMal title { romaji english } coverImage { large medium } averageScore }
      }
    }
  }
}
`

export async function getRecommendations(id, { limit = 12 } = {}, signal) {
  const data = await anilistRequest(RECOMMENDATIONS_QUERY, { id: Number(id), perPage: limit }, signal)
  const nodes = data?.Media?.recommendations?.nodes || []
  const results = nodes.map((node) => mapAniListAnime(node.mediaRecommendation)).filter(Boolean)
  return { data: results, pagination: { hasNextPage: false, currentPage: 1, lastPage: 1 } }
}

// v2.0 — el schema público de AniList solo expone campos únicos
// (`coverImage`/`bannerImage`), sin un concepto de galería de imágenes
// promocionales como el de Jikan. No-op permanente, mismo criterio que
// `getEpisodes()` arriba — no inventar datos.
export async function getGallery() {
  return []
}
