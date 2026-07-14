import { createStubProvider } from '../../stubProvider'

// Sin implementar A PROPÓSITO, permanentemente (v2.1). Consumet es un
// agregador basado en scraping de sitios de streaming sin licencia
// (gogoanime, zoro/aniwatch, animepahe, etc.) — implementarlo de verdad
// significaría construir la cañería para transmitir contenido con
// copyright sin autorización. No se completa esta implementación sin una
// fuente real y legal detrás (ver CLAUDE.md, sección "Sistema de
// reproducción", para la decisión completa). El contrato queda declarado
// para que, el día que exista un proveedor real con licencia, conectarlo
// sea agregarlo a `PLAYBACK_PROVIDERS` en `PlaybackProviderManager.js` sin
// tocar ningún otro archivo.
const METHODS = ['getEpisodes', 'getSources']

const ConsumetProvider = createStubProvider('ConsumetProvider', METHODS)

export const { getEpisodes, getSources } = ConsumetProvider

// v2.2 — Sistema de reproducción multi-provider (episodios completos):
// misma decisión, mismo motivo, ver `VideoProviderInterface.js`. Se agrega
// el contrato de 4 métodos preguntado en ese sprint (`searchEpisode`/
// `getEpisodeSources`/`getSubtitles`/`healthCheck`) SIN tocar los 2
// exports de arriba (`getEpisodes`/`getSources`, v2.1, sin uso todavía) —
// aditivo, no reemplaza nada.
const VIDEO_METHODS = ['searchEpisode', 'getEpisodeSources', 'getSubtitles']
const ConsumetVideoProvider = createStubProvider('ConsumetProvider', VIDEO_METHODS)

export const { searchEpisode, getEpisodeSources, getSubtitles } = ConsumetVideoProvider

/**
 * `healthCheck()` nunca lanza (ni siquiera para un stub) — un chequeo de
 * salud debe poder inspeccionarse sin try/catch. Reporta el estado real:
 * no disponible, `responseTimeMs: null` (nunca un número inventado, ya que
 * no se hizo ninguna llamada de red de verdad).
 * @returns {Promise<import('../VideoProviderInterface').ProviderHealth>}
 */
export async function healthCheck() {
  return {
    available: false,
    responseTimeMs: null,
    lastError: 'ConsumetProvider no está implementado a propósito — ver docs/DECISIONS.md y CLAUDE.md ("Sistema de reproducción").',
    checkedAt: new Date().toISOString(),
  }
}
