import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogOut, Pencil, Trash2 } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ProfileAvatar from '@/components/profile/ProfileAvatar'
import ProfileFormModal from '@/components/profile/ProfileFormModal'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { PROFILE_BACKGROUNDS, ROLE_LABELS, ROUTES } from '@/constants'

/**
 * "Mi Perfil" — el perfil activo (no la cuenta): avatar, nombre, rol,
 * correo de la cuenta y fecha de creación del perfil. Editar (avatar/
 * nombre/tema/fondo) reutiliza ProfileFormModal; eliminar está
 * deshabilitado para el perfil predeterminado (el que
 * profilesAccountService/migración 0009 mantienen sincronizado con el rol
 * de la cuenta) y pasa por una confirmación real (v1.5 — antes borraba al
 * primer click).
 */
function Profile() {
  const { user, signOut } = useAuth()
  const { activeProfile, defaultProfileId, updateProfile, deleteProfile, clearActiveProfile } = useProfile()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [signingOut, setSigningOut] = useState(false)

  if (!activeProfile) return null

  const isDefaultProfile = activeProfile.id === defaultProfileId
  const background = PROFILE_BACKGROUNDS.find((bg) => bg.id === activeProfile.fondo) ?? PROFILE_BACKGROUNDS[0]

  const handleUpdate = async (values) => {
    await updateProfile(activeProfile.id, values)
  }

  const handleDelete = async () => {
    setDeleteError(null)
    try {
      await deleteProfile(activeProfile.id)
      navigate(ROUTES.PROFILE_SELECT, { replace: true })
    } catch (err) {
      setDeleteError(err.message)
      throw err
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    // Ver AccountMenu.jsx: cerrar sesión debe volver a mostrar el
    // selector de perfiles en el próximo login, aunque sea la misma cuenta.
    clearActiveProfile()
    navigate(ROUTES.LANDING, { replace: true })
  }

  return (
    <Container className="max-w-2xl pt-28 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl border border-border p-5"
        style={background.preview !== 'none' ? { backgroundImage: background.preview } : undefined}
      >
        {background.preview !== 'none' && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10"
            aria-hidden
          />
        )}
        <div className="relative flex items-center gap-5">
          <ProfileAvatar
            avatar={activeProfile.avatar}
            tipoAvatar={activeProfile.tipoAvatar}
            color={activeProfile.color}
            nombre={activeProfile.nombre}
            size={88}
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">{activeProfile.nombre}</h1>
            <p className="text-sm text-text-secondary">{ROLE_LABELS[activeProfile.rol] || activeProfile.rol}</p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <dt className="text-xs uppercase tracking-wide text-text-secondary">Correo de la cuenta</dt>
          <dd className="mt-1 text-sm text-text">{user?.email}</dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <dt className="text-xs uppercase tracking-wide text-text-secondary">Perfil creado</dt>
          <dd className="mt-1 text-sm text-text">
            {new Date(activeProfile.fechaCreacion).toLocaleDateString('es-419')}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil size={16} />
          Editar perfil
        </Button>
        {!isDefaultProfile && (
          <Button variant="ghost" onClick={() => setConfirmingDelete(true)} className="text-error">
            <Trash2 size={16} />
            Eliminar perfil
          </Button>
        )}
      </div>

      {isDefaultProfile && (
        <p className="mt-3 text-xs text-text-secondary">
          Este es el perfil predeterminado de la cuenta — no se puede eliminar.
        </p>
      )}

      <div className="mt-10 border-t border-border pt-6">
        <Button variant="ghost" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          Cerrar sesión
        </Button>
      </div>

      <ProfileFormModal
        open={editing}
        onClose={() => setEditing(false)}
        accountId={user?.id}
        title="Editar perfil"
        initialValue={activeProfile}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar perfil"
        confirmLabel="Eliminar"
        danger
        description={
          deleteError ||
          `¿Eliminar el perfil "${activeProfile.nombre}"? Se perderán sus favoritos, historial y Mi Lista.`
        }
      />
    </Container>
  )
}

export default Profile
