/**
 * Backend Gateway (v3.2), FASE 2 — preparación para una futura migración
 * gradual a un backend propio. Hoy NO existe ningún servidor: este módulo
 * es un pass-through directo a `providers/ProviderManager.js` (que sigue
 * siendo, sin cambios, el único responsable de decidir qué proveedor
 * consultar — ver docs/06_PROVIDER_MANAGER.md, "El ProviderManager es el
 * núcleo... nunca debe ser eliminado"). El día que exista un backend real,
 * el PLAN es que solo estas funciones cambien de "llamar a ProviderManager
 * en el mismo proceso" a "hacer fetch a un endpoint propio" — sin que
 * ninguna página necesite tocarse, exactamente porque ya importarían desde
 * acá y no desde ProviderManager directo.
 *
 * **Nada existente se migró a este archivo todavía** (pedido explícito:
 * "No modificar la UI") — las 9 páginas de catálogo actuales siguen
 * importando de `AnimeProvider.js`/`ProviderManager.js` exactamente igual
 * que antes. `Gateway.js` es un punto de entrada nuevo y paralelo, listo
 * para que código FUTURO lo adopte gradualmente.
 *
 * Deliberadamente NO incluye los métodos de `PlaybackProviderManager`
 * (AnimeThemes) — "Playback" está en la lista de restricciones de este
 * sprint, así que ese subsistema queda fuera del Gateway y de la
 * observabilidad nueva (ver informe de entrega para el detalle).
 */
import {
  search,
  getAnime,
  getEpisodes,
  getCharacters,
  getRelations,
  getRecommendations,
  getGallery,
} from '@/providers/ProviderManager'

export const Gateway = {
  search,
  getAnime,
  getEpisodes,
  getCharacters,
  getRelations,
  getRecommendations,
  getGallery,
}

export default Gateway
