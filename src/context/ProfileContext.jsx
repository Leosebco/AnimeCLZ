import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  createProfile as createProfileRequest,
  deactivateProfile,
  listProfiles,
  updateProfile as updateProfileRequest,
} from '@/services/profilesAccountService'
import { AVATAR_TYPES, MAX_PROFILES, PROFILE_COLORS } from '@/constants'
import { devError, devLog } from '@/utils/logger'

// 30 minutos sin actividad = sesión "inactiva" a efectos del selector de
// perfiles (pedido explícito v1.0) — no del login de Supabase en sí, que
// sigue viva mucho más tiempo (persistSession/autoRefreshToken).
const ACTIVITY_TTL_MS = 30 * 60 * 1000

function storageKey(accountId) {
  return `animeclz:activeProfile:${accountId}`
}

function activityKey(accountId) {
  return `animeclz:lastActivity:${accountId}`
}

function touchActivity(accountId) {
  if (accountId) localStorage.setItem(activityKey(accountId), String(Date.now()))
}

function isActivityFresh(accountId) {
  const raw = localStorage.getItem(activityKey(accountId))
  if (!raw) return false
  const last = Number(raw)
  return Number.isFinite(last) && Date.now() - last < ACTIVITY_TTL_MS
}

// El contexto vive aquí (no colocado con un hook useProfile() como
// FavoritesContext) por el mismo motivo que AuthContext: hooks/useProfile.js
// como archivo separado, con el mismo eslint-disable de fast-refresh.
// eslint-disable-next-line react-refresh/only-export-components
export const ProfileContext = createContext(null)

/**
 * Perfiles múltiples por cuenta, estilo Netflix (ver migración 0009 y
 * profilesAccountService.js).
 *
 * El selector de perfiles NO debe aparecer en cada refresh (v1.0): se
 * recuerda el último perfil elegido en localStorage por cuenta, y solo se
 * vuelve a pedir cuando (a) es un login nuevo, (b) es otra cuenta, (c) se
 * cerró sesión explícitamente (ver `clearActiveProfile` en los handlers de
 * cerrar sesión), o (d) pasaron 30+ minutos sin actividad — `touchActivity`
 * se llama al elegir perfil y en un heartbeat mientras la pestaña está
 * visible, así que "inactivo" de verdad significa la pestaña en segundo
 * plano/cerrada, no solo estar leyendo una ficha de anime un rato largo.
 */
