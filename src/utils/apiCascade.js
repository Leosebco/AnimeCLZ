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
