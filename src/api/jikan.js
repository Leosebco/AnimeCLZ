import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 10000,
})

// --- Concurrency queue -----------------------------------------------
// Jikan's public tier (no API key) gets noticeably less reliable the more
// requests hit it close together. Rather than relying on every page to
// remember to stagger its own queries (easy to forget, hard to audit),
// every request funnels through one queue here: at most MAX_CONCURRENT in
// flight at a time, with a minimum gap between request starts.
const MAX_CONCURRENT = 2
const MIN_INTERVAL_MS = 180
let activeCount = 0
let lastStart = 0
const waiting = []

function drainQueue() {
  if (activeCount >= MAX_CONCURRENT || waiting.length === 0) return
  const elapsed = Date.now() - lastStart
  const wait = Math.max(0, MIN_INTERVAL_MS - elapsed)
  setTimeout(() => {
    const next = waiting.shift()
    if (!next) return
    activeCount += 1
    lastStart = Date.now()
    next()
    drainQueue()
  }, wait)
}

api.interceptors.request.use(
  (config) =>
    new Promise((resolve) => {
      waiting.push(() => resolve(config))
      drainQueue()
    }),
)

function releaseSlot() {
  activeCount = Math.max(0, activeCount - 1)
  drainQueue()
}

// --- Retry on transient failures ---------------------------------------
// `/anime?q=` (search) in particular has been observed failing with 504
// far more often than other endpoints, independent of our request rate —
// MAL's own search backend is the fragile part, confirmed with direct
// curl tests outside this app. Retry with capped exponential backoff
// instead of surfacing a transient blip as a hard error straight away.
const MAX_RETRIES = 4
const RETRYABLE_STATUS = (status) => status === 429 || (status >= 500 && status < 600)

api.interceptors.response.use(
  (response) => {
    releaseSlot()
    return response
  },
  async (error) => {
    releaseSlot()
    const config = error.config
    const status = error.response?.status
    const retryCount = config?.__retryCount ?? 0

    if (config && RETRYABLE_STATUS(status) && retryCount < MAX_RETRIES) {
      config.__retryCount = retryCount + 1
      await new Promise((resolve) => setTimeout(resolve, Math.min(600 * 2 ** retryCount, 3000)))
      return api(config)
    }

    return Promise.reject(error)
  },
)

export default api
