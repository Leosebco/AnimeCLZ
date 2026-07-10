import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  createProfile as createProfileRequest,
  deactivateProfile,
  listProfiles,
  updateProfile as updateProfileRequest,
} from '@/services/profilesAccountService'
import { AVATAR_TYPES, PROFILE_COLORS } from '@/constants'
import { devError, devLog } from '@/utils/logger'

function storageKey(accountId) {
  return `animeclz:activeProfile:${accountId}`
}

// El contexto vive aquí (no colocado con un hook useProfile() como
// FavoritesContext) por el mismo motivo que AuthContext: hooks/useProfile.js
// como archivo separado, con el mismo eslint-disable de fast-refresh.
// eslint-disable-next-line react-refresh/only-export-components
export const ProfileContext = createContext(null)

/**
 * Perfiles múltiples por cuenta, estilo Netflix (ver migración 0009 y
 * profilesAccountService.js). El perfil activo se recuerda en localStorage
 * por cuenta, así que un usuario que ya eligió "Leonardo" no vuelve a ver
 * el selector en cada visita — solo al cerrar sesión o pedir "Cambiar
 * Perfil" explícitamente.
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
  // sesión y dispararía un listProfiles/createProfile DUPLICADO — la
  // causa raíz real del "No pudimos cargar esta sección" intermitente en
  // el selector de perfiles: dos llamadas corriendo en paralelo podían
  // pisarse el estado final entre sí de forma no determinística.
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
        setProfiles([created])
        setActiveProfileId(created.id)
        localStorage.setItem(storageKey(accountId), created.id)
      } else {
        setProfiles(data)
      }

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

  // Al resolver la lista de perfiles de esta cuenta, restaura el que se
  // recordó la última vez (si sigue existiendo y activo).
  useEffect(() => {
    if (!accountId || profilesFetchedFor !== accountId) return
    const remembered = localStorage.getItem(storageKey(accountId))
    if (remembered && profiles.some((profile) => profile.id === remembered)) {
      setActiveProfileId(remembered)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, profilesFetchedFor])

  const selectProfile = useCallback(
    (id) => {
      setActiveProfileId(id)
      if (accountId) localStorage.setItem(storageKey(accountId), id)
    },
    [accountId],
  )

  const clearActiveProfile = useCallback(() => {
    setActiveProfileId(null)
    if (accountId) localStorage.removeItem(storageKey(accountId))
  }, [accountId])

  const createProfile = useCallback(
    async (input) => {
      const created = await createProfileRequest(accountId, input)
      setProfiles((prev) => [...prev, created])
      return created
    },
    [accountId],
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
