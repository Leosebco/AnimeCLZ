const store = new Map()

export function getCached(key) {
  const entry = store.get(key)
  if (!entry || Date.now() > entry.expiresAt) return undefined
  return entry.value
}

// v2.0 — devuelve el valor aunque esté vencido, para que ProviderManager
// pueda servir "el último resultado válido" cuando una consulta fresca
// falla/da vacío (Parte 3 de la caché inteligente) — antes `getCached`
// borraba la entrada al leerla vencida, sin dejar forma de recuperarla.
export function getStaleCached(key) {
  return store.get(key)?.value
}

export function setCached(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function removeCached(key) {
  store.delete(key)
}

// v3.2 — Backend Gateway & Observability: introspección de solo lectura
// para `services/gateway/cacheMetrics.js` (TTL restante por entrada) — no
// cambia el comportamiento de ninguna función existente, solo expone una
// copia de lo que ya hay en `store`. `prefix` filtra por el namespace de
// un consumidor (`ProviderManager` usa `pm:`) sin acoplar este archivo a
// quién lo llama.
export function getCacheSnapshot(prefix = '') {
  const now = Date.now()
  const entries = []
  for (const [key, entry] of store.entries()) {
    if (prefix && !key.startsWith(prefix)) continue
    entries.push({ key, remainingMs: Math.max(0, entry.expiresAt - now), expired: now > entry.expiresAt })
  }
  return entries
}
