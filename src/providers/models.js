const EPISODE_DEFAULTS = {
  id: null,
  number: null,
  title: null,
  description: null,
  thumbnail: null,
  duration: null,
  sources: [],
  subtitleLanguages: [],
  audioLanguages: [],
  provider: null,
}

/**
 * Normaliza un episodio al shape preparado para el futuro reproductor
 * (v1.9 — Provider Engine). `sources`/`subtitleLanguages`/`audioLanguages`
 * quedan vacíos hoy (ningún proveedor da video todavía, y no se inventa
 * nada) — el shape ya está listo para cuando exista una fuente real. Los
 * defaults van primero y `partial` al final: un campo real que el
 * proveedor ya entrega (p. ej. `aired`/`score`/`filler` de Jikan) no se
 * descarta solo por no estar en esta lista.
 *
 * @typedef {Object} VideoSource
 * @property {string} id
 * @property {string} provider - qué proveedor de video expone esta fuente
 * @property {string} servidor - nombre del servidor de streaming
 * @property {string} calidad - p. ej. "1080p", "720p"
 * @property {string} url
 * @property {string[]} subtitleLanguages
 * @property {string} audioLanguage
 * @property {string|null} preview - URL de miniatura/preview, si existe
 *
 * `Episode.sources` es un array de `VideoSource` — hasta v2.1 siempre
 * vacío (ningún proveedor de video estaba implementado); desde v2.1,
 * `AnimeThemesProvider` lo llena vía `createVideoSource()` (ver abajo).
 */
export function createEpisode(partial = {}) {
  return { ...EPISODE_DEFAULTS, ...partial }
}

const VIDEO_SOURCE_DEFAULTS = {
  id: null,
  provider: null,
  servidor: null,
  calidad: null,
  url: null,
  subtitleLanguages: [],
  audioLanguage: null,
  preview: null,
}

/**
 * Normaliza una fuente de video al shape `VideoSource` documentado arriba
 * (v2.1 — Sistema de reproducción). Mismo criterio que `createEpisode`:
 * defaults primero, `partial` al final, para no descartar un campo real
 * que un proveedor futuro entregue y que no esté en esta lista.
 */
export function createVideoSource(partial = {}) {
  return { ...VIDEO_SOURCE_DEFAULTS, ...partial }
}

const STAFF_MEMBER_DEFAULTS = {
  id: null,
  name: null,
  role: null,
  image: null,
  provider: null,
}

/**
 * Normaliza un miembro de staff (v2.7 — Media Hub). Solo AniList expone
 * este dato hoy (`AniListProvider.getAnime`, ver query `staff`) — Jikan
 * tiene un endpoint real (`/anime/{id}/staff`) pero conectarlo implicaría
 * una llamada nueva por página que AniList ya cubre en el mismo round-trip
 * de `getAnime()` (ver CLAUDE.md v2.7, "nunca duplicar llamadas"). El shape
 * ya está listo para si Jikan se conecta en un sprint futuro.
 */
export function createStaffMember(partial = {}) {
  return { ...STAFF_MEMBER_DEFAULTS, ...partial }
}

const EXTERNAL_LINK_DEFAULTS = {
  id: null,
  name: null,
  url: null,
  type: null,
  icon: null,
  color: null,
  language: null,
  note: null,
  provider: null,
}

/**
 * Normaliza un enlace externo (v2.7 — Media Hub): tanto "Enlaces oficiales"
 * (sitio oficial, redes) como "Plataformas de streaming" (Crunchyroll,
 * Netflix...) comparten este mismo shape — solo cambia el filtro de `type`
 * aplicado en `AniListProvider.getAnime()`. `icon`/`color` son reales
 * (branding propio de cada plataforma, servido por AniList), nunca
 * inventados — quedan `null` cuando la fuente no los tiene.
 */
export function createExternalLink(partial = {}) {
  return { ...EXTERNAL_LINK_DEFAULTS, ...partial }
}

const EMPTY_VALUES = new Set([null, undefined, ''])

function isFieldEmpty(value) {
  if (EMPTY_VALUES.has(value)) return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * Combina dos objetos con el mismo shape canónico de anime, campo por
 * campo: conserva el valor de `primary` si no está vacío, si no cae al de
 * `secondary` — nunca al revés (regla explícita: "nunca reemplazar datos
 * buenos por peores"). Reusado por `ProviderManager.getAnime()` (AniList
 * vs. Jikan) y por la deduplicación de `ProviderManager.search()` — un
 * único algoritmo de merge, no dos copias.
 */
export function mergeAnimeFields(primary, secondary) {
  if (!primary) return secondary || null
  if (!secondary) return primary

  const merged = { ...secondary, ...primary }
  for (const key of Object.keys(merged)) {
    if (key === 'source') continue
    if (isFieldEmpty(primary[key]) && !isFieldEmpty(secondary[key])) {
      merged[key] = secondary[key]
    }
  }
  return merged
}
