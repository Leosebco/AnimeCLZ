import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'

/**
 * Número que cuenta hacia arriba al entrar en pantalla (v2.5 — "Animadas
 * al entrar" pedido por docs/10_LANDING_PAGE.md para Estadísticas). Cuenta
 * solo la parte numérica de `value` (p. ej. "+15.000" → anima 0→15000 y
 * reaplica el prefijo/formato); si `value` no tiene un número real
 * (todavía cargando, o "24/7") lo muestra tal cual, sin animar — nunca
 * inventa un número de relleno mientras carga.
 */
function AnimatedStat({ value }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(value)

  const numericMatch = typeof value === 'string' ? value.match(/[\d.,]+/) : null
  const targetNumber = numericMatch ? Number(numericMatch[0].replace(/[.,]/g, '')) : null

  useEffect(() => {
    if (!inView || targetNumber === null || !Number.isFinite(targetNumber)) {
      setDisplay(value)
      return
    }
    const prefix = value.slice(0, numericMatch.index)
    const suffix = value.slice(numericMatch.index + numericMatch[0].length)
    const controls = animate(0, targetNumber, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (current) => setDisplay(`${prefix}${Math.round(current).toLocaleString('es-419')}${suffix}`),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  return <span ref={ref}>{display}</span>
}

export default AnimatedStat
