import { createCollectionService } from './collectionService'

// "Mi Lista" — animes que el usuario planea ver más adelante. Ver
// favoritesService para "Favoritos" (♥), una lista distinta.
const service = createCollectionService('watch_later')

export const listWatchLater = service.list
export const addWatchLater = service.add
export const removeWatchLater = service.remove
