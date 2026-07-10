import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const DESKTOP_QUERY = '(min-width: 640px)'

// Framer Motion anima valores en JS, no vía CSS — a diferencia del resto del
// sprint móvil (puramente clases Tailwind por breakpoint), la dirección de
// la animación de entrada (bottom-sheet en mobile vs. caja centrada en
// desktop) sí necesita saber el breakpoint activo. Es la única excepción
// deliberada; duplicar `DialogPanel` en dos bloques CSS-condicionados habría
// arriesgado dos instancias de foco/ARIA de modal a la vez.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (event) => setIsDesktop(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isDesktop
}

/**
 * Modal genérico (Headless UI Dialog + Framer Motion, mismo patrón de
 * `static` + AnimatePresence que Select.jsx) — usado por AvatarPicker,
 * ProfileFormModal, NewsFormModal y ConfirmDialog. Cierra con click en el
 * fondo, Escape, o el botón X.
 *
 * Por debajo de `sm` (640px) se comporta como bottom sheet (entra deslizando
 * desde abajo, ancho completo, esquinas superiores redondeadas, respeta el
 * safe-area del home indicator de iOS); a `sm`+ mantiene la caja centrada de
 * siempre.
 */
function Modal({ open, onClose, title, children, className }) {
  const isDesktop = useIsDesktop()

  const panelMotion = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
      }
    : {
        initial: { opacity: 0, y: '100%' },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: '100%' },
      }

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
          <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
            <DialogPanel
              as={motion.div}
              {...panelMotion}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'custom-scrollbar w-full max-h-[90vh] overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 shadow-2xl',
                'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
                'sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl sm:pb-6',
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
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text"
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
