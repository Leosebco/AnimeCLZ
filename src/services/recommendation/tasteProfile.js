/**
 * Perfil de gustos (v2.6) — puro, sin red ni React (ver
 * docs/CLAUDE.md/01_ARCHITECTURE.md: "Un Hook nunca debe renderizar JSX",
 * mismo espíritu aplicado acá — este archivo ni siquiera es un hook,
 * son funciones puras que reciben datos ya cargados).
 *
 * Auditoría del sprint (ver informe de entrega): `favorites`/`watch_later`
 * (tabla compartida vía `collectionService.js`) y `watch_history` NUNCA
 * guardan géneros ni estudios — solo `mal_id/title/poster/type/year/score/
 * status` (favoritos) o `mal_id/episode_number/seconds_watched/title/
 * poster/duration_seconds` (historial). Por eso `buildTasteProfile` recibe
 * un tercer parámetro, `enrichedById` (Map), con los géneros/estudios
 * reales de un subconjunto ACOTADO de esos animes — quien enriquece esa
 * data es `recommendationEngine.js`, no este archivo (que se queda 100%
 * puro y testeable sin red).
 */

// Cuántas entradas recientes de historial pesan para el perfil de gustos —
// acotado para no diluir "lo que estás viendo AHORA" con historial viejo.
const RECENT_HISTORY_WINDOW = 10

function addWeighted(map, key, weight) {
  if (!key) return
  map.set(key, (map.get(key) || 0) + weight)
}

/**
 * Cuenta géneros/estudios de una lista de animes `{id}` usando
 * `enrichedById` (Map<mal_id, {genres, studios}>) — animes sin entrada en
 * el mapa (no se enriquecieron, ver límite acotado en el engine) se
 * ignoran en vez de fallar o inventar géneros vacíos como si fueran reales.
 */
function accumulate(items, enrichedById, { genreMap, studioMap, weight = 1, recencyDecay = null }) {
  items.forEach((item, index) => {
    const enriched = enrichedById.get(item.id)
    if (!enriched) return
    const itemWeight = recencyDecay ? weight * recencyDecay(index, items.length) : weight
    for (const genre of enriched.genres || []) addWeighted(genreMap, genre, itemWeight)
    for (const studio of enriched.studios || []) addWeighted(studioMap, studio, itemWeight)
  })
}

/**
 * Perfil de gustos del perfil activo — cuatro mapas de frecuencia
 * ponderada, uno por señal (ver `scoring.js` para cómo se combinan):
 *
 * - `genreAffinity`: géneros de TODO lo que el perfil ya vio/guardó
 *   (favoritos + historial + Mi Lista), la señal más amplia.
 * - `historyGenreAffinity`/`historyStudioAffinity`: igual pero SOLO de las
 *   últimas `RECENT_HISTORY_WINDOW` entradas de historial, con más peso a
 *   lo más reciente (`recencyDecay`) — "qué estás viendo últimamente".
 * - `favoriteStudioAffinity`: estudios SOLO de favoritos (señal más
 *   targeteada que la afinidad de género general).
 */
export function buildTasteProfile({ favorites = [], history = [], watchLater = [], enrichedById }) {
  const genreAffinity = new Map()
  const historyGenreAffinity = new Map()
  const historyStudioAffinity = new Map()
  const favoriteStudioAffinity = new Map()
  const dummyStudioMap = new Map() // accumulate() siempre llena género+estudio; acá solo nos interesa uno

  accumulate(favorites, enrichedById, { genreMap: genreAffinity, studioMap: favoriteStudioAffinity, weight: 1 })
  accumulate(watchLater, enrichedById, { genreMap: genreAffinity, studioMap: dummyStudioMap, weight: 0.6 })

  const recentHistory = history.slice(0, RECENT_HISTORY_WINDOW)
  accumulate(recentHistory, enrichedById, {
    genreMap: genreAffinity,
    studioMap: dummyStudioMap,
    weight: 0.8,
  })
  accumulate(recentHistory, enrichedById, {
    genreMap: historyGenreAffinity,
    studioMap: historyStudioAffinity,
    weight: 1,
    // Más reciente (índice bajo, `listHistory` ya viene `updated_at desc`)
    // pesa más — decae linealmente hasta un piso de 0.2, nunca a cero (un
    // episodio visto hace unos días sigue siendo una señal real).
    recencyDecay: (index, total) => Math.max(0.2, 1 - index / total),
  })

  return { genreAffinity, historyGenreAffinity, historyStudioAffinity, favoriteStudioAffinity }
}

/**
 * `Map<string, number>` → array de claves ordenadas por peso, mayor
 * primero. Usado tanto para elegir géneros "top" (recomendación) como
 * "menos vistos" (descubrir algo diferente, ver `recommendationEngine.js`).
 */
export function rankedKeys(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key)
}
