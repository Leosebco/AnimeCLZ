import { ArrowUpDown, CalendarDays } from 'lucide-react'
import Select from '@/components/ui/Select'
import ChipGroup from '@/components/ui/ChipGroup'
import { GENRES, ANIME_TYPES, ANIME_STATUS, MIN_SCORE_OPTIONS, ORDER_OPTIONS, getYearOptions } from '@/constants'

const GENRE_CHIPS = [{ value: '', label: 'Todos' }, ...GENRES.map((g) => ({ value: String(g.id), label: g.label }))]
const TYPE_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_TYPES]
const STATUS_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_STATUS]
const SCORE_CHIPS = [{ value: '', label: 'Cualquiera' }, ...MIN_SCORE_OPTIONS]
const YEAR_OPTIONS = getYearOptions()

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</h3>
      {children}
    </div>
  )
}

/**
 * Contenido del Drawer "Filtros" de Explorar — set completo de cada filtro,
 * sin ningún "ver más" interno (a diferencia de `QuickFilters.jsx`, esta ya
 * es la vista exhaustiva). Puramente presentacional y controlado
 * (`value`/`onChange`, mismo contrato que `Filters.jsx`) — el Drawer que lo
 * envuelve (`Explore.jsx`) es dueño del estado de borrador y de los botones
 * "Limpiar filtros"/"Aplicar".
 */
function AdvancedFiltersPanel({ value, onChange }) {
  const update = (key) => (raw) => onChange({ ...value, [key]: raw || undefined })

  return (
    <div className="flex flex-col gap-6">
      <Section label="Género">
        <ChipGroup
          ariaLabel="Filtrar por género"
          layoutId="chip-genre-drawer"
          options={GENRE_CHIPS}
          value={value.genre || ''}
          onChange={update('genre')}
        />
      </Section>

      <Section label="Formato">
        <ChipGroup
          ariaLabel="Filtrar por formato"
          layoutId="chip-type-drawer"
          options={TYPE_CHIPS}
          value={value.type || ''}
          onChange={update('type')}
        />
      </Section>

      <Section label="Estado">
        <ChipGroup
          ariaLabel="Filtrar por estado"
          layoutId="chip-status-drawer"
          options={STATUS_CHIPS}
          value={value.status || ''}
          onChange={update('status')}
        />
      </Section>

      <Section label="Calificación">
        <ChipGroup
          ariaLabel="Puntuación mínima"
          layoutId="chip-score-drawer"
          options={SCORE_CHIPS}
          value={value.minScore || ''}
          onChange={update('minScore')}
        />
      </Section>

      <Section label="Año">
        <Select
          ariaLabel="Filtrar por año"
          icon={CalendarDays}
          options={YEAR_OPTIONS}
          value={value.year || ''}
          onChange={update('year')}
          className="w-full"
        />
      </Section>

      <Section label="Orden">
        <Select
          ariaLabel="Ordenar por"
          icon={ArrowUpDown}
          options={ORDER_OPTIONS}
          value={value.order || 'popularity'}
          onChange={update('order')}
          className="w-full"
        />
      </Section>
    </div>
  )
}

export default AdvancedFiltersPanel
