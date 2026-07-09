import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Info, Play, Star } from 'lucide-react'
import { animeDetailPath, STATUS_LABELS } from '@/constants'
import { useFavorites } from '@/context/FavoritesContext'
import { cn } from '@/utils/cn'

/**
 * Canonical poster card — the single visual representation of an anime
 * anywhere in AnimeCLZ (Home rows, Explorar/Temporada/Top grids, búsqueda,
 * Mi Lista, Recomendados/Relacionados en Detalle). Every caller passes the
 * same model shape from animeService.
 *
 * Hover reveals three plain icons (Ver / Mi Lista / Información) — no
 * button chrome, no floating boxes. The title block underneath is always a
 * link too, so tapping the card works the same on touch devices that have
 * no hover state.
 */
function AnimeCard({ movie, className }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(movie.id)
  const genres = movie.genres?.slice(0, 2) ?? []
  const status = movie.status ? STATUS_LABELS[movie.status] || movie.status : null
  const detailPath = animeDetailPath(movie.id)

  const handleToggleFavorite = (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(movie)
  }

  return (
    <article className={cn('group relative w-full shrink-0 select-none', className)}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-hover ring-1 ring-border transition-shadow duration-300 group-hover:shadow-[0_20px_45px_-18px_rgba(110,168,254,0.35)] group-hover:ring-primary/40"
      >
        <motion.img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent transition-opacity duration-300 group-hover:via-background/40" />

        {typeof movie.score === 'number' && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-xs font-semibold text-text backdrop-blur-sm">
            <Star size={12} className="text-primary" fill="currentColor" />
            {movie.score.toFixed(1)}
          </span>
        )}

        {favorite && (
          <Heart
            size={16}
            className="absolute right-2 top-2 text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
            fill="currentColor"
            aria-hidden
          />
        )}

        {/* Hover actions — plain icons, no background chrome */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Link
            to={detailPath}
            aria-label={`Ver ${movie.title}`}
            className="pointer-events-auto text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:scale-110 hover:text-primary"
          >
            <Play size={20} fill="currentColor" />
          </Link>
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={favorite ? 'Quitar de Mi Lista' : 'Agregar a Mi Lista'}
            aria-pressed={favorite}
            className="pointer-events-auto text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:scale-110 hover:text-primary"
          >
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={detailPath}
            aria-label={`Información de ${movie.title}`}
            className="pointer-events-auto text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:scale-110 hover:text-primary"
          >
            <Info size={20} />
          </Link>
        </div>

        <Link to={detailPath} className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="truncate font-display text-sm font-semibold text-text">{movie.title}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
            {movie.year && <span>{movie.year}</span>}
            {movie.year && status && <span aria-hidden>&middot;</span>}
            {status && <span>{status}</span>}
          </div>
          {genres.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-text-secondary"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </Link>
      </motion.div>
    </article>
  )
}

export default memo(AnimeCard)
