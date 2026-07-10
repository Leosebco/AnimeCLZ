import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import ProfileFormModal from '@/components/profile/ProfileFormModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { MAX_PROFILES, PROFILE_BACKGROUNDS, ROUTES } from '@/constants'
import { cn } from '@/utils/cn'

const SELECT_TRANSITION_MS = 260

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const tileVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: 'easeIn' } },
}

function backgroundFor(fondoId) {
  return PROFILE_BACKGROUNDS.find((background) => background.id === fondoId) ?? PROFILE_BACKGROUNDS[0]
}

/**
 * "¿Quién está viendo AnimeCLZ?" — pantalla estilo Netflix mostrada tras
 * el login (Login.jsx/Register.jsx navegan aquí en vez de a Inicio
 * directamente) y también accesible manualmente vía "Cambiar Perfil" en
 * el menú de cuenta. Layout.jsx redirige aquí automáticamente si hay
 * sesión pero ningún perfil activo todavía (ver ProfileContext.jsx para
 * cuándo exactamente: login nuevo, otra cuenta, cerrar sesión, o 30+ min
 * de inactividad — nunca en un simple refresh de página).
 *
 * v1.5: cada tarjeta suma Editar/Eliminar (antes solo existían para el
 * perfil activo, vía "Mi Perfil") — siempre visibles, no gateados por
 * hover (misma lección del sprint móvil con AnimeCard: hover-only rompe en
 * touch). Máximo 4 perfiles por cuenta (ver MAX_PROFILES) — el trigger
 * `enforce_max_profiles`/`protect_profile_account_deletion` en Supabase
 * (migración 0019) son la validación real; esto solo evita el intento y
 * muestra el mensaje real del backend si de todos modos falla.
 */
function ProfileSelect() {
  const { user } = useAuth()
  const { profiles, loading, error, selectProfile, createProfile, updateProfile, deleteProfile, refetch } =
    useProfile()
  const navigate = useNavigate()
  const location = useLocation()
  const [creating, setCreating] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [deletingProfile, setDeletingProfile] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [selectingId, setSelectingId] = useState(null)

  const redirectTo = location.state?.from?.pathname || ROUTES.HOME
  const atProfileLimit = profiles.length >= MAX_PROFILES
  const modalOpen = creating || Boolean(editingProfile)

  const handleChoose = (profileId) => {
    if (selectingId) return
    setSelectingId(profileId)
    // Pequeña transición antes de navegar (pedido explícito v1.0) — en vez
    // de un salto instantáneo, se ve el perfil elegido "confirmarse".
    setTimeout(() => {
      selectProfile(profileId)
      navigate(redirectTo, { replace: true })
    }, SELECT_TRANSITION_MS)
  }

  // No selecciona ni navega automáticamente al crear: el nuevo perfil
  // aparece en esta misma grilla (createProfile ya actualiza `profiles`
  // en ProfileContext) para poder seguir creando más de uno por cuenta;
  // el usuario elige con cuál continuar tocándolo, como cualquier otro.
  const closeModal = () => {
    setCreating(false)
    setEditingProfile(null)
  }

  const handleSubmit = async (values) => {
    if (editingProfile) await updateProfile(editingProfile.id, values)
    else await createProfile(values)
  }

  const handleConfirmDelete = async () => {
    setDeleteError(null)
    try {
      await deleteProfile(deletingProfile.id)
    } catch (err) {
      setDeleteError(err.message)
      throw err
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center">
      {/* Fondo animado: blobs de gradiente muy suaves, en línea con el
          resto del sitio (nunca un gradiente pantalla completo saturado). */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-24 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative font-display text-2xl font-bold text-text sm:text-3xl"
      >
        ¿Quién está viendo AnimeCLZ?
      </motion.h1>
      <p className="relative mt-2 text-sm text-text-secondary">{user?.email}</p>

      <Container className="relative mt-10 max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-10">
          {loading && (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && <ErrorState onRetry={refetch} />}

          {!loading && !error && (
            <>
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap justify-center gap-4 sm:gap-8"
              >
                <AnimatePresence>
                  {profiles.map((profile) => {
                    const isSelecting = selectingId === profile.id
                    const isDimmed = selectingId !== null && !isSelecting
                    const background = backgroundFor(profile.fondo)
                    return (
                      <motion.div
                        key={profile.id}
                        variants={tileVariants}
                        exit="exit"
                        layout
                        animate={{
                          opacity: isDimmed ? 0.35 : 1,
                          scale: isSelecting ? 1.1 : 1,
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <motion.button
                          type="button"
                          whileHover={!selectingId ? { y: -6, scale: 1.06 } : undefined}
                          whileTap={!selectingId ? { scale: 0.96 } : undefined}
                          onClick={() => handleChoose(profile.id)}
                          disabled={Boolean(selectingId)}
                          className="group flex flex-col items-center gap-3"
                        >
                          <span
                            className="rounded-full p-2 transition-transform"
                            style={
                              background.preview !== 'none' ? { backgroundImage: background.preview } : undefined
                            }
                          >
                            <ProfileAvatar
                              avatar={profile.avatar}
                              tipoAvatar={profile.tipoAvatar}
                              color={profile.color}
                              nombre={profile.nombre}
                              size={96}
                              className={cn(
                                'ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary group-hover:shadow-[0_0_30px_-6px_rgba(79,140,255,0.6)]',
                                isSelecting && 'ring-primary shadow-[0_0_36px_-4px_rgba(79,140,255,0.8)]',
                              )}
                            />
                          </span>
                          <span className="font-display text-sm font-medium text-text-secondary transition-colors group-hover:text-text">
                            {profile.nombre}
                          </span>
                        </motion.button>

                        {!selectingId && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingProfile(profile)}
                              aria-label={`Editar ${profile.nombre}`}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text"
                            >
                              <Pencil size={14} />
                            </button>
                            {profiles.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError(null)
                                  setDeletingProfile(profile)
                                }}
                                aria-label={`Eliminar ${profile.nombre}`}
                                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-error"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {!selectingId && !atProfileLimit && (
                  <motion.div
                    variants={tileVariants}
                    exit="exit"
                    layout
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ y: -6, scale: 1.06 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCreating(true)}
                      className="group flex flex-col items-center gap-3 p-2"
                    >
                      <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border text-text-secondary transition-colors group-hover:border-primary group-hover:text-primary">
                        <Plus size={28} />
                      </span>
                      <span className="font-display text-sm font-medium text-text-secondary transition-colors group-hover:text-text">
                        Crear Perfil
                      </span>
                    </motion.button>
                    {/* Placeholder invisible para alinear con la fila de Editar/Eliminar de las otras tarjetas */}
                    <div className="h-11" aria-hidden />
                  </motion.div>
                )}
              </motion.div>

              {atProfileLimit && (
                <p className="relative mt-6 text-xs text-text-secondary">
                  Alcanzaste el máximo de {MAX_PROFILES} perfiles por cuenta.
                </p>
              )}
            </>
          )}
        </div>
      </Container>

      <ProfileFormModal
        open={modalOpen}
        onClose={closeModal}
        accountId={user?.id}
        title={editingProfile ? 'Editar perfil' : 'Crear perfil'}
        initialValue={editingProfile}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingProfile)}
        onClose={() => setDeletingProfile(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar perfil"
        confirmLabel="Eliminar"
        danger
        description={
          deleteError || `¿Eliminar el perfil "${deletingProfile?.nombre}"? Se perderán sus favoritos, historial y Mi Lista.`
        }
      />
    </div>
  )
}

export default ProfileSelect
