import { createStubProvider } from '../stubProvider'

// TMDB es de películas/series en general, no específico de anime — su
// implementación real probablemente necesite mapear campos distintos
// (no todos los ~20 métodos tendrán un equivalente 1:1). El contrato se
// deja idéntico al de JikanProvider por consistencia con AnimeProvider;
// se ajusta cuando se implemente de verdad.
const METHODS = [
  'getTrending',
  'getTopRated',
  'getCurrentSeason',
  'getMovies',
  'getMostPopular',
  'getBestRated',
  'getRecommendations',
  'getAnimeByGenre',
  'discoverAnime',
  'searchAnime',
  'quickSearchAnime',
  'getAnimeById',
  'getAnimeCharacters',
  'getAnimeEpisodes',
  'getAnimeRecommendations',
  'getAnimeRelations',
  'getAnimePictures',
  'getFeaturedAnime',
  'getFeaturedSlides',
  'searchCharacters',
  'getCharacterAnime',
]

const TMDBProvider = createStubProvider('TMDBProvider', METHODS)

export const {
  getTrending,
  getTopRated,
  getCurrentSeason,
  getMovies,
  getMostPopular,
  getBestRated,
  getRecommendations,
  getAnimeByGenre,
  discoverAnime,
  searchAnime,
  quickSearchAnime,
  getAnimeById,
  getAnimeCharacters,
  getAnimeEpisodes,
  getAnimeRecommendations,
  getAnimeRelations,
  getAnimePictures,
  getFeaturedAnime,
  getFeaturedSlides,
  searchCharacters,
  getCharacterAnime,
} = TMDBProvider
