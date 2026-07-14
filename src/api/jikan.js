import axios from 'axios'
import { recordRetry } from '@/services/gateway/metrics'

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
let drainTimer = null

// v2.0 — bug real corregido: la versión anterior chequeaba `activeCount`
// al encolar pero solo lo incrementaba dentro de un `setTimeout` que
// disparaba después, sin volver a chequear el cupo. Cuando varias
// requests se encolaban en el mismo tick (p. ej. los 6 `useFetch` de
// AnimeDetail.jsx montándose juntos), TODAS pasaban el chequeo antes de
// que ninguna incrementara el contador — el límite quedaba anulado y la
// ráfaga entera llegaba a Jikan casi junta, causando los 429/504 reales
// que después había que reintentar. La reserva de cupo ahora es síncrona
// (dentro del propio `while`, no de un timer futuro) — JS de un solo hilo
// garantiza que nada puede intercalarse a mitad del loop.
function scheduleDrain(delay) {
  if (drainTimer !== null) return
  drainTimer = setTimeout(() => {
    drainTimer = null
    drainQueue()
  }, delay)
}

function drainQueue() {
  while (activeCount < MAX_CONCURRENT && waiting.length > 0) {
    const elapsed = Date.now() - lastStart
    if (elapsed < MIN_INTERVAL_MS) {
      scheduleDrain(MIN_INTERVAL_MS - elapsed)
      return
    }
    const entry = waiting.shift()
    if (entry.onAbort) entry.config.signal.removeEventListener('abort', entry.onAbort)
    activeCount += 1
    lastStart = Date.now()
    entry.resolve(entry.config)
  }
}

function makeCancelError() {
  const err = new Error('canceled')
  err.name = 'CanceledError'
  err.code = 'ERR_CANCELED'
  return err
}

function removeFromWaiting(entry) {
  const index = waiting.indexOf(entry)
  if (index !== -1) waiting.splice(index, 1)
}

api.interceptors.request.use(
  (config) =>
    new Promise((resolve, reject) => {
      const signal = config.signal
      if (signal?.aborted) {
        reject(makeCancelError())
        return
      }
      const entry = { config, resolve }
      // Una request cancelada mientras todavía espera turno ya no debe
      // "gastar" un cupo de la cola — se remueve de verdad de `waiting`
      // en vez de despacharse igual y fallar recién al llegar a la red.
      if (signal) {
        entry.onAbort = () => {
          removeFromWaiting(entry)
          reject(makeCancelError())
        }
        signal.addEventListener('abort', entry.onAbort)
      }
      waiting.push(entry)
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

    // v2.0: no reintentar (ni esperar el backoff) una request cuyo
    // llamador ya se fue — antes un reintento "zombie" volvía a entrar a
    // la cola compartida después de que la página que lo pidió ya no
    // existía, robándole turno a requests reales de la página nueva.
    if (config?.signal?.aborted) return Promise.reject(makeCancelError())

    // v2.0 — bug real confirmado en vivo (curl directo, fuera de la app):
    // `/anime/20/episodes` tardó 11s y terminó en 500 — más que nuestro
    // `timeout: 10000`, así que axios lo reporta como `ECONNABORTED`
    // (timeout del cliente), no como un status 5xx. `RETRYABLE_STATUS`
    // antes solo miraba `error.response?.status`, que para un timeout de
    // cliente es `undefined` — un backend lento-y-después-caído nunca se
    // reintentaba, se rendía al primer intento. Ahora un timeout de
    // cliente cuenta como transitorio igual que un 429/5xx.
    const isTimeout = error.code === 'ECONNABORTED'

    if (config && (RETRYABLE_STATUS(status) || isTimeout) && retryCount < MAX_RETRIES) {
      config.__retryCount = retryCount + 1
      // v3.2 — Backend Gateway & Observability: no-op en producción, nunca
      // lanza (ver services/gateway/metrics.js) — no cambia el flujo de
      // reintento en sí.
      recordRetry({ source: 'jikan', status, isTimeout })
      await new Promise((resolve) => setTimeout(resolve, Math.min(600 * 2 ** retryCount, 3000)))
      if (config.signal?.aborted) return Promise.reject(makeCancelError())
      return api(config)
    }

    return Promise.reject(error)
  },
)

export default api
