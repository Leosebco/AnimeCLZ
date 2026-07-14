import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Selector de fuente (servidor + calidad combinados — para AnimeThemes
 * cada `VideoSource` ya es un clip+resolución puntual, no una matriz
 * independiente de servidor×calidad). Mismo patrón que
 * `components/ui/Select.jsx` (Headless UI Listbox + Framer Motion), con
 * chrome propio para overlay oscuro de video. El `transition` va embebido
 * en cada objeto `animate`/`exit`, nunca como prop de nivel superior —
 * regla de v1.5.1 (colisión con el `transition` interno de Headless UI en
 * `ListboxOptions`).
 */
function SourceSelector({ sources, selectedId, onChange }) {
  if (!sources.length) return null
  const selected = sources.find((source) => source.id === selectedId) ?? sources[0]

  return (
    <Listbox value={selectedId ?? selected.id} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <ListboxButton
            aria-label="Fuente"
            className="flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-background/60 px-3 text-xs text-white backdrop-blur-sm transition-colors hover:border-white/40"
          >
            <Settings size={14} className="shrink-0 text-white/70" aria-hidden />
            <span className="max-w-[8rem] truncate">{selected?.servidor || 'Fuente'}</span>
            <ChevronDown
              size={14}
              className={cn('shrink-0 text-white/70 transition-transform duration-200', open && 'rotate-180')}
              aria-hidden
            />
          </ListboxButton>
          <AnimatePresence>
            {open && (
              <ListboxOptions
                as={motion.div}
                static
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.18, ease: 'easeOut' } }}
                anchor="top end"
                className="custom-scrollbar z-30 mb-2 max-h-64 w-64 overflow-auto rounded-2xl border border-white/10 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl focus:outline-none"
              >
                {sources.map((source) => (
                  <ListboxOption
                    key={source.id}
                    value={source.id}
                    className={({ focus }) =>
                      cn(
                        'flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                        focus ? 'bg-hover text-text' : 'text-text-secondary',
                      )
                    }
                  >
                    {({ selected: isSelected }) => (
                      <>
                        <span className="truncate">
                          {source.servidor}
                          {source.calidad ? ` — ${source.calidad}` : ''}
                        </span>
                        {isSelected && <Check size={14} className="shrink-0 text-primary" aria-hidden />}
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

export default SourceSelector
