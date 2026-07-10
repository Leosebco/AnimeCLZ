import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Info, Play, Star } from 'lucide-react'
import { animeDetailPath, ROUTES, STATUS_LABELS } from '@/constants'
import { useFavorites } from '@/context/FavoritesContext'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

/**
 * Canonical poster card — the single visual representation of an anime
 * anywhere in AnimeCLZ (Home rows, Explorar/Temporada/Top grids, búsqueda,
 * Mi Lista, Recomendados/Relacionados en Detalle). Every caller passes the
 * same model shape from animeService.
 *
 * Toda la card es un único `Link` de cobertura total (siempre activo, no
 * depende de `:hover`) — es el fix real de un bug reportado en iPhone: antes,
 * el único destino de navegación vivía dentro de un overlay que solo
 * aparecía con `group-hover:opacity-100`, y en iOS Safari el primer tap
 * dispara el `:hover` en vez del click, así que "revelaba" los íconos en vez
 * de abrir el detalle. Play/Información ahora son decorativos (solo
 * refuerzo visual en hover de escritorio, `pointer-events-none`); Favoritos
 * es un botón siempre visible (no gateado por hover) en la esquina superior
 * derecha, para que también sea alcanzable por touch sin depender de hover.
 * Favoritos requiere sesión — un click anónimo redirige a /iniciar-sesion en
 * vez de alternar en silencio. "Mi Lista" (watch later, ver WatchLaterContext)
 * solo vive en el botón de Hero/AnimeDetail, no en esta card compacta.
 */
function AnimeCard({ movie, className }) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const favorite = isFavorite(movie.id)
  const genres = movie.genres?.slice(0, 2) ?? []
  const status = movie.status ? STATUS_LABELS[movie.status] || movie.status : null
  const detailPath = animeDetailPath(movie.id)

  const handleToggleFavorite = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: detailPath } } })
      return
    }
    toggleFavorite(movie)
  }

  return (
    <article className={cn('group relative w-full shrink-0 select-none', className)}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-card ring-1 ring-border transition-shadow duration-300 group-hover:shadow-[0_20px_45px_-18px_rgba(79,140,255,0.35)] group-hover:ring-primary/40"
      >
        <motion.img
          src={movie.poster}
          srcSet={movie.posterSmall ? `${movie.posterSmall} 1x, ${movie.poster} 2x` : undefined}
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

        {/* Decorativo — refuerzo visual solo en hover de escritorio; no
            requiere tap propio, la card entera ya navega (ver Link de
            cobertura más abajo). */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Play
            size={20}
            fill="currentColor"
            className="text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
            aria-hidden
          />
          <Info size={20} className="text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]" aria-hidden />
        </div>

        {/* Link de cobertura total — el único área táctil primaria de la
            card, siempre activa (no depende de :hover), lo que evita la
            "zona muerta" y el bug de iOS Safari donde el primer tap solo
            disparaba :hover en vez de navegar. */}
        <Link to={detailPath} aria-label={movie.title} className="absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="truncate font-display text-sm font-semibold text-text">{movie.title}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              {movie.type && <span>{movie.type}</span>}
              {movie.type && movie.year && <span aria-hidden>&middot;</span>}
              {movie.year && <span>{movie.year}</span>}
              {(movie.type || movie.year) && status && <span aria-hidden>&middot;</span>}
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
          </div>
        </Link>

        {/* Favoritos — siempre visible (no gateado por hover) para ser
            alcanzable por touch sin necesitar hover; se mantiene como
            hermano del Link de cobertura (no anidado dentro de un <a>,
            HTML inválido) para seguir funcionando de forma independiente. */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
          aria-pressed={favorite}
          className="absolute right-1 top-1 flex min-h-11 min-w-11 items-center justify-center text-text drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:scale-110 hover:text-primary"
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </motion.div>
    </article>
  )
}

export default memo(AnimeCard)
