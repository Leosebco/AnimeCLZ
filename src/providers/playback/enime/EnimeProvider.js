import { createStubProvider } from '../../stubProvider'

// Sin implementar A PROPÓSITO, permanentemente (v2.2). Enime, igual que
// Consumet (ver ese archivo), es un agregador basado en scraping de sitios
// de streaming sin licencia — no una API con licencia. Implementarlo de
// verdad significaría construir la cañería para transmitir contenido con
// copyright sin autorización, contradiciendo docs/15_API_GUIDELINES.md
// ("APIs Experimentales": una fuente nueva solo se integra si "sean
// legales" y "respeten licencias") y la decisión ya tomada en CLAUDE.md
// ("Sistema de reproducción", no se reconsidera). El contrato queda
// declarado para que, el día que exista un proveedor real con licencia,
// conectarlo sea agregarlo a `VIDEO_PROVIDERS` en
// `PlaybackProviderManager.js` sin tocar ningún otro archivo.
const VIDEO_METHODS = ['searchEpisode', 'getEpisodeSources', 'getSubtitles']
const EnimeVideoProvider = createStubProvider('EnimeProvider', VIDEO_METHODS)

export const { searchEpisode, getEpisodeSources, getSubtitles } = EnimeVideoProvider

/**
 * `healthCheck()` nunca lanza — reporta el estado real: no disponible,
 * `responseTimeMs: null` (nunca un número inventado, no se hizo ninguna
 * llamada de red de verdad).
 * @returns {Promise<import('../VideoProviderInterface').ProviderHealth>}
 */
export async function healthCheck() {
  return {
    available: false,
    responseTimeMs: null,
    lastError: 'EnimeProvider no está implementado a propósito — ver docs/DECISIONS.md y CLAUDE.md ("Sistema de reproducción").',
    checkedAt: new Date().toISOString(),
  }
}
