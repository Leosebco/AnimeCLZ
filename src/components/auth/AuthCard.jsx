import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clapperboard } from 'lucide-react'
import Container from '@/components/ui/Container'
import { ROUTES } from '@/constants'

/**
 * Shell centrado y compartido por Login/Registro/Recuperar y Restablecer
 * contraseña — mismo marco visual, cada página solo aporta el formulario.
 *
 * v2.5 — rediseño: antes era una tarjeta plana sobre `bg-background` sin
 * ninguna relación visual con la Landing (auditoría del sprint lo marcó
 * como hallazgo real: docs/10_LANDING_PAGE.md pide explícitamente "Login
 * debe integrarse visualmente con la Landing. Nunca sentirse como otra
 * página distinta"). Ahora reusa los mismos blobs de gradiente animados
 * del Hero de `Landing.jsx` (mismos valores, tono/duración — no una
 * paleta nueva) detrás de una tarjeta glassmorphism (`bg-card/70` +
 * `backdrop-blur-xl`, ver "Diseño" en docs/10: "Glassmorphism. Blur.
 * Glow."). `mascot` (opcional, v2.5) es el slot para `LoginMascot` — solo
 * Login/Registro lo pasan; Recuperar/Restablecer contraseña no.
 */
function AuthCard({ title, subtitle, children, footer, mascot }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-[24rem] w-[24rem] rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, -32, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <Container className="flex justify-center px-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
          className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-8 shadow-2xl backdrop-blur-xl"
        >
          <Link
            to={ROUTES.LANDING}
            className="mb-4 flex items-center justify-center gap-2 font-display text-lg font-bold text-text"
          >
            <Clapperboard className="text-primary" size={22} aria-hidden />
            AnimeCLZ
          </Link>
          {mascot}
          <h1 className="text-center font-display text-2xl font-bold text-text">{title}</h1>
          {subtitle && <p className="mt-1.5 text-center text-sm text-text-secondary">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}
        </motion.div>
      </Container>
    </div>
  )
}

export default AuthCard
