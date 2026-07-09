import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import GoogleIcon from '@/components/auth/GoogleIcon'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

function Login() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmail({ email, password })
      navigate(ROUTES.PROFILE_SELECT, { replace: true, state: { from } })
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

  return (
    <AuthCard
      title="Inicia sesión"
      subtitle="Accede a tu Mi Lista, favoritos y perfil."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-primary hover:text-primary-hover">
            Crear cuenta
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="-mt-1 text-right text-sm">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-text-secondary hover:text-primary">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting || googleLoading}>
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Iniciar sesión
        </Button>
      </form>
    </AuthCard>
  )
}

export default Login
