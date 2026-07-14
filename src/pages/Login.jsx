import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import GoogleIcon from '@/components/auth/GoogleIcon'
import LoginMascot from '@/components/auth/LoginMascot'
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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  // v2.5 — qué campo tiene foco ahora mismo, para que la mascota reaccione
  // (ver LoginMascot.jsx). 'idle' cuando no hay foco en ningún campo.
  const [focusedField, setFocusedField] = useState('idle')
  // v2.8 — auditoría: `navigate()` disparaba igual desde un setTimeout sin
  // limpiar si el usuario se iba de la página dentro de los 700ms (back
  // button, otro link) — una navegación sorpresa llegaba tarde. El ref
  // guarda el id para poder cancelarlo al desmontar.
  const redirectTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(redirectTimeoutRef.current), [])

  const mascotState = success ? 'success' : error ? 'error' : showPassword && focusedField === 'password' ? 'password-visible' : focusedField

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithEmail({ email, password })
      setSuccess(true)
      // Espera a que se vea la animación de éxito de la mascota (ver
      // LoginMascot.jsx) antes de navegar — sin este delay, `navigate()`
      // desmonta la página de inmediato y el usuario nunca llega a verla.
      // `submitting` queda en true a propósito durante la espera (evita un
      // reenvío y mantiene el botón/loader consistentes hasta que
      // realmente se navega) — solo se limpia en el catch de abajo.
      redirectTimeoutRef.current = setTimeout(() => {
        navigate(ROUTES.PROFILE_SELECT, { replace: true, state: { from } })
      }, 700)
      return
    } catch (err) {
      setError(err.message)
    }
    setSubmitting(false)
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
      mascot={<LoginMascot state={mascotState} />}
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
          onFocus={() => setFocusedField('username')}
          onBlur={() => setFocusedField('idle')}
        />
        <FormField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField('idle')}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
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
