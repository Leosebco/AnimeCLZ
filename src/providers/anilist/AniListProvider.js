import { createStubProvider } from '../stubProvider'

// Mismo contrato que JikanProvider (ver AnimeProvider.js) — cuando se
// implemente de verdad, cada función debe devolver el mismo modelo
// canónico que usa el resto de la app (mapAnime en animeService.js) para
// que AnimeProvider pueda intercambiar de proveedor sin tocar ninguna
// página.
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

const AniListProvider = createStubProvider('AniListProvider', METHODS)

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
} = AniListProvider
