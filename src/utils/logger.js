/**
 * Logging de diagnóstico SOLO en desarrollo (`import.meta.env.DEV`, lo
 * pone Vite en `false` en un build de producción) — en producción no
 * imprime nada. Para el detalle real de errores de Supabase/Jikan que no
 * deben mostrarse tal cual al usuario (mensaje genérico en la UI) pero sí
 * tienen que quedar visibles en consola mientras se desarrolla/depura.
 */
export function devError(...args) {
  if (import.meta.env.DEV) console.error(...args)
}

export function devLog(...args) {
  if (import.meta.env.DEV) console.log(...args)
}

export function devWarn(...args) {
  if (import.meta.env.DEV) console.warn(...args)
}
