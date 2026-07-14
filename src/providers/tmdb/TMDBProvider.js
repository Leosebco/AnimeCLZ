import { createStubProvider } from '../stubProvider'

// Todavía sin implementar (TMDB es de películas/series en general, no
// específico de anime — su implementación real probablemente necesite
// mapear campos distintos). Contrato de 7 métodos actualizado en v1.9/v2.0
// (Provider Engine) para que Jikan/AniList/TMDB declaren la misma
// interfaz que espera `ProviderManager.js` — antes tenía los 21 métodos
// heredados del viejo `AnimeProvider.js`/`JikanProvider.js`.
const METHODS = [
  'search',
  'getAnime',
  'getEpisodes',
  'getCharacters',
  'getRelations',
  'getRecommendations',
  'getGallery',
]

const TMDBProvider = createStubProvider('TMDBProvider', METHODS)

export const { search, getAnime, getEpisodes, getCharacters, getRelations, getRecommendations, getGallery } =
  TMDBProvider
