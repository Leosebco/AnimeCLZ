/**
 * Ranking de resultados de búsqueda (v2.4) — antes los resultados se
 * mostraban en el orden crudo que devolvía AniList/Jikan. Auditoría del
 * sprint encontró un caso real y reproducible de por qué eso no alcanza:
 * buscar "Pokémon" (con tilde) devuelve "Pokémon Evolutions" primero en
 * AniList, no el anime principal "Pokémon" — el motor de relevancia de
 * AniList no normaliza acentos de forma consistente contra su propio
 * índice. Esta capa se agrega DESPUÉS de fusionar resultados, nunca
 * reemplaza la búsqueda en sí (que sigue siendo responsabilidad 100% de
 * AniList/Jikan) — solo reordena lo que ya volvió.
 *
 * Normaliza (minúsculas + sin diacríticos) antes de comparar, así
 * "Pokémon"/"Pokemon"/"POKEMON" puntúan igual contra el mismo título.
 */
export function normalizeForMatch(text) {
  if (!text) return ''
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Cuanto más alto, mejor — coincidencia exacta > empieza con > contiene >
// alias (contiene en un título secundario) > sin coincidencia de texto
// directa (se ordena solo por popularidad/score como último criterio).
const SCORE_EXACT = 100
const SCORE_STARTS_WITH = 80
const SCORE_CONTAINS = 50
const SCORE_ALIAS = 30
const SCORE_NONE = 0

function titleMatchScore(normalizedQuery, normalizedTitle) {
  if (!normalizedTitle) return SCORE_NONE
  if (normalizedTitle === normalizedQuery) return SCORE_EXACT
  if (normalizedTitle.startsWith(normalizedQuery)) return SCORE_STARTS_WITH
  if (normalizedTitle.includes(normalizedQuery)) return SCORE_CONTAINS
  return SCORE_NONE
}

/**
 * Puntúa un anime contra la búsqueda — compara el título principal
 * (`title`) con el peso más alto, y los alias disponibles (`titleRomaji`/
 * `titleEnglish`/`synonyms`, cuando el proveedor los expone) con un techo
 * más bajo (`SCORE_ALIAS`) — así un anime cuyo alias contiene la consulta
 * nunca supera a otro cuyo título principal la contiene, pero sigue
 * ganándole a uno sin ninguna coincidencia de texto.
 */
export function scoreAnimeMatch(anime, normalizedQuery) {
  if (!normalizedQuery) return SCORE_NONE
  const mainScore = titleMatchScore(normalizedQuery, normalizeForMatch(anime.title))
  if (mainScore > 0) return mainScore

  const aliases = [anime.titleRomaji, anime.titleEnglish, ...(anime.synonyms || [])]
  const hasAliasMatch = aliases.some((alias) => {
    const normalized = normalizeForMatch(alias)
    return normalized && (normalized === normalizedQuery || normalized.includes(normalizedQuery))
  })
  return hasAliasMatch ? SCORE_ALIAS : SCORE_NONE
}

/**
 * Reordena resultados de anime: coincidencia de texto primero (exacta >
 * empieza con > contiene > alias), popularidad/score como desempate para
 * no dejar el resto en un orden arbitrario. Estable — nunca reordena dos
 * elementos con el mismo puntaje total.
 */
export function rankAnimeResults(results, query) {
  const normalizedQuery = normalizeForMatch(query)
  return results
    .map((anime, index) => ({ anime, index, matchScore: scoreAnimeMatch(anime, normalizedQuery) }))
    .sort((a, b) => {
      if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore
      const popularityDiff = (b.anime.popularity || 0) - (a.anime.popularity || 0)
      if (popularityDiff !== 0) return popularityDiff
      const scoreDiff = (b.anime.score || 0) - (a.anime.score || 0)
      if (scoreDiff !== 0) return scoreDiff
      return a.index - b.index // estable: preserva el orden original en empate total
    })
    .map((entry) => entry.anime)
}

/**
 * Mismo criterio para personajes — solo `name` (los personajes no tienen
 * alias/romaji separados en el shape actual de `characterSearchService`).
 */
export function rankCharacterResults(results, query) {
  const normalizedQuery = normalizeForMatch(query)
  return results
    .map((character, index) => ({
      character,
      index,
      matchScore: titleMatchScore(normalizedQuery, normalizeForMatch(character.name)),
    }))
    .sort((a, b) => (a.matchScore !== b.matchScore ? b.matchScore - a.matchScore : a.index - b.index))
    .map((entry) => entry.character)
}
