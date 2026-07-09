import { createCollectionService } from './collectionService'

// "Favoritos" (♥) — animes que le gustan al usuario. Ver watchLaterService
// para "Mi Lista" (animes que planea ver más adelante).
const service = createCollectionService('favorites')

export const listFavorites = service.list
export const addFavorite = service.add
export const removeFavorite = service.remove
