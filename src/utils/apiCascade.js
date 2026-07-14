/**
 * Patrón compartido "AniList primero, Jikan de respaldo" — usado por
 * `characterSearchService.js` y `searchService.js`. Antes vivía duplicado
 * como un try/catch idéntico en cada servicio; centralizado acá (v1.7)
 * para no repetir la misma lógica de control de flujo dos veces.
 *
 * Nunca relanza salvo un abort real (para que `useFetch` lo trate como
 * cancelación, no como error) — cualquier otra falla de ambas fuentes
 * resuelve a `emptyValue`, nunca un throw que llegue a ErrorBoundary.
 */
export function isAbortError(err) {
  return err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError'
}

export async function withFallback(
  primary,
  fallback,
  { isEmpty = (result) => !result || result.length === 0, onError, onFailure, emptyValue = [] } = {},
) {
  try {
    const result = await primary()
    if (!isEmpty(result)) return result
  } catch (err) {
    if (isAbortError(err)) throw err
    onError?.(err, 'primary')
  }

  try {
    return await fallback()
  } catch (err) {
    if (isAbortError(err)) throw err
    onError?.(err, 'fallback')
    // A diferencia de `onError` (se llama en cualquier falla parcial),
    // `onFailure` solo se llama cuando TAMBIÉN falló el respaldo — es la
    // señal real de "ninguna de las dos fuentes respondió", que
    // `searchService.js` usa para distinguir "0 resultados genuinos" de
    // "no pudimos completar la búsqueda" sin exponer nunca un código de
    // estado HTTP en la UI.
    onFailure?.(err)
    return emptyValue
  }
}

/**
 * Generalización de `withFallback` a N funciones en orden (en vez de
 * exactamente primaria/respaldo) — usada por `ProviderManager.js` (v1.9)
 * para cascadas de "primero el proveedor A, si no da nada el B, si no el
 * C..." sin fijar de antemano cuántos proveedores hay. Mismo contrato:
 * nunca lanza salvo abort real, cualquier otra falla de TODAS las
 * funciones resuelve a `emptyValue`.
 */
export async function firstSuccessful(
  fns,
  { isEmpty = (result) => !result || result.length === 0, onError, emptyValue = [] } = {},
) {
  for (const fn of fns) {
    try {
      const result = await fn()
      if (!isEmpty(result)) return result
    } catch (err) {
      if (isAbortError(err)) throw err
      onError?.(err)
    }
  }
  return emptyValue
}
