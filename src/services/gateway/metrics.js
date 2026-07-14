/**
 * Sistema de métricas (v3.2 — Backend Gateway & Observability), FASE 3.
 * Registro puramente en memoria (nunca `localStorage`/red — no hay nada
 * que enviar a ningún sitio todavía, esto es preparación de
 * infraestructura, no telemetría real de producción).
 *
 * **Solo activo en desarrollo** (`import.meta.env.DEV`, mismo criterio que
 * `utils/logger.js`): cada función de registro empieza con
 * `if (!import.meta.env.DEV) return` — en un build de producción son
 * no-ops inmediatos, sin overhead de memoria ni de CPU, y Vite reemplaza
 * `import.meta.env.DEV` por `false` en tiempo de build, así que el bundle
 * de producción ni siquiera ejecuta el cuerpo de la función.
 *
 * Quién llama a esto (ver informe de entrega v3.2): `ProviderManager.js`
 * (`recordProviderCall`, un único punto — `withCache` — cubre los 7
 * métodos) y `api/jikan.js`/`api/anilist.js` (`recordRetry`, desde sus
 * interceptores de reintento ya existentes). AnimeThemes/Playback
 * deliberadamente NO se instrumentan este sprint (ver restricción "No
 * modificar Playback").
 */

const MAX_ENTRIES = 200

const providerCalls = []
const retries = []

function pushBounded(list, entry) {
  list.push(entry)
  if (list.length > MAX_ENTRIES) list.shift()
}

/**
 * Best-effort: ¿qué proveedor sirvió este resultado? `ProviderManager.js`
 * no expone una señal dedicada para esto (el cascade/merge vive en
 * `utils/apiCascade.js`, sin tocar ese archivo este sprint) — en cambio,
 * se aprovecha que varios shapes YA cargan una pista real: `getAnime()`
 * pone `source` en el objeto fusionado (ej. `"anilist+jikan"`,
 * `"jikan"`); `search()`/`getCharacters()`/etc. taggean cada item
 * (`item.source`). Pura, sin efectos — testeada con fixtures en el script
 * de verificación de este sprint (no depende de red).
 */
export function detectProviderTag(result) {
  if (!result) return 'unknown'
  if (typeof result.source === 'string') return result.source
  const list = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : null
  if (list?.[0]?.source) return list[0].source
  return 'unknown'
}

/**
 * Registrado desde `ProviderManager.withCache` — un entry por llamada a
 * cualquiera de los 7 métodos (search/getAnime/getEpisodes/getCharacters/
 * getRelations/getRecommendations/getGallery), con o sin cache hit.
 */
export function recordProviderCall({ method, cacheHit, stale, durationMs, providerTag, success }) {
  if (!import.meta.env.DEV) return
  pushBounded(providerCalls, {
    method,
    cacheHit: Boolean(cacheHit),
    stale: Boolean(stale),
    durationMs,
    providerTag: providerTag || 'unknown',
    success: success !== false,
    at: Date.now(),
  })
}

/**
 * Registrado desde el interceptor de reintento de `api/jikan.js`/
 * `api/anilist.js` — un entry por intento reintentado (no por el primer
 * intento, que no es un "retry"). `isTimeout` distingue un timeout de
 * cliente (`ECONNABORTED`) de un status 429/5xx real.
 */
export function recordRetry({ source, status, isTimeout }) {
  if (!import.meta.env.DEV) return
  pushBounded(retries, { source, status: status ?? null, isTimeout: Boolean(isTimeout), at: Date.now() })
}

/** Copia de solo lectura — nunca el array interno (evita mutación externa). */
export function getProviderCalls() {
  return [...providerCalls]
}

export function getRetries() {
  return [...retries]
}

// Solo para el script de verificación de este sprint — nunca se llama
// desde código de la app.
export function __resetForTests() {
  providerCalls.length = 0
  retries.length = 0
}
