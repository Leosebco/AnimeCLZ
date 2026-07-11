// v1.7: la lógica real de búsqueda de personajes se movió a
// `characterSearchService.js` (compartida también por `searchService.js`,
// la búsqueda global — antes esta misma query GraphQL vivía duplicada).
// Este archivo queda como un simple alias para no tocar el import ya
// existente en `AvatarPicker.jsx` (`searchAvatarCandidates`).
export { searchCharacterCandidates as searchAvatarCandidates } from './characterSearchService'
