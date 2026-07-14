import axios from 'axios'

// AnimeThemes (api.animethemes.moe) — base de datos abierta y con licencia
// permisiva de openings/endings de anime (v2.1, Sistema de reproducción).
// Mismo patrón que api/anilist.js: un solo endpoint, sin key, sin la
// fragilidad de backend ya documentada y verificada en vivo para MAL/Jikan
// — no hace falta una cola de concurrencia propia.
const api = axios.create({
  baseURL: 'https://api.animethemes.moe',
  timeout: 10000,
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

export default api
