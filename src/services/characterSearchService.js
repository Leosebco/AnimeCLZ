import jikan from '@/api/jikan'
import { anilistRequest } from '@/api/anilist'
import { searchAnime, searchCharacters } from './animeService'
import { withFallback, isAbortError } from '@/utils/apiCascade'
import { devError } from '@/utils/logger'

/**
 * Búsqueda de personajes de anime — AniList primero, Jikan de respaldo.
 * Extraído en v1.7 de `avatarSearchService.js` (que hoy solo re-exporta
 * esto con su nombre original, ver ese archivo) porque la búsqueda global
 * (`searchService.js`) necesita exactamente la misma capacidad para su
 * grupo "Personajes" — un único punto de verdad en vez de dos copias de la
 * misma query GraphQL.
 *
 * Por qué una sola query con dos ramas y no "detectar si es un anime o un
 * personaje": verificado en vivo contra graphql.anilist.co — buscar
 * "Naruto" encuentra el anime y trae su elenco (Naruto, Sasuke, Kakashi...)
 * en `animeMatch`; buscar "Gojo" no encuentra ningún anime con ese título
 * (`animeMatch` vacío) pero sí encuentra "Satoru Gojou" en `characterMatch`.
 * Fusionar ambas ramas ya produce el comportamiento pedido sin heurística.
 */
const ANILIST_QUERY = `
query ($search: String) {
  animeMatch: Page(page: 1, perPage: 1) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      title { romaji english }
      characters(sort: [ROLE, RELEVANCE], perPage: 15) {
        edges {
          role
          node { id name { full } image { large medium } }
        }
      }
    }
  }
  characterMatch: Page(page: 1, perPage: 10) {
    characters(search: $search, sort: SEARCH_MATCH) {
      id
      name { full }
      image { large medium }
      media(perPage: 1, sort: POPULARITY_DESC) {
        edges {
          characterRole
          node { title { romaji english } }
        }
      }
    }
  }
}
`

export function roleLabel(role) {
  if (!role) return null
  const key = String(role).toUpperCase()
  if (key === 'MAIN') return 'Principal'
  if (key === 'SUPPORTING') return 'Secundario'
  if (key === 'BACKGROUND') return 'Antecedente'
  return null
}

function animeTitle(title) {
  return title?.english || title?.romaji || null
}

function fromAniListAnimeMatch(media) {
  if (!media) return []
  const anime = animeTitle(media.title)
  return (media.characters?.edges || [])
    .filter((edge) => edge.node)
    .map((edge) => ({
      id: `anilist:${edge.node.id}`,
      source: 'anilist',
      name: edge.node.name?.full,
      image: edge.node.image?.large || edge.node.image?.medium || null,
      anime,
      role: roleLabel(edge.role),
    }))
}

function fromAniListCharacterMatch(characters) {
  return (characters || []).map((character) => {
    const edge = character.media?.edges?.[0]
    return {
      id: `anilist:${character.id}`,
      source: 'anilist',
      name: character.name?.full,
      image: character.image?.large || character.image?.medium || null,
      anime: animeTitle(edge?.node?.title),
      role: roleLabel(edge?.characterRole),
    }
  })
}

// Prioriza, al deduplicar, la versión de un mismo personaje que ya trae
// `role` (la rama animeMatch casi siempre lo tiene; characterMatch a veces
// no, si el personaje no tiene datos de "media" resueltos en AniList).
export function dedupeCharactersById(list) {
  const byId = new Map()
  for (const item of list) {
    if (!item.name) continue
    const existing = byId.get(item.id)
    if (!existing || (!existing.role && item.role)) byId.set(item.id, item)
  }
  return [...byId.values()]
}

async function searchViaAniList(query, signal) {
  const data = await anilistRequest(ANILIST_QUERY, { search: query }, signal)
  const fromAnime = fromAniListAnimeMatch(data?.animeMatch?.media?.[0])
  const fromCharacters = fromAniListCharacterMatch(data?.characterMatch?.characters)
  return dedupeCharactersById([...fromAnime, ...fromCharacters])
}

async function jikanAnimeCharacters(animeId, anime, signal) {
  const response = await jikan.get(`/anime/${animeId}/characters`, { signal })
  return response.data.data.slice(0, 15).map((entry) => ({
    id: `jikan:${entry.character.mal_id}`,
    source: 'jikan',
    name: entry.character.name,
    image: entry.character.images?.jpg?.image_url || null,
    anime,
    role: roleLabel(entry.role),
  }))
}

// Respaldo de Jikan: busca primero por título de anime (si hay match, trae
// su elenco con rol incluido en una sola llamada); además intenta la
// búsqueda directa de personaje por nombre (`/characters?q=`), que por
// limitación real y ya documentada de ese endpoint de Jikan NO trae anime
// ni rol — se muestra igual, sin esos dos campos (opcionales en la
// tarjeta), en vez de hacer una llamada extra por resultado para
// resolverlos (sería lento para un respaldo-de-un-respaldo).
async function searchViaJikan(query, signal) {
  const results = []

  try {
    const { data: animeResults } = await searchAnime(query, { limit: 1 }, signal)
    const bestMatch = animeResults?.[0]
    if (bestMatch) {
      const characters = await jikanAnimeCharacters(bestMatch.id, bestMatch.title, signal)
      results.push(...characters)
    }
  } catch (err) {
    if (isAbortError(err)) throw err
    devError('[characterSearchService] Jikan: búsqueda de anime falló:', err)
  }

  try {
    const characters = await searchCharacters(query, signal)
    results.push(
      ...characters.map((character) => ({
        id: `jikan:${character.id}`,
        source: 'jikan',
        name: character.name,
        image: character.image,
        anime: null,
        role: null,
      })),
    )
  } catch (err) {
    if (isAbortError(err)) throw err
    devError('[characterSearchService] Jikan: búsqueda de personaje falló:', err)
  }

  return dedupeCharactersById(results)
}

export async function searchCharacterCandidates(query, signal, onFailure) {
  const trimmed = query.trim()
  if (!trimmed) return []

  return withFallback(() => searchViaAniList(trimmed, signal), () => searchViaJikan(trimmed, signal), {
    onError: (err, stage) => devError(`[characterSearchService] ${stage} falló:`, err),
    onFailure,
  })
}
