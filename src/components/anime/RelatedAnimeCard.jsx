import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { animeDetailPath } from '@/constants'

/**
 * Tarjeta de anime relacionado (v2.3, reusada por "Relacionados" y
 * "Temporadas") — Jikan solo da `{mal_id, name}` por relación, sin poster
 * ni score (confirmado en CLAUDE.md: "Relations only carry id/type/name/
 * url"). Pedir el póster real implicaría una llamada de red extra por
 * tarjeta (N+1) — se muestra un ícono en vez de inventar o de multiplicar
 * llamadas, ver informe de entrega del sprint.
 */
function RelatedAnimeCard({ item, relationLabel }) {
  return (
    <Link
      to={animeDetailPath(item.mal_id)}
      className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-hover/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hover text-primary">
        <Layers size={16} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{item.name}</p>
        {relationLabel && <p className="text-xs text-text-secondary">{relationLabel}</p>}
      </div>
    </Link>
  )
}

export default RelatedAnimeCard
