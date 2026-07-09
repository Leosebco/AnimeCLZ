import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import GoogleIcon from '@/components/auth/GoogleIcon'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

function Register() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      const data = await signUpWithEmail({ email, password, username })
      if (data.session) {
        navigate(ROUTES.PROFILE_SELECT, { replace: true })
      } else {
        setConfirmationSent(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  if (confirmationSent) {
    return (
      <AuthCard title="Revisa tu correo">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background">
            <MailCheck className="text-primary" size={26} aria-hidden />
          </span>
          <p className="text-sm text-text-secondary">
            Te enviamos un enlace de confirmación a <strong className="text-text">{email}</strong>.
            Ábrelo para activar tu cuenta.
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
      title="Crea tu cuenta"
      subtitle="Guarda tu Mi Lista, favoritos e historial en cualquier dispositivo."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:text-primary-hover">
            Inicia sesión
          </Link>
        </>
      }
    >
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogle}
        disabled={googleLoading || submitting}
      >
        {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
        Continuar con Google
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-text-secondary">
        <span className="h-px flex-1 bg-border" aria-hidden />
        o con tu correo
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label="Nombre de usuario"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <FormField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <FormField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting || googleLoading}>
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Crear cuenta
        </Button>
      </form>
    </AuthCard>
  )
}

export default Register
