import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Reemplaza el <select> nativo en toda la app (Filtros de Explorar/Buscar).
 * Headless UI provee el comportamiento accesible (teclado, aria-*); el
 * estilo y la animación de apertura/cierre son propios del sistema de
 * diseño de AnimeCLZ.
 */
function Select({ value, onChange, options, ariaLabel, icon: Icon, className }) {
  const selected = options.find((option) => option.value === value) ?? options[0]

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className={cn('relative', className)}>
          <ListboxButton
            aria-label={ariaLabel}
            className="flex w-full items-center gap-2 rounded-full border border-border bg-surface-hover px-4 py-2 text-sm text-text transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {Icon && <Icon size={14} className="shrink-0 text-text-secondary" aria-hidden />}
            <span className="truncate">{selected?.label}</span>
            <ChevronDown
              size={14}
              className={cn(
                'ml-auto shrink-0 text-text-secondary transition-transform duration-200',
                open && 'rotate-180',
              )}
              aria-hidden
            />
          </ListboxButton>

          <AnimatePresence>
            {open && (
              <ListboxOptions
                as={motion.div}
                static
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                anchor="bottom start"
                className="custom-scrollbar z-30 mt-2 max-h-64 w-[var(--button-width)] min-w-[10rem] overflow-auto rounded-2xl border border-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl focus:outline-none"
              >
                {options.map((option) => (
                  <ListboxOption
                    key={option.value}
                    value={option.value}
                    className={({ focus, selected }) =>
                      cn(
                        'flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                        focus ? 'bg-surface-hover text-text' : 'text-text-secondary',
                        selected && 'text-text',
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className="truncate">{option.label}</span>
                        {selected && <Check size={14} className="shrink-0 text-primary" aria-hidden />}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            )}
          </AnimatePresence>
        </div>
      )}
    </Listbox>
  )
}

export default Select
