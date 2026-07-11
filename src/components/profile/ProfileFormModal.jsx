import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import AvatarPicker from './AvatarPicker'
import ThemePickerGrid from './ThemePickerGrid'
import BackgroundPickerGrid from './BackgroundPickerGrid'
import { recordAvatarUse } from '@/services/avatarHistoryService'
import { AVATAR_TYPES, PROFILE_COLORS } from '@/constants'

const EMPTY_VALUE = {
  nombre: '',
  avatar: null,
  tipoAvatar: AVATAR_TYPES.INITIAL,
  color: PROFILE_COLORS[0],
  tema: 'original',
  fondo: 'none',
}

/**
 * Formulario de Crear/Editar perfil (Nombre, Avatar, Tema, Fondo) — usado
 * desde el selector de perfiles ("+ Crear Perfil" y "Editar" por tarjeta) y
 * desde Mi Perfil ("Editar"). Nunca envía `rol`: los perfiles nuevos
 * siempre nacen 'usuario' (profilesAccountService lo impone del lado del
 * servicio y la DB). Tema/Fondo son estado de formulario local — no se
 * aplican en vivo (a diferencia del picker de Settings.jsx), porque este
 * modal puede estar editando un perfil que no es el activo.
 *
 * v1.6: elegir un personaje de anime en `AvatarPicker` es una acción de un
 * solo paso (confirmado con el usuario) — guarda YA y cierra el modal, sin
 * pasar por el botón "Guardar". `saveForm` centraliza esa lógica (misma
 * validación/error/cierre que el submit normal) para no duplicarla: la
 * usan tanto el submit del formulario como `handleSelectCharacter`. Los
 * otros dos modos de avatar (Inicial+color, Subir imagen) siguen usando el
 * `onChange` de siempre — solo quedan "en borrador" hasta pulsar Guardar.
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

  const saveForm = async (values) => {
    if (!values.nombre.trim()) {
      setError('Ponle un nombre a este perfil.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    saveForm(form)
  }

  const handleSelectCharacter = async (character) => {
    const merged = { ...form, avatar: character.image, tipoAvatar: AVATAR_TYPES.CHARACTER }
    setForm(merged)
    // No bloquea ni cancela el guardado si esto falla — "recordar el uso"
    // es un beneficio secundario, no la acción principal del usuario.
    recordAvatarUse(accountId, character)
    await saveForm(merged)
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <AvatarPicker
          accountId={accountId}
          nombre={form.nombre}
          value={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSelectAndClose={handleSelectCharacter}
        />

        <FormField
          label="Nombre del perfil"
          type="text"
          maxLength={30}
          value={form.nombre}
          onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
        />

        <ThemePickerGrid value={form.tema} onChange={(tema) => setForm((prev) => ({ ...prev, tema }))} />

        <BackgroundPickerGrid
          value={form.fondo}
          onChange={(fondo) => setForm((prev) => ({ ...prev, fondo }))}
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
