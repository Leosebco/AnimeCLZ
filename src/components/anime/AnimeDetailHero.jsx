import { Star, Heart, Bookmark, Share2, Play } from 'lucide-react'
import Button from '@/components/ui/Button'
import { STATUS_LABELS } from '@/constants'

/**
 * Hero premium de AnimeDetail (v2.3) — poster/título/meta/botones. El
 * banner desenfocado de fondo (a página completa, fuera de cualquier
 * `Container`, con el margen negativo que lo superpone) vive en
 * `AnimeDetail.jsx`, no acá — este componente solo cubre la parte que va
 * DENTRO del `Container` con margen negativo, para no romper ese efecto
 * envolviendo el banner en un `max-w-7xl` que lo recortaría. Todos los
 * datos mostrados vienen de `ProviderManager.getAnime()` sin tocarlo —
 * `favorites`/`members` no están en ese shape hoy, así que no se muestran
 * (ver informe de entrega).
 */
function AnimeDetailHero({
  anime,
  favorite,
  inWatchLater,
  onToggleFavorite,
  onToggleWatchLater,
  onShare,
  onWatchNow,
  shared,
}) {
  const statusLabel = anime.status ? STATUS_LABELS[anime.status] || anime.status : null

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-40 shrink-0 rounded-xl object-cover shadow-2xl ring-1 ring-border sm:w-56"
        />

        <div className="min-w-0 flex-1 pb-1">
          <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">{anime.title}</h1>
          {anime.titleJapanese && (
            <p className="mt-1 text-sm text-text-secondary">{anime.titleJapanese}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            {typeof anime.score === 'number' && (
              <span className="flex items-center gap-1 text-text">
                <Star size={14} className="text-primary" fill="currentColor" />
                {anime.score.toFixed(1)}
              </span>
            )}
            {anime.popularity && <span>Popularidad #{anime.popularity}</span>}
            {statusLabel && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">{statusLabel}</span>
            )}
            {anime.type && <span>{anime.type}</span>}
            {anime.year && <span>{anime.year}</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onWatchNow} disabled={!anime.trailerUrl}>
          <Play size={18} fill="currentColor" />
          Ver Ahora
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onToggleFavorite}
          aria-pressed={favorite}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
          {favorite ? 'En Favoritos' : 'Favorito'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onToggleWatchLater}
          aria-pressed={inWatchLater}
        >
          <Bookmark size={18} fill={inWatchLater ? 'currentColor' : 'none'} />
          {inWatchLater ? 'En Mi Lista' : 'Agregar a Mi Lista'}
        </Button>
        <Button variant="ghost" size="lg" onClick={onShare}>
          <Share2 size={18} />
          {shared ? '¡Enlace copiado!' : 'Compartir'}
        </Button>
      </div>
    </>
  )
}

export default AnimeDetailHero
