import { createStubProvider } from '../../stubProvider'

// Sin implementar todavía (v2.1) — a diferencia de los otros stubs de esta
// carpeta, YouTube SÍ es una fuente legal (trailers oficiales), pero no
// hay nada que conectar todavía: `AnimeDetail.jsx` ya tiene una sección de
// Trailer real y funcionando (vía `anime.trailerUrl`, de Jikan/AniList,
// embed directo) — no se toca ni se duplica. Este stub solo deja
// preparado el contrato por si en el futuro conviene enrutar trailers a
// través del mismo `PlaybackProviderManager` en vez del camino actual.
const METHODS = ['getEpisodes', 'getSources']

const YouTubeProvider = createStubProvider('YouTubeProvider', METHODS)

export const { getEpisodes, getSources } = YouTubeProvider
