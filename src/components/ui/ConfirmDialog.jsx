import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

/**
 * Confirmación reutilizable para acciones destructivas/sensibles (eliminar
 * noticia, eliminar comentario, desactivar cuenta, eliminar perfil) — sin
 * `window.confirm()`, mismo criterio "sin alert()" que el resto de la app.
 * Vive en `components/ui/` (agnóstico de dominio) desde v1.5 — antes en
 * `components/admin/`, reubicado al necesitarlo también fuera del panel
 * de administración (Profile.jsx/ProfileSelect.jsx).
 */
function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', danger = false }) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-text-secondary">{description}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={confirming}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={danger ? 'text-error' : undefined}
          onClick={handleConfirm}
          disabled={confirming}
        >
          {confirming && <Loader2 size={16} className="animate-spin" />}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
