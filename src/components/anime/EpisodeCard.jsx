import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { watchPath } from '@/constants'

/**
 * Tarjeta de episodio clickeable (v2.1 — Sistema de reproducción). La
 * miniatura cae al poster/backdrop del anime (ningún proveedor da una
 * miniatura real por episodio) — el ícono de play superpuesto deja claro
 * que es una portada genérica, no una miniatura real inventada. La
 * duración mostrada es la de la serie completa (`anime.duration`, real,
 * ej. "24 min per ep"), nunca presentada como si describiera un clip
 * puntual. Siempre es un `Link` — incluso sin fuente disponible, para que
 * la página de destino explique honestamente "sin fuente disponible" en
 * vez de deshabilitar silenciosamente la tarjeta.
 */
function EpisodeCard({ anime, episode, playable, watched, progressPercent }) {
  return (
    <Link
      to={watchPath(anime.id, episode.number)}
      className="group block overflow-hidden rounded-xl border border-border bg-card ring-1 ring-border transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        <img
          src={anime.backdrop || anime.poster}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-70 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background/70 text-text backdrop-blur-sm">
            <Play size={18} fill="currentColor" />
          </span>
        </div>

        <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
          {episode.filler ? (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-text-secondary backdrop-blur-sm">
              Filler
            </span>
          ) : (
            <span />
          )}
          {watched && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-on-primary">
              Visto
            </span>
          )}
        </div>

        {!playable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-center">
            <span className="px-3 text-[11px] text-text-secondary">Sin fuente disponible</span>
          </div>
        )}

        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-background/60">
            <div className="h-full bg-primary" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-text">
          {episode.number}. {episode.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
          {anime.duration && <span>{anime.duration}</span>}
          {episode.aired && (
            <span>
              {new Date(episode.aired).toLocaleDateString('es', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {typeof episode.score === 'number' && (
            <span className="flex items-center gap-1">
              <Star size={11} className="text-primary" fill="currentColor" />
              {episode.score.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default EpisodeCard
