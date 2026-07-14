import { getProviderCalls, getRetries } from './metrics'

/**
 * Health Monitor (v3.2), FASE 4 — deriva salud por proveedor a partir de
 * lo que `metrics.js` ya registró (nunca hace una llamada de red propia).
 * Solo tiene datos reales en desarrollo (`metrics.js` no registra nada en
 * producción) — en producción, `getAllProvidersHealth()` devuelve el
 * mismo shape con todo en `tracked: false`/valores `null`, nunca inventa
 * un número.
 *
 * `available`/`success` acá significan "el proveedor devolvió un resultado
 * no vacío" (`ProviderManager` nunca propaga una excepción salvo abort
 * real — ver docs/06_PROVIDER_MANAGER.md, "La UI jamás conoce" fallos
 * crudos — así que "último error" es honestamente "última vez que este
 * proveedor contribuyó un resultado vacío", no una excepción con mensaje).
 */
const TRACKED_PROVIDERS = ['anilist', 'jikan']

function contributedTo(call, providerId) {
  return call.providerTag.split('+').includes(providerId)
}

function computeHealth(providerId, calls, retries) {
  const relevant = calls.filter((call) => contributedTo(call, providerId))
  const relevantRetries = retries.filter((retry) => retry.source === providerId)

  if (relevant.length === 0) {
    return {
      providerId,
      tracked: true,
      callCount: 0,
      availability: null,
      avgLatencyMs: null,
      lastError: null,
      lastSuccess: null,
      retryCount: relevantRetries.length,
    }
  }

  const successes = relevant.filter((call) => call.success)
  const failures = relevant.filter((call) => !call.success)
  const avgLatencyMs = relevant.reduce((sum, call) => sum + (call.durationMs || 0), 0) / relevant.length
  const mostRecent = (list) => list.reduce((latest, call) => (!latest || call.at > latest.at ? call : latest), null)
  const lastSuccessCall = mostRecent(successes)
  const lastErrorCall = mostRecent(failures)

  return {
    providerId,
    tracked: true,
    callCount: relevant.length,
    availability: successes.length / relevant.length,
    avgLatencyMs: Math.round(avgLatencyMs),
    lastError: lastErrorCall ? { at: lastErrorCall.at, method: lastErrorCall.method } : null,
    lastSuccess: lastSuccessCall ? { at: lastSuccessCall.at, method: lastSuccessCall.method } : null,
    retryCount: relevantRetries.length,
  }
}

export function getProviderHealth(providerId) {
  return computeHealth(providerId, getProviderCalls(), getRetries())
}

/**
 * Incluye una entrada para `animethemes` aunque no esté instrumentada
 * (Playback fuera de alcance este sprint, ver `Gateway.js`) — el shape ya
 * queda listo para cuando eso cambie, en vez de omitirla en silencio.
 */
export function getAllProvidersHealth() {
  const calls = getProviderCalls()
  const retries = getRetries()
  const tracked = TRACKED_PROVIDERS.map((id) => computeHealth(id, calls, retries))
  const animethemes = {
    providerId: 'animethemes',
    tracked: false,
    callCount: 0,
    availability: null,
    avgLatencyMs: null,
    lastError: null,
    lastSuccess: null,
    retryCount: 0,
    reason: 'Playback fuera de alcance de este sprint (ver restricciones) — no instrumentado.',
  }
  return [...tracked, animethemes]
}
