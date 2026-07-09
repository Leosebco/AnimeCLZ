import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Modal genérico (Headless UI Dialog + Framer Motion, mismo patrón de
 * `static` + AnimatePresence que Select.jsx) — usado por AvatarPicker y
 * ProfileFormModal. Cierra con click en el fondo, Escape, o el botón X.
 */
function Modal({ open, onClose, title, children, className }) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose} className="relative z-50">
          <DialogBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'custom-scrollbar max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl',
                className,
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                {title ? (
                  <DialogTitle className="font-display text-lg font-semibold text-text">{title}</DialogTitle>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-hover hover:text-text"
                >
                  <X size={18} />
                </button>
              </div>
              {children}
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default Modal
