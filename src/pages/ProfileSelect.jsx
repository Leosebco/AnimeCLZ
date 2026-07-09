import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import ProfileFormModal from '@/components/profile/ProfileFormModal'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ROUTES } from '@/constants'

/**
 * "¿Quién está viendo AnimeCLZ?" — pantalla estilo Netflix mostrada tras
 * el login (Login.jsx/Register.jsx navegan aquí en vez de a Inicio
 * directamente) y también accesible manualmente vía "Cambiar Perfil" en
 * el menú de cuenta. Layout.jsx redirige aquí automáticamente si hay
 * sesión pero ningún perfil activo todavía.
 */
function ProfileSelect() {
  const { user } = useAuth()
  const { profiles, loading, error, selectProfile, createProfile, refetch } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()
  const [creating, setCreating] = useState(false)

  const redirectTo = location.state?.from?.pathname || ROUTES.HOME

  const handleChoose = (profileId) => {
    selectProfile(profileId)
    navigate(redirectTo, { replace: true })
  }

  const handleCreate = async (values) => {
    const created = await createProfile(values)
    handleChoose(created.id)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
        ¿Quién está viendo AnimeCLZ?
      </h1>
      <p className="mt-2 text-sm text-text-secondary">{user?.email}</p>

      <Container className="mt-10 max-w-3xl">
        {loading && (
          <div className="flex flex-wrap justify-center gap-8">
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
          <div className="flex flex-wrap justify-center gap-8">
            {profiles.map((profile) => (
              <motion.button
                key={profile.id}
                type="button"
                whileHover={{ y: -4 }}
                onClick={() => handleChoose(profile.id)}
                className="group flex flex-col items-center gap-3"
              >
                <ProfileAvatar
                  avatar={profile.avatar}
                  tipoAvatar={profile.tipoAvatar}
                  color={profile.color}
                  nombre={profile.nombre}
                  size={96}
                  className="ring-2 ring-transparent transition-all group-hover:ring-primary"
                />
                <span className="font-display text-sm font-medium text-text-secondary transition-colors group-hover:text-text">
                  {profile.nombre}
                </span>
              </motion.button>
            ))}

            <motion.button
              type="button"
              whileHover={{ y: -4 }}
              onClick={() => setCreating(true)}
              className="group flex flex-col items-center gap-3"
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border text-text-secondary transition-colors group-hover:border-primary group-hover:text-primary">
                <Plus size={28} />
              </span>
              <span className="font-display text-sm font-medium text-text-secondary transition-colors group-hover:text-text">
                Crear Perfil
              </span>
            </motion.button>
          </div>
        )}
      </Container>

      <ProfileFormModal
        open={creating}
        onClose={() => setCreating(false)}
        accountId={user?.id}
        title="Crear perfil"
        onSubmit={handleCreate}
      />
    </div>
  )
}

export default ProfileSelect
