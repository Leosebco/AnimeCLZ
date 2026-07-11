import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router v7 no restaura el scroll solo. Se monta una única vez dentro
 * de `AppRouter.jsx` (no de `Layout.jsx`) para cubrir tanto el árbol público
 * como `AdminLayout`, que es un subárbol de rutas completamente separado.
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // `behavior: 'instant'` explícito: `html` tiene `scroll-behavior: smooth`
    // global (src/styles/index.css) — sin esto, cada cambio de ruta se vería
    // como un scroll animado hacia arriba en vez de arrancar ya arriba.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default ScrollToTop
