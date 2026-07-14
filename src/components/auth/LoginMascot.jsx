import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsDesktop } from '@/hooks/useIsDesktop'

/**
 * Mascota interactiva de Login/Registro (v2.5) — diseño 100% original,
 * dibujado a mano en SVG dentro de este archivo (círculos/paths, ningún
 * asset externo) para no depender de un personaje con copyright, tal como
 * exige docs/10_LANDING_PAGE.md ("Nunca personajes con copyright... No
 * usar recursos sin licencia"). Ver el informe de entrega del sprint para
 * la investigación de Rive/Lottie — esta es la implementación que quedó
 * lista ahora mismo, sin depender de ninguna de las dos.
 *
 * `state` — uno de los 6 disparadores pedidos por el sprint:
 * 'idle' | 'username' | 'password' | 'password-visible' | 'error' | 'success'
 *
 * En desktop, en estado 'idle' los ojos siguen el cursor dentro de la
 * tarjeta (`useIsDesktop` — mismo hook ya usado por Modal.jsx/Hero.jsx,
 * nunca detección de viewport nueva); en mobile no hay cursor que seguir,
 * así que se queda en un parpadeo suave.
 */
function LoginMascot({ state = 'idle' }) {
  const isDesktop = useIsDesktop()
  const containerRef = useRef(null)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isDesktop || state !== 'idle') {
      setPupilOffset({ x: 0, y: 0 })
      return
    }
    function handlePointerMove(event) {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = event.clientX - centerX
      const dy = event.clientY - centerY
      const distance = Math.hypot(dx, dy) || 1
      const maxOffset = 3.5
      setPupilOffset({
        x: (dx / distance) * Math.min(maxOffset, distance / 40),
        y: (dy / distance) * Math.min(maxOffset, distance / 40),
      })
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [isDesktop, state])

  const bodyMotion =
    state === 'error'
      ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
      : state === 'success'
        ? { y: [0, -10, 0], scale: [1, 1.05, 1], transition: { duration: 0.5, ease: 'easeOut' } }
        : { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }

  const eyesClosed = state === 'password'
  const eyesWide = state === 'password-visible'
  const happy = state === 'success'
  const sad = state === 'error'

  return (
    <div ref={containerRef} className="mx-auto h-24 w-24 select-none" aria-hidden>
      <motion.svg viewBox="0 0 100 100" animate={bodyMotion} className="h-full w-full">
        {/* Cuerpo — un blob simple, color de marca (no rojo/naranja/amarillo) */}
        <circle cx="50" cy="52" r="38" className="fill-primary/20" />
        <circle cx="50" cy="52" r="32" className="fill-primary/90" />

        {/* Mejillas — solo visibles feliz/avergonzado */}
        {(happy || state === 'password') && (
          <>
            <circle cx="30" cy="58" r="5" className="fill-secondary/40" />
            <circle cx="70" cy="58" r="5" className="fill-secondary/40" />
          </>
        )}

        {/* Ojos */}
        {eyesClosed ? (
          <>
            <path d="M32 48 Q38 44 44 48" className="stroke-background" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M56 48 Q62 44 68 48" className="stroke-background" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : sad ? (
          <>
            <path d="M33 45 L45 51" className="stroke-background" strokeWidth="3" strokeLinecap="round" />
            <path d="M67 45 L55 51" className="stroke-background" strokeWidth="3" strokeLinecap="round" />
            <circle cx="39" cy="52" r={4} className="fill-background" />
            <circle cx="61" cy="52" r={4} className="fill-background" />
          </>
        ) : happy ? (
          <>
            <path d="M32 50 Q38 42 44 50" className="stroke-background" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M56 50 Q62 42 68 50" className="stroke-background" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="39" cy="49" r={eyesWide ? 7 : 5.5} className="fill-background" />
            <circle cx="61" cy="49" r={eyesWide ? 7 : 5.5} className="fill-background" />
            <motion.circle
              cx={39 + pupilOffset.x}
              cy={49 + pupilOffset.y}
              r={2.2}
              className="fill-primary"
              animate={{ cx: 39 + pupilOffset.x, cy: 49 + pupilOffset.y }}
              transition={{ duration: 0.15 }}
            />
            <motion.circle
              cx={61 + pupilOffset.x}
              cy={49 + pupilOffset.y}
              r={2.2}
              className="fill-primary"
              animate={{ cx: 61 + pupilOffset.x, cy: 49 + pupilOffset.y }}
              transition={{ duration: 0.15 }}
            />
          </>
        )}

        {/* Boca */}
        {happy ? (
          <path d="M40 64 Q50 74 60 64" className="stroke-background" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : sad ? (
          <path d="M40 68 Q50 60 60 68" className="stroke-background" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : eyesClosed ? (
          <circle cx="50" cy="65" r={2.5} className="fill-background" />
        ) : (
          <path d="M43 64 Q50 68 57 64" className="stroke-background" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </motion.svg>

      <AnimatePresence>
        {happy && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="pointer-events-none -mt-6 text-center text-lg"
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LoginMascot
