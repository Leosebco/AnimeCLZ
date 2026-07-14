/**
 * Contrato oficial de un Video Provider de EPISODIOS COMPLETOS (v2.2, ver
 * docs/15_API_GUIDELINES.md "Provider Interface" y docs/07_PLAYER_SYSTEM.md).
 * Cualquier proveedor de este tipo (`ConsumetProvider`, `EnimeProvider`,
 * futuros) debe implementar exactamente estos 4 métodos — ni más ni menos.
 * Este archivo solo declara el contrato: cero lógica, cero llamadas de red.
 *
 * No confundir con el contrato de 2 métodos de `PlaybackProviderManager`
 * (`getEpisodes`/`getSources`, v2.1) — ese ya es real hoy, vía
 * `AnimeThemesProvider`, para openings/endings (~90s). Este contrato nuevo
 * es para cuando exista un proveedor real y con licencia de EPISODIOS
 * completos — hoy `ConsumetProvider`/`EnimeProvider` lo implementan como
 * stubs inertes a propósito (ver docs/DECISIONS.md y el `CLAUDE.md` de la
 * raíz, sección "Sistema de reproducción" — Consumet/Enime son agregadores
 * de scraping sin licencia, no APIs legales; docs/15_API_GUIDELINES.md
 * exige que toda fuente nueva "sea legal" y "respete licencias" antes de
 * integrarse de verdad).
 */
export const VIDEO_PROVIDER_METHODS = ['searchEpisode', 'getEpisodeSources', 'getSubtitles', 'healthCheck']

/**
 * @typedef {Object} EpisodeMatch
 * @property {string} id - Identificador del episodio dentro del proveedor.
 * @property {string} providerId - Id del proveedor que lo resolvió (p. ej. 'consumet').
 * @property {number|string} animeId - mal_id del anime (mismo espacio numérico que ProviderManager).
 * @property {number} episodeNumber
 * @property {string|null} title
 * @property {boolean} available - Si el proveedor tiene fuentes reales para este episodio.
 */

/**
 * VideoSubtitleTrack — pista de subtítulo de un episodio completo. Reusa el
 * mismo criterio de idioma que `VideoSource.subtitleLanguages` en
 * `providers/models.js`, pero como pista independiente (un episodio
 * completo puede tener varios idiomas simultáneos, a diferencia de un clip
 * de AnimeThemes que nunca tiene subtítulos).
 * @typedef {Object} VideoSubtitleTrack
 * @property {string} language - Código de idioma ('es', 'en', 'pt', 'ja'...).
 * @property {string} label - Nombre visible ('Español', 'English'...).
 * @property {string} url
 * @property {'srt'|'vtt'|'ass'} format
 */

/**
 * ProviderHealth — resultado de `healthCheck()`. Nunca se inventa un
 * `responseTimeMs` cuando el proveedor no hizo una llamada real (un stub
 * inerte reporta `responseTimeMs: null`, no un número fabricado).
 * @typedef {Object} ProviderHealth
 * @property {boolean} available
 * @property {number|null} responseTimeMs
 * @property {string|null} lastError
 * @property {string} checkedAt - ISO timestamp de cuándo se hizo el chequeo.
 */

/**
 * searchEpisode(animeId, episodeNumber, signal) → Promise<EpisodeMatch|null>
 * Busca si el proveedor tiene ese episodio puntual — no descarga fuentes
 * todavía, solo confirma existencia/metadata liviana.
 *
 * getEpisodeSources(animeId, episodeNumber, signal) → Promise<{sources: VideoSource[], info}>
 * Fuentes reproducibles reales para ese episodio — mismo shape `VideoSource`
 * de `providers/models.js` (createVideoSource), nunca una forma propia del
 * proveedor (ver "Formato Unificado" en docs/15_API_GUIDELINES.md).
 *
 * getSubtitles(animeId, episodeNumber, signal) → Promise<VideoSubtitleTrack[]>
 *
 * healthCheck(signal) → Promise<ProviderHealth>
 * Nunca lanza — siempre resuelve, incluso para reportar que el proveedor no
 * está disponible.
 */
