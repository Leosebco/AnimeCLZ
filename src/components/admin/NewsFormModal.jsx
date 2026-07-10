import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'

const EMPTY_VALUE = { title: '', content: '', coverImage: '', published: false }

/**
 * Crear/editar una noticia (v1.0, primer CRUD real del Panel). `coverImage`
 * es una URL de texto simple — no hay flujo de subida propio para esto
 * (no se pidió), a diferencia del avatar de perfil que sí sube a Storage.
 */
function NewsFormModal({ open, onClose, initialValue, onSubmit, title }) {
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
    if (!form.title.trim() || !form.content.trim()) {
      setError('El título y el contenido son obligatorios.')
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          label="Título"
          type="text"
          maxLength={120}
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-text-secondary">Contenido</span>
          <textarea
            rows={6}
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary"
          />
        </label>

        <FormField
          label="Imagen de portada (URL, opcional)"
          type="url"
          value={form.coverImage || ''}
          onChange={(event) => setForm((prev) => ({ ...prev, coverImage: event.target.value }))}
        />

        <label className="flex items-center gap-2.5 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Publicar (visible para cualquier visitante)
        </label>

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

export default NewsFormModal