export function ProfileProvider({ children }) {
  const { user, profile: accountProfile } = useAuth()
  const accountId = user?.id ?? null

  const [profiles, setProfiles] = useState([])
  const [profilesError, setProfilesError] = useState(null)
  // accountId cuyo `profiles` actual realmente refleja — mismo patrón de
  // AuthContext (profileFetchedFor) para derivar "cargando" sin un
  // booleano de estado aparte que pueda desincronizarse un instante.
  const [profilesFetchedFor, setProfilesFetchedFor] = useState(null)
  const [activeProfileId, setActiveProfileId] = useState(null)

  // Ref (no dependencia de fetchProfiles): el nombre de respaldo para el
  // perfil autogenerado no debe hacer que fetchProfiles cambie de
  // identidad cada vez que `accountProfile`/`user` se renuevan — Supabase
  // entrega un objeto `session`/`user` NUEVO en cada evento de auth,
  // incluido un simple refresh de token en segundo plano. Si esos objetos
  // fueran dependencias de fetchProfiles, el efecto de montaje de abajo
  // (que depende de fetchProfiles) se volvería a disparar en medio de la
  // sesión y dispararía un listProfiles/createProfile DUPLICADO.
  const defaultNameRef = useRef('Mi Perfil')
  useEffect(() => {
    defaultNameRef.current = accountProfile?.username || user?.email?.split('@')[0] || 'Mi Perfil'
  }, [accountProfile, user])

  // Evita que dos invocaciones de fetchProfiles para la misma cuenta
  // corran en paralelo (defensa adicional, por si el efecto de montaje se
  // disparara dos veces por cualquier otro motivo) — sin esto, ambas
  // podían ver 0 perfiles y crear dos perfiles "principales" duplicados.
  const fetchingForRef = useRef(null)

  const fetchProfiles = useCallback(async () => {
    if (!accountId) return
    if (fetchingForRef.current === accountId) return
    fetchingForRef.current = accountId
    try {
      const data = await listProfiles(accountId)
      devLog('[ProfileContext] listProfiles:', data)

      let finalData = data
      if (data.length === 0) {
        // 0 filas no es un error: la cuenta existe pero, por la razón que
        // sea (el trigger de auto-creación no llegó a correr, un backfill
        // incompleto, etc.), se quedó sin perfil. En vez de mostrar un
        // selector vacío exigiendo "Crear Perfil" a mano, se crea el
        // perfil principal automáticamente y se continúa.
        const created = await createProfileRequest(accountId, {
          nombre: defaultNameRef.current,
          avatar: null,
          tipoAvatar: AVATAR_TYPES.INITIAL,
          color: PROFILE_COLORS[0],
        })
        devLog('[ProfileContext] perfil principal autocreado:', created)
        finalData = [created]
      }
      setProfiles(finalData)

      // Restaurar el último perfil elegido EN EL MISMO paso que resolvemos
      // las filas (no en un useEffect separado que corre un tick después):
      // hacerlo aparte dejaba una ventana de un render donde `loading` ya
      // era `false` pero `activeProfileId` todavía no se había restaurado
      // — Layout.jsx veía "hay sesión pero no hay perfil activo" en ese
      // instante y redirigía al selector en CADA refresh de página, así
      // hubiera un perfil recordado válido y reciente.
      if (data.length === 0) {
        // El único perfil recién creado se selecciona solo — no tiene
        // sentido mostrarle el selector a alguien que no tenía ninguno.
        setActiveProfileId(finalData[0].id)
        touchActivity(accountId)
        localStorage.setItem(storageKey(accountId), finalData[0].id)
      } else if (isActivityFresh(accountId)) {
        const remembered = localStorage.getItem(storageKey(accountId))
        if (remembered && finalData.some((profile) => profile.id === remembered)) {
          setActiveProfileId(remembered)
        }
      }
      // Si la actividad no está "fresca" (30+ min sin uso) simplemente no
      // se restaura nada — activeProfile queda en null y el selector se
      // muestra, sin necesidad de borrar el recuerdo (se reutiliza en
      // cuanto el usuario vuelva a elegir).

      setProfilesError(null)
      setProfilesFetchedFor(accountId)
    } catch (err) {
      devError('[ProfileContext] fetchProfiles error:', err)
      setProfiles([])
      setProfilesError(err)
      setProfilesFetchedFor(accountId)
    } finally {
      fetchingForRef.current = null
    }
  }, [accountId])

  useEffect(() => {
    if (!accountId) return
    fetchProfiles()
  }, [accountId, fetchProfiles])

  // Heartbeat de actividad: mientras la pestaña esté visible y haya una
  // cuenta activa, "tocar" la marca de tiempo cada minuto y al volver a
  // foco — así 30 minutos "inactivo" refleja la pestaña en segundo plano
  // o cerrada, no solo quedarse leyendo una página larga.
  useEffect(() => {
    if (!accountId) return
    touchActivity(accountId)

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') touchActivity(accountId)
    }, 60 * 1000)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') touchActivity(accountId)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [accountId])

  const selectProfile = useCallback(
    (id) => {
      setActiveProfileId(id)
      if (accountId) {
        localStorage.setItem(storageKey(accountId), id)
        touchActivity(accountId)
      }
    },
    [accountId],
  )

  const clearActiveProfile = useCallback(() => {
    setActiveProfileId(null)
    if (accountId) {
      localStorage.removeItem(storageKey(accountId))
      localStorage.removeItem(activityKey(accountId))
    }
  }, [accountId])

  const createProfile = useCallback(
    async (input) => {
      // Chequeo amable antes del round-trip — el trigger `enforce_max_profiles`
      // (migración 0019) es la validación real y queda como respaldo.
      if (profiles.length >= MAX_PROFILES) {
        throw new Error(`Una cuenta puede tener hasta ${MAX_PROFILES} perfiles.`)
      }
      const created = await createProfileRequest(accountId, input)
      setProfiles((prev) => [...prev, created])
      return created
    },
    [accountId, profiles],
  )

  const updateProfileById = useCallback(async (id, input) => {
    const updated = await updateProfileRequest(id, input)
    setProfiles((prev) => prev.map((profile) => (profile.id === id ? updated : profile)))
    return updated
  }, [])

  const deleteProfile = useCallback(
    async (id) => {
      await deactivateProfile(id)
      setProfiles((prev) => prev.filter((profile) => profile.id !== id))
      if (activeProfileId === id) clearActiveProfile()
    },
    [activeProfileId, clearActiveProfile],
  )

  // Memoizado (igual que en useUserCollection.js): sin esto, un array
  // literal nuevo en cada render invalidaría el useMemo de `value` de
  // abajo incluso cuando `profiles`/`accountId` no cambiaron.
  const visibleProfiles = useMemo(() => (accountId ? profiles : []), [accountId, profiles])
  const loading = Boolean(accountId) && profilesFetchedFor !== accountId
  const activeProfile = visibleProfiles.find((profile) => profile.id === activeProfileId) ?? null
  // El perfil más antiguo (primero creado) es el que el trigger
  // sync_default_profile_rol mantiene igualado al rol de la cuenta — es el
  // único que no se puede eliminar (ver Profile.jsx).
  const defaultProfileId = visibleProfiles[0]?.id ?? null

  const value = useMemo(
    () => ({
      profiles: visibleProfiles,
      activeProfile,
      activeProfileId,
      defaultProfileId,
      loading,
      error: accountId ? profilesError : null,
      selectProfile,
      clearActiveProfile,
      createProfile,
      updateProfile: updateProfileById,
      deleteProfile,
      refetch: fetchProfiles,
    }),
    [
      visibleProfiles,
      activeProfile,
      activeProfileId,
      defaultProfileId,
      loading,
      accountId,
      profilesError,
      selectProfile,
      clearActiveProfile,
      createProfile,
      updateProfileById,
      deleteProfile,
      fetchProfiles,
    ],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
