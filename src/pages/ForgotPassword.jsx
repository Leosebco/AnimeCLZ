import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Revisa tu correo">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <MailCheck className="text-primary" size={26} aria-hidden />
          </span>
          <p className="text-sm text-text-secondary">
            Si <strong className="text-text">{email}</strong> tiene una cuenta, te enviamos un enlace
            para restablecer tu contraseña.
          </p>
          <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-primary hover:text-primary-hover">
            Volver a iniciar sesión
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace a tu correo para crear una nueva."
      footer={
        <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:text-primary-hover">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Enviar enlace
        </Button>
      </form>
    </AuthCard>
  )
}

export default ForgotPassword
