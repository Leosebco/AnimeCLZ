import axios from 'axios'

// AniList GraphQL — usado como fuente PRIMARIA para la búsqueda inteligente
// de avatares (personaje de anime), con Jikan como respaldo si esto falla
// (ver services/avatarSearchService.js). Un solo endpoint POST, sin API key
// para consultas públicas. A diferencia de api/jikan.js, no hace falta una
// cola de concurrencia propia — AniList no tiene la fragilidad de backend
// de búsqueda ya documentada y verificada en vivo para MAL/Jikan.
const api = axios.create({
  baseURL: 'https://graphql.anilist.co',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

const MAX_RETRIES = 2
const RETRYABLE_STATUS = (status) => status === 429 || (status >= 500 && status < 600)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const status = error.response?.status
    const retryCount = config?.__retryCount ?? 0

    if (config && RETRYABLE_STATUS(status) && retryCount < MAX_RETRIES) {
      config.__retryCount = retryCount + 1
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** retryCount))
      return api(config)
    }

    return Promise.reject(error)
  },
)

/**
 * POSTea una query GraphQL a AniList y devuelve `data` ya resuelto.
 * Lanza si la respuesta trae `errors` (GraphQL puede devolver 200 con
 * errores parciales) o si la request falla — el llamador
 * (avatarSearchService) es responsable de convertir eso en el respaldo de
 * Jikan, nunca en un error visible para el usuario.
 */
export async function anilistRequest(query, variables, signal) {
  const response = await api.post('', { query, variables }, { signal })
  if (response.data?.errors?.length) {
    throw new Error(response.data.errors[0]?.message || 'AniList GraphQL error')
  }
  return response.data.data
}

export default api
