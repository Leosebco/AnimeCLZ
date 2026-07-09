import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  getSession,
  onAuthStateChange,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  signUpWithEmail,
  updatePassword,
} from '@/services/authService'
import { getProfile } from '@/services/profileService'

// El contexto vive aquí (no colocado con un hook useAuth() como
// FavoritesContext) porque el enunciado del sprint pide hooks/useAuth.js
// como archivo separado — mismo motivo de fast-refresh que en
// FavoritesContext, solo que dividido en dos archivos en vez de uno.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

/**
 * Sesión global de AnimeCLZ. persistSession/autoRefreshToken ya están
 * activados en el cliente de Supabase (src/lib/supabase.js) — este
 * provider solo refleja ese estado en React y carga el perfil asociado.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  // userId que el `profile` actual realmente refleja — permite derivar
  // "¿está cargando?" por comparación en vez de un booleano de estado
  // aparte (que podía quedar desincronizado un instante al cambiar de
  // usuario: ver el bug que esto reemplaza, corregido antes de mergear).
  const [profileFetchedFor, setProfileFetchedFor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getSession().then((initialSession) => {
      if (!active) return
      setSession(initialSession)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId) return
    let active = true
    getProfile(userId)
      .then((data) => {
        if (!active) return
        setProfile(data)
        setProfileFetchedFor(userId)
      })
      .catch(() => {
        if (!active) return
        setProfile(null)
        setProfileFetchedFor(userId)
      })
    return () => {
      active = false
    }
  }, [userId])

  // Deriva en vez de "resetear" profile con un setState extra en el efecto
  // de arriba: sin userId, el perfil visible es null sin necesidad de un
  // segundo setState síncrono. profileLoading se deriva comparando
  // profileFetchedFor con el userId actual — así queda en `true` desde el
  // primer render tras un login (sin esperar a que el efecto de arriba
  // corra) y nunca hay una ventana en la que un admin real parezca "sin
  // rol todavía" y ProtectedRoute lo rebote a Inicio.
  const visibleProfile = userId ? profile : null
  const visibleProfileLoading = Boolean(userId) && profileFetchedFor !== userId

  const refreshProfile = useCallback(async () => {
    if (!userId) return
    const data = await getProfile(userId)
    setProfile(data)
  }, [userId])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile: visibleProfile,
      loading,
      profileLoading: visibleProfileLoading,
      isAuthenticated: Boolean(session?.user),
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
    }),
    [session, visibleProfile, loading, visibleProfileLoading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
