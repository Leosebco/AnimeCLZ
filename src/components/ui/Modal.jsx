import { Dialog, DialogPanel, DialogBackdrop, DialogTitle } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { cn } from '@/utils/cn'

// Framer Motion anima valores en JS, no vía CSS — a diferencia del resto del
// sprint móvil (puramente clases Tailwind por breakpoint), la dirección de
// la animación de entrada (bottom-sheet en mobile vs. caja centrada en
// desktop) sí necesita saber el breakpoint activo. Es la única excepción
// deliberada; duplicar `DialogPanel` en dos bloques CSS-condicionados habría
// arriesgado dos instancias de foco/ARIA de modal a la vez. `useIsDesktop`
// (v1.7) generaliza el hook que antes vivía inline acá — ahora también lo
// usa `Hero.jsx`.

/**
 * Modal genérico (Headless UI Dialog + Framer Motion, mismo patrón de
 * `static` + AnimatePresence que Select.jsx) — usado por AvatarPicker,
 * ProfileFormModal, NewsFormModal, ConfirmDialog y Search.jsx (Filtros).
 * Cierra con click en el fondo, Escape, o el botón X.
 *
 * Por debajo de `sm` (640px) siempre se comporta como bottom sheet (entra
 * deslizando desde abajo, ancho completo, esquinas superiores redondeadas,
 * respeta el safe-area del home indicator de iOS), sin importar `variant`.
 *
 * `variant` (`'center'` por defecto): a `sm`+, `'center'` mantiene la caja
 * centrada de siempre; `'drawer'` (Explorar, Filtros avanzados) desliza un
 * panel de ancho fijo desde el borde derecho, a todo el alto de la pantalla,
 * en vez de una caja centrada — mismo componente, sin duplicar el diálogo.
 */
function Modal({ open, onClose, title, children, className, variant = 'center' }) {
  const isDesktop = useIsDesktop()
  const isDrawer = variant === 'drawer'

  // El `transition` embebido en cada objeto animate/exit (en vez de un prop
  // `transition` propio en el elemento) es deliberado, no un detalle
  // estético: `DialogPanel`/`DialogBackdrop` de Headless UI reservan un
  // prop llamado `transition` (booleano — "usar el sistema de transición
  // propio de Headless UI") que colisiona con el `transition` de Framer
  // Motion (config de timing) cuando se componen vía `as={motion.div}`. Si
  // se pasa como prop de nivel superior, Headless UI lo intercepta, lo ve
  // truthy, y envuelve el panel en su propio `Transition.Child` — que
  // revienta con "is missing a parent <Transition />" porque `Dialog` tiene
  // `static` (no crea ese contexto). Ver CLAUDE.md para el detalle completo.
  const panelMotion = !isDesktop
    ? {
        initial: { opacity: 0, y: '100%' },
        animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
        exit: { opacity: 0, y: '100%', transition: { duration: 0.25, ease: 'easeOut' } },
      }
    : isDrawer
      ? {
          initial: { opacity: 0, x: '100%' },
          animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
          exit: { opacity: 0, x: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
        }
      : {
          initial: { opacity: 0, scale: 0.96, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
          exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.25, ease: 'easeOut' } },
        }

  return (
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose} className="relative z-50">
          <DialogBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div
            className={cn(
              'fixed inset-0 flex items-end justify-center',
              isDrawer ? 'sm:items-stretch sm:justify-end' : 'sm:items-center sm:p-4',
            )}
          >
            <DialogPanel
              as={motion.div}
              {...panelMotion}
              className={cn(
                'custom-scrollbar w-full max-h-[90vh] overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 shadow-2xl',
                'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
                isDrawer
                  ? 'sm:h-full sm:max-h-full sm:w-96 sm:max-w-sm sm:rounded-l-2xl sm:rounded-r-none sm:pb-6'
                  : 'sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl sm:pb-6',
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
