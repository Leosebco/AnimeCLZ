import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import AvatarPicker from './AvatarPicker'
import { AVATAR_TYPES, PROFILE_COLORS } from '@/constants'

const EMPTY_VALUE = {
  nombre: '',
  avatar: null,
  tipoAvatar: AVATAR_TYPES.INITIAL,
  color: PROFILE_COLORS[0],
}

/**
 * Formulario de Crear/Editar perfil (Nombre, Color, Avatar) — usado desde
 * el selector de perfiles ("+ Crear Perfil") y desde Mi Perfil ("Editar").
 * Nunca envía `rol`: los perfiles nuevos siempre nacen 'usuario'
 * (profilesAccountService lo impone del lado del servicio y la DB).
 */
function ProfileFormModal({ open, onClose, accountId, initialValue, onSubmit, title }) {
  const [form, setForm] = useState(initialValue || EMPTY_VALUE)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialValue || EMPTY_VALUE)
      setError(null)
    }
  }, [open, initialValue])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.nombre.trim()) {
      setError('Ponle un nombre a este perfil.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <AvatarPicker
          accountId={accountId}
          nombre={form.nombre}
          value={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />

        <FormField
          label="Nombre del perfil"
          type="text"
          maxLength={30}
          value={form.nombre}
          onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
        />

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 size={18} className="animate-spin" />}
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ProfileFormModal
