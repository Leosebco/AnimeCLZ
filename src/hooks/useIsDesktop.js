import { useEffect, useState } from 'react'

const DEFAULT_QUERY = '(min-width: 640px)'

/**
 * Generalizado en v1.7 desde el hook que vivía inline en `Modal.jsx`
 * (sprint móvil) — ahora también lo usa `Hero.jsx` para saber si debe
 * mostrar su layout de escritorio (alto fijo, drag entre slides) o el de
 * mobile (alto de contenido, sin drag). Única excepción del proyecto a
 * "CSS-first, sin detección de viewport por JS": Framer Motion anima
 * valores en JS, no vía CSS, así que la dirección/comportamiento de una
 * animación (o si un gesto de arrastre debe existir) sí necesita saber el
 * breakpoint activo en JS.
 */
export function useIsDesktop(query = DEFAULT_QUERY) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    setIsDesktop(mql.matches)
    const handleChange = (event) => setIsDesktop(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [query])

  return isDesktop
}

export default useIsDesktop
