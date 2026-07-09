import { Tag, Film, ArrowUpDown, CalendarDays } from 'lucide-react'
import Select from '@/components/ui/Select'
import { GENRES, ANIME_TYPES, ORDER_OPTIONS } from '@/constants'
import { cn } from '@/utils/cn'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)

const GENRE_OPTIONS = [
  { value: '', label: 'Todos los géneros' },
  ...GENRES.map((genre) => ({ value: String(genre.id), label: genre.label })),
]
const TYPE_OPTIONS = [{ value: '', label: 'Todos los tipos' }, ...ANIME_TYPES]
const YEAR_OPTIONS = [
  { value: '', label: 'Todos los años' },
  ...YEARS.map((year) => ({ value: String(year), label: String(year) })),
]

/**
 * Género / Tipo / Orden / Año — shared by Explorar y Buscar so filtering
 * logic only lives in one place. Cada campo es un `Select` (Headless UI
 * Listbox) en vez del `<select>` nativo del navegador.
 */
function Filters({ value, onChange, className }) {
  const update = (key) => (raw) => onChange({ ...value, [key]: raw || undefined })

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <Select
        ariaLabel="Filtrar por género"
        icon={Tag}
        options={GENRE_OPTIONS}
        value={value.genre || ''}
        onChange={update('genre')}
      />
      <Select
        ariaLabel="Filtrar por tipo"
        icon={Film}
        options={TYPE_OPTIONS}
        value={value.type || ''}
        onChange={update('type')}
      />
      <Select
        ariaLabel="Ordenar por"
        icon={ArrowUpDown}
        options={ORDER_OPTIONS}
        value={value.order || 'popularity'}
        onChange={update('order')}
      />
      <Select
        ariaLabel="Filtrar por año"
        icon={CalendarDays}
        options={YEAR_OPTIONS}
        value={value.year || ''}
        onChange={update('year')}
      />
    </div>
  )
}

export default Filters
