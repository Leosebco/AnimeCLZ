import { useState } from 'react'
import { ArrowUpDown, CalendarDays, ChevronDown } from 'lucide-react'
import Select from '@/components/ui/Select'
import ChipGroup from '@/components/ui/ChipGroup'
import { GENRES, ANIME_TYPES, ANIME_STATUS, MIN_SCORE_OPTIONS, ORDER_OPTIONS, getYearOptions } from '@/constants'

const YEAR_OPTIONS = getYearOptions()

// 8 géneros principales (v1.7) — el resto queda detrás de "Ver todos" para
// no saturar la pantalla con 15 chips de una. Elegidos por popularidad de
// catálogo, no un orden arbitrario.
const MAIN_GENRE_IDS = [1, 2, 4, 8, 10, 22, 24, 37]

const TYPE_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_TYPES]
const STATUS_CHIPS = [{ value: '', label: 'Todos' }, ...ANIME_STATUS]
const SCORE_CHIPS = [{ value: '', label: 'Cualquiera' }, ...MIN_SCORE_OPTIONS]

/**
 * Género / Formato / Estado / Puntuación se filtran con chips (un vistazo,
 * un clic); Orden / Año siguen siendo `Select` porque tienen demasiadas
 * opciones para mostrarse todas a la vez. Compartido por Explorar y Buscar
 * (en Buscar, desde v1.7, vive dentro de un `Modal` — ver Search.jsx — pero
 * el componente en sí no sabe ni le importa dónde lo montan).
 *
 * `collapsibleGenres` (v2.4, default `false` — Explorar no cambia): en vez
 * de la fila de chips + "Ver todos" de siempre, envuelve el género en un
 * `<details>`/`<summary>` nativo, colapsado por defecto (pedido explícito
 * del sprint de búsqueda: "mover todos los géneros a un acordeón
 * desplegable para evitar saturar la pantalla"). `<details>` nativo en vez
 * de un acordeón hecho a mano: teclado (Enter/Espacio) y ARIA
 * (`aria-expanded` implícito) ya vienen correctos sin código extra.
 */
function Filters({ value, onChange, className, collapsibleGenres = false }) {
  const [showAllGenres, setShowAllGenres] = useState(
    () => Boolean(value.genre) && !MAIN_GENRE_IDS.includes(Number(value.genre)),
  )

  const update = (key) => (raw) => onChange({ ...value, [key]: raw || undefined })

  const visibleGenres = showAllGenres ? GENRES : GENRES.filter((genre) => MAIN_GENRE_IDS.includes(genre.id))
  const genreChips = [{ value: '', label: 'Todos' }, ...visibleGenres.map((g) => ({ value: String(g.id), label: g.label }))]

  const activeGenreLabel = value.genre
    ? GENRES.find((genre) => String(genre.id) === String(value.genre))?.label
    : null

  const genreControl = (
    <div className="flex flex-wrap items-center gap-2">
      <ChipGroup
        ariaLabel="Filtrar por género"
        layoutId="chip-genre"
        options={genreChips}
        value={value.genre || ''}
        onChange={update('genre')}
      />
      {!showAllGenres && (
        <button
          type="button"
          onClick={() => setShowAllGenres(true)}
          className="flex min-h-11 items-center gap-1 rounded-full px-2 text-sm text-text-secondary transition-colors hover:text-text"
        >
          Ver todos
          <ChevronDown size={14} aria-hidden />
        </button>
      )}
    </div>
  )

  return (
    <div className={className}>
      <div className="space-y-3">
        {collapsibleGenres ? (
          <details className="group rounded-xl border border-border">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-text marker:content-none">
              <span>
                Género
                {activeGenreLabel && <span className="ml-2 text-text-secondary">· {activeGenreLabel}</span>}
              </span>
              <ChevronDown size={16} className="shrink-0 text-text-secondary transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="border-t border-border p-3">{genreControl}</div>
          </details>
        ) : (
          genreControl
        )}
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
