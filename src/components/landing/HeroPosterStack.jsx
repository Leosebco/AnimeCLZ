import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Cuánto dura cada póster antes de rotar al siguiente — ver "Nunca
// distraer" en docs/09_UI_UX_DESIGN_SYSTEM.md, por eso es lento (5s), no
// un carrusel apurado.
const ROTATE_MS = 5000

// Offsets de las 3 tarjetas visibles (centro + dos detrás, en diagonal) —
// da la sensación de profundidad ("Efectos de profundidad" pedido en el
// sprint) sin animación 3D real ni una librería nueva.
const DEPTH_OFFSETS = [
  { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 3, opacity: 1 },
  { x: 28, y: 18, rotate: 6, scale: 0.92, zIndex: 2, opacity: 0.75 },
  { x: -24, y: 28, rotate: -5, scale: 0.88, zIndex: 1, opacity: 0.55 },
]

/**
 * Pila de pósters reales con rotación suave y profundidad (v2.5) — nunca
 * imágenes inventadas: `posters` viene de `getTopRated()` (ProviderManager/
 * AnimeProvider, sin tocar), mismos datos que ya usa `CatalogStats`. Si el
 * fetch todavía no resolvió o vino vacío, no se renderiza nada (nunca un
 * placeholder falso) — el Hero sigue viéndose bien solo con los blobs de
 * fondo mientras tanto.
 */
function HeroPosterStack({ posters }) {
  const [index, setIndex] = useState(0)
  const count = posters.length

  useEffect(() => {
    if (count < 2) return
    // Mismo criterio que components/home/Hero.jsx: nunca arrancar una
    // rotación automática si el usuario pidió menos movimiento.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), ROTATE_MS)
    return () => clearInterval(timer)
  }, [count])

  if (!count) return null

  const visible = DEPTH_OFFSETS.map((offset, slot) => ({
    ...offset,
    poster: posters[(index + slot) % count],
  }))

  return (
    <div className="relative mx-auto h-64 w-44 sm:h-80 sm:w-56" aria-hidden>
      <AnimatePresence initial={false}>
        {visible
          .slice()
          .reverse()
          .map(({ poster, x, y, rotate, scale, zIndex, opacity }) => (
            <motion.img
              key={poster.id}
              src={poster.posterSmall || poster.poster}
              alt=""
              loading="lazy"
              animate={{ x, y, rotate, scale, opacity, transition: { duration: 0.9, ease: 'easeInOut' } }}
              style={{ zIndex }}
              className="absolute inset-0 h-full w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
            />
          ))}
      </AnimatePresence>
    </div>
  )
}

export default HeroPosterStack
