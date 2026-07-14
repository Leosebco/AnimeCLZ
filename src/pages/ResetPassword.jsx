import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthCard from '@/components/auth/AuthCard'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

/**
 * Destino del enlace enviado por sendPasswordReset (ver authService). El
 * enlace ya deja al usuario con una sesión temporal válida solo para
 * cambiar la contraseña — Supabase lo maneja mediante detectSessionInUrl.
 */
function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  // v2.8 — auditoría: ver Login.jsx, mismo riesgo de navegación tardía si
  // el usuario se va de la página dentro de los 2000ms.
  const redirectTimeoutRef = useRef(null)
  useEffect(() => () => clearTimeout(redirectTimeoutRef.current), [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
      redirectTimeoutRef.current = setTimeout(() => navigate(ROUTES.HOME, { replace: true }), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthCard title="Contraseña actualizada">
        <p className="text-center text-sm text-text-secondary">
          Te llevaremos al inicio en un momento…
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Restablecer contraseña" subtitle="Elige una nueva contraseña para tu cuenta.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <FormField
          label="Confirmar nueva contraseña"
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

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Guardar contraseña
        </Button>
      </form>
    </AuthCard>
  )
}

export default ResetPassword
