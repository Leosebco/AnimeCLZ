import { Link } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'
import Container from '@/components/ui/Container'
import { ROUTES } from '@/constants'

/**
 * Shell centrado y compartido por Login/Registro/Recuperar y Restablecer
 * contraseña — mismo marco visual, cada página solo aporta el formulario.
 */
function AuthCard({ title, subtitle, children, footer }) {
  return (
    <Container className="flex min-h-screen items-center justify-center pt-24 pb-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <Link
          to={ROUTES.LANDING}
          className="mb-6 flex items-center justify-center gap-2 font-display text-lg font-bold text-text"
        >
          <Clapperboard className="text-primary" size={22} aria-hidden />
          AnimeCLZ
        </Link>
        <h1 className="text-center font-display text-2xl font-bold text-text">{title}</h1>
        {subtitle && <p className="mt-1.5 text-center text-sm text-text-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}
      </div>
    </Container>
  )
}

export default AuthCard
