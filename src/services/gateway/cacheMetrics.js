import { getCacheSnapshot } from '@/utils/cache'
import { getProviderCalls } from './metrics'

/**
 * Cache Metrics (v3.2), FASE 6 — dos fuentes distintas, combinadas:
 * hit/miss ratio viene de `metrics.js` (cada llamada registrada por
 * `ProviderManager.withCache` ya trae `cacheHit`); TTL restante viene de
 * `utils/cache.js`'s `getCacheSnapshot()` (introspección del Map real,
 * namespace `pm:` — el prefijo que ya usa `ProviderManager`).
 */
export function getCacheHitRatio() {
  const calls = getProviderCalls()
  if (calls.length === 0) return { hits: 0, misses: 0, total: 0, hitRatio: null, missRatio: null }

  const hits = calls.filter((call) => call.cacheHit).length
  const total = calls.length
  return {
    hits,
    misses: total - hits,
    total,
    hitRatio: hits / total,
    missRatio: (total - hits) / total,
  }
}

/**
 * TTL restante de cada entrada actualmente cacheada por `ProviderManager`
 * (namespace `pm:`). `expired: true` puede aparecer si la entrada venció
 * pero todavía no fue reemplazada por una lectura nueva (`getStaleCached`
 * la deja disponible a propósito, ver `utils/cache.js`) — no es un bug.
 */
export function getLiveCacheEntries() {
  return getCacheSnapshot('pm:')
}

export function getCacheMetricsSnapshot() {
  return {
    ...getCacheHitRatio(),
    liveEntries: getLiveCacheEntries(),
  }
}
