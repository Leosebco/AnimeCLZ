/**
 * Cálculo de preferencias (v2.6, FASE 3) — puro, sin red. Pesos según el
 * pedido del sprint, todos configurables (no hardcodeados en la fórmula):
 *
 * 40% Géneros favoritos · 30% Historial · 20% Favoritos · 10% Popularidad
 *
 * Cuatro señales DISTINTAS, no una sola reusada cuatro veces (ver
 * tasteProfile.js):
 * - `genreAffinity` (40%): solapamiento de género contra TODO lo que el
 *   perfil ya vio/guardó (favoritos+historial+Mi Lista) — la señal más
 *   amplia de "qué géneros te gustan".
 * - `historyRecency` (30%): solapamiento de género Y estudio contra las
 *   últimas ~10 entradas de historial, ponderado por qué tan reciente es
 *   cada una — "qué estás viendo últimamente", distinto de la señal de
 *   arriba por ser recency-aware en vez de acumulada de por vida.
 * - `favoriteStudio` (20%): solapamiento de ESTUDIO específicamente contra
 *   favoritos — una señal más targeteada que género (mismo estudio suele
 *   implicar un estilo visual/narrativo similar).
 * - `popularity` (10%): score/popularidad real del candidato en sí
 *   (Jikan/AniList, ya viene en cualquier anime de ProviderManager) — un
 *   desempate de calidad, independiente del perfil.
 */
export const RECOMMENDATION_WEIGHTS = {
  genreAffinity: 0.4,
  historyRecency: 0.3,
  favoriteStudio: 0.2,
  popularity: 0.1,
}

function overlapScore(candidateKeys, affinityMap) {
  if (!candidateKeys?.length || affinityMap.size === 0) return 0
  const maxWeight = Math.max(...affinityMap.values())
  if (maxWeight <= 0) return 0
  let total = 0
  for (const key of candidateKeys) {
    const weight = affinityMap.get(key)
    if (weight) total += weight / maxWeight // normalizado 0-1 contra el género/estudio más frecuente
  }
  return Math.min(1, total / candidateKeys.length)
}

// `popularity`/`rank` de Jikan: más bajo = mejor (posición #1 es la más
// popular). Se invierte a una escala 0-1 donde 1 es "más popular", con un
// techo razonable (top 500) — nunca se inventa un valor si no viene dato
// real, simplemente puntúa 0 en esa señal (no penaliza, no favorece).
function popularityScore(candidate) {
  if (typeof candidate.popularity !== 'number') return 0
  return Math.max(0, 1 - candidate.popularity / 500)
}

/**
 * Puntúa un candidato (0-1) contra el perfil de gustos, combinando las 4
 * señales con `weights` (por defecto `RECOMMENDATION_WEIGHTS`, pero
 * configurable — FASE 3 pide "Todo configurable", así que nunca hardcodeado
 * dentro de esta función).
 */
export function scoreCandidate(candidate, tasteProfile, weights = RECOMMENDATION_WEIGHTS) {
  const genres = candidate.genres || []
  const studios = candidate.studios || []

  const genreAffinity = overlapScore(genres, tasteProfile.genreAffinity)
  const historyRecency =
    overlapScore(genres, tasteProfile.historyGenreAffinity) * 0.7 +
    overlapScore(studios, tasteProfile.historyStudioAffinity) * 0.3
  const favoriteStudio = overlapScore(studios, tasteProfile.favoriteStudioAffinity)
  const popularity = popularityScore(candidate)

  const total =
    genreAffinity * weights.genreAffinity +
    historyRecency * weights.historyRecency +
    favoriteStudio * weights.favoriteStudio +
    popularity * weights.popularity

  return { total, breakdown: { genreAffinity, historyRecency, favoriteStudio, popularity } }
}

/**
 * Ordena candidatos por score total, mayor primero. Estable en empates
 * (preserva el orden de entrada) para no barajar arbitrariamente cuando
 * dos candidatos puntúan igual (p. ej. dos animes sin ningún dato de
 * afinidad, ambos en 0).
 */
export function rankCandidates(candidates, tasteProfile, weights = RECOMMENDATION_WEIGHTS) {
  return candidates
    .map((candidate, index) => ({ candidate, index, ...scoreCandidate(candidate, tasteProfile, weights) }))
    .sort((a, b) => (b.total !== a.total ? b.total - a.total : a.index - b.index))
    .map((entry) => entry.candidate)
}
