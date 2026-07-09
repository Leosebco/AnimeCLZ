import { ArrowUpDown, CalendarDays } from 'lucide-react'
import Select from '@/components/ui/Select'
import ChipGroup from '@/components/ui/ChipGroup'
import { GENRES, ANIME_TYPES, ANIME_STATUS, MIN_SCORE_OPTIONS, ORDER_OPTIONS } from '@/constants'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [
  { value: '', label: 'Todos los años' },
  ...Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => {
    const year = CURRENT_YEAR - i
    return { value: String(year), label: String(year) }
  }),
]

const GENRE_CHIPS = [{ value: '', label: 'Todos' }, ...GENRES.map((g) => ({ value: String(g.id), label: g.label }))]
const TYPE_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_TYPES]
const STATUS_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_STATUS]
const SCORE_CHIPS = [{ value: '', label: 'Cualquiera' }, ...MIN_SCORE_OPTIONS]

/**
 * Género / Formato / Estado / Puntuación se filtran con chips (un vistazo,
 * un clic); Orden / Año siguen siendo `Select` porque tienen demasiadas
 * opciones para mostrarse todas a la vez. Compartido por Explorar y Buscar.
 */
function Filters({ value, onChange, className }) {
  const update = (key) => (raw) => onChange({ ...value, [key]: raw || undefined })

  return (
    <div className={className}>
      <div className="space-y-3">
        <ChipGroup
          ariaLabel="Filtrar por género"
          layoutId="chip-genre"
          options={GENRE_CHIPS}
          value={value.genre || ''}
          onChange={update('genre')}
        />
        <div className="flex flex-wrap gap-2">
          <ChipGroup
            ariaLabel="Filtrar por formato"
            layoutId="chip-type"
            options={TYPE_CHIPS}
            value={value.type || ''}
            onChange={update('type')}
          />
          <ChipGroup
            ariaLabel="Filtrar por estado"
            layoutId="chip-status"
            options={STATUS_CHIPS}
            value={value.status || ''}
            onChange={update('status')}
          />
          <ChipGroup
            ariaLabel="Puntuación mínima"
            layoutId="chip-score"
            options={SCORE_CHIPS}
            value={value.minScore || ''}
            onChange={update('minScore')}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
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
    </div>
  )
}

export default Filters
