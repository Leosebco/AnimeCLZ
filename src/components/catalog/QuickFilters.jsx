import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import Select from '@/components/ui/Select'
import ChipGroup from '@/components/ui/ChipGroup'
import { GENRES, ANIME_TYPES, ANIME_STATUS, ORDER_OPTIONS } from '@/constants'
import { cn } from '@/utils/cn'

// Orden pedido explícitamente (no el orden interno de GENRES en constants/index.js).
const QUICK_GENRE_IDS = [1, 2, 10, 22, 4, 8] // Acción, Aventura, Fantasía, Romance, Comedia, Drama
const QUICK_TYPE_VALUES = ['tv', 'movie', 'ova']

const quickGenres = QUICK_GENRE_IDS.map((id) => GENRES.find((genre) => genre.id === id)).filter(Boolean)
const quickTypes = ANIME_TYPES.filter((type) => QUICK_TYPE_VALUES.includes(type.value))
const STATUS_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_STATUS.filter((s) => s.value !== 'upcoming')]

const toggleButtonClass =
  'flex min-h-11 items-center gap-1 rounded-full px-2 text-sm text-text-secondary transition-colors hover:text-text'

/**
 * Fila compacta de filtros de Explorar — solo desktop (oculta en mobile vía
 * `hidden sm:flex`; ahí el botón "Filtros" abre el Drawer con el set
 * completo, ver `AdvancedFiltersPanel.jsx`/`Explore.jsx`). Género y Formato
 * muestran un subconjunto popular + un toggle "Ver más/Ver menos" que
 * despliega el resto inline (`motion.div layout` anima el reflow); Estado
 * solo muestra 3 fijos ("Próximamente" queda exclusivamente en el Drawer,
 * pedido explícito); Orden reusa el mismo `Select` compacto de siempre.
 * Puntuación y Año no viven aquí — solo en el Drawer.
 */
function QuickFilters({ value, onChange, className }) {
  const [showAllGenres, setShowAllGenres] = useState(
    () => Boolean(value.genre) && !QUICK_GENRE_IDS.includes(Number(value.genre)),
  )
  const [showAllTypes, setShowAllTypes] = useState(
    () => Boolean(value.type) && !QUICK_TYPE_VALUES.includes(value.type),
  )

  // Si un filtro fuera del subconjunto popular llega desde el Drawer (o la
  // URL), la fila compacta se auto-expande para no dejarlo "escondido".
  useEffect(() => {
    if (value.genre && !QUICK_GENRE_IDS.includes(Number(value.genre))) setShowAllGenres(true)
  }, [value.genre])

  useEffect(() => {
    if (value.type && !QUICK_TYPE_VALUES.includes(value.type)) setShowAllTypes(true)
  }, [value.type])

  const update = (key) => (raw) => onChange({ ...value, [key]: raw || undefined })

  const genreChips = [
    { value: '', label: 'Todos' },
    ...(showAllGenres ? GENRES : quickGenres).map((g) => ({ value: String(g.id), label: g.label })),
  ]
  const typeChips = [{ value: '', label: 'Todos' }, ...(showAllTypes ? ANIME_TYPES : quickTypes)]

  return (
    <div className={cn('hidden flex-col gap-3 sm:flex', className)}>
      <motion.div layout className="flex flex-wrap items-center gap-2">
        <ChipGroup
          ariaLabel="Filtrar por género"
          layoutId="chip-genre-quick"
          options={genreChips}
          value={value.genre || ''}
          onChange={update('genre')}
        />
        <button type="button" onClick={() => setShowAllGenres((prev) => !prev)} className={toggleButtonClass}>
          {showAllGenres ? 'Ver menos' : 'Ver más'}
          {showAllGenres ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
        </button>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <motion.div layout className="flex flex-wrap items-center gap-2">
          <ChipGroup
            ariaLabel="Filtrar por formato"
            layoutId="chip-type-quick"
            options={typeChips}
            value={value.type || ''}
            onChange={update('type')}
          />
          <button type="button" onClick={() => setShowAllTypes((prev) => !prev)} className={toggleButtonClass}>
            {showAllTypes ? 'Menos formatos' : 'Más formatos'}
            {showAllTypes ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
          </button>
        </motion.div>

        <ChipGroup
          ariaLabel="Filtrar por estado"
          layoutId="chip-status-quick"
          options={STATUS_CHIPS}
          value={value.status || ''}
          onChange={update('status')}
        />
      </div>

      <Select
        ariaLabel="Ordenar por"
        icon={ArrowUpDown}
        options={ORDER_OPTIONS}
        value={value.order || 'popularity'}
        onChange={update('order')}
        className="w-56"
      />
    </div>
  )
}

export default QuickFilters
