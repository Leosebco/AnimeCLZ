import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Heart, Bookmark, ArrowLeft, Play, Share2, Clapperboard } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import MovieRow from '@/components/movie/MovieRow'
import CharacterCard from '@/components/anime/CharacterCard'
import InfoGrid from '@/components/anime/InfoGrid'
import useFetch from '@/hooks/useFetch'
import {
  getAnimeById,
  getAnimeCharacters,
  getAnimeEpisodes,
  getAnimeRecommendations,
  getAnimeRelations,
  getAnimePictures,
} from '@/providers/AnimeProvider'
import { useFavorites } from '@/context/FavoritesContext'
import { useWatchLater } from '@/context/WatchLaterContext'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, RELATION_LABELS, animeDetailPath } from '@/constants'

function AnimeDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isInWatchLater, toggleWatchLater } = useWatchLater()
  const navigate = useNavigate()
  const [shared, setShared] = useState(false)

  const {
    data: anime,
    loading,
    error,
    refetch,
  } = useFetch((signal) => getAnimeById(id, signal), [id], { cacheKey: `anime:${id}` })

  const characters = useFetch((signal) => getAnimeCharacters(id, signal), [id], {
    cacheKey: `anime:${id}:characters`,
  })
  const recommendations = useFetch(
    (signal) => getAnimeRecommendations(id, { limit: 12 }, signal),
    [id],
    { cacheKey: `anime:${id}:recommendations` },
  )
  const relations = useFetch((signal) => getAnimeRelations(id, signal), [id], {
    cacheKey: `anime:${id}:relations`,
  })
  const pictures = useFetch((signal) => getAnimePictures(id, signal), [id], {
    cacheKey: `anime:${id}:pictures`,
  })
  const episodes = useFetch((signal) => getAnimeEpisodes(id, { limit: 12 }, signal), [id], {
    cacheKey: `anime:${id}:episodes`,
  })

  if (loading) {
    return (
      <Container className="pt-28 pb-16">
        <LoadingState variant="hero" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="pt-28 pb-16">
        <ErrorState onRetry={refetch} />
      </Container>
    )
  }

  if (!anime) return null

  const favorite = isFavorite(anime.id)
  const inWatchLater = isInWatchLater(anime.id)
  const tags = [...anime.genres, ...anime.themes, ...anime.demographics]

  const handleWatchNow = () => {
    document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: animeDetailPath(anime.id) } } })
      return
    }
    action()
  }

  const handleShare = async () => {
    const shareData = {
      title: anime.title,
      text: `Mira ${anime.title} en AnimeCLZ`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return
    }
    await navigator.clipboard.writeText(window.location.href)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <>
      {/* Banner grande — fondo desenfocado del póster (Jikan no expone un
          banner panorámico distinto), nunca el póster estirado sin más. */}
      <section className="relative h-[38vh] min-h-[240px] w-full overflow-hidden sm:h-[46vh]">
        <img
          src={anime.backdrop || anime.poster}
          alt=""
          className="h-full w-full scale-110 object-cover blur-2xl opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      </section>

      <Container className="relative -mt-20 pb-16 sm:-mt-28">
        <Link
          to={ROUTES.HOME}
          className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <img
            src={anime.poster}
            alt={anime.title}
            className="w-40 shrink-0 rounded-xl object-cover ring-1 ring-border sm:w-56"
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
              {anime.rank && <span>Ranking #{anime.rank}</span>}
              {anime.popularity && <span>Popularidad #{anime.popularity}</span>}
              {anime.type && <span>{anime.type}</span>}
              {anime.year && <span>{anime.year}</span>}
            </div>

            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {anime.synopsis && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
            {anime.synopsis}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={handleWatchNow} disabled={!anime.trailerUrl}>
            <Play size={18} fill="currentColor" />
            Ver Ahora
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => requireAuth(() => toggleFavorite(anime))}
            aria-pressed={favorite}
          >
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
            {favorite ? 'En Favoritos' : 'Favorito'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => requireAuth(() => toggleWatchLater(anime))}
            aria-pressed={inWatchLater}
          >
            <Bookmark size={18} fill={inWatchLater ? 'currentColor' : 'none'} />
            {inWatchLater ? 'En Mi Lista' : 'Agregar a Mi Lista'}
          </Button>
          <Button variant="ghost" size="lg" onClick={handleShare}>
            <Share2 size={18} />
            {shared ? '¡Enlace copiado!' : 'Compartir'}
          </Button>
        </div>

        {/* Información */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Información</h2>
          <InfoGrid
            items={[
              { label: 'Episodios', value: anime.episodes },
              { label: 'Duración', value: anime.duration },
              { label: 'Estado', value: anime.status },
              {
                label: 'Temporada',
                value: anime.season ? `${anime.season} ${anime.year || ''}`.trim() : null,
              },
              { label: 'Clasificación', value: anime.rating },
              { label: 'Estudios', value: anime.studios?.join(', ') },
              { label: 'Productores', value: anime.producers?.join(', ') },
              { label: 'Licenciantes', value: anime.licensors?.join(', ') },
            ]}
          />
        </section>

        {/* Personajes principales */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">
            Personajes principales
          </h2>
          {characters.loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : characters.error ? (
            <ErrorState compact onRetry={characters.refetch} />
          ) : !characters.data?.length ? (
            <EmptyState
              compact
              title="Sin personajes registrados"
              description="Todavía no tenemos el elenco principal de este anime."
              onRetry={characters.refetch}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {characters.data.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          )}
        </section>

        {/* Trailer */}
        <section id="trailer" className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Trailer</h2>
          {anime.trailerUrl ? (
            <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl ring-1 ring-border">
              <iframe
                src={anime.trailerUrl}
                title={`Trailer de ${anime.title}`}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          ) : (
            <EmptyState
              compact
              icon={Clapperboard}
              title="Sin trailer disponible"
              description="Todavía no tenemos un video promocional para este anime."
            />
          )}
        </section>

        {/* Episodios — metadatos reales (número/título/fecha), no un
            reproductor: Jikan no aloja video, pero esta información sí es
            real y útil (MAL/AniList la muestran igual). */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Episodios</h2>
          {episodes.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : episodes.error ? (
            <ErrorState compact onRetry={episodes.refetch} />
          ) : !episodes.data?.length ? (
            <EmptyState
              compact
              title="Sin episodios listados"
              description="Todavía no tenemos el listado de episodios de este anime."
              onRetry={episodes.refetch}
            />
          ) : (
            <div className="space-y-2">
              {episodes.data.map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {episode.number}. {episode.title}
                    </p>
                    {episode.aired && (
                      <p className="text-xs text-text-secondary">
                        {new Date(episode.aired).toLocaleDateString('es', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  {typeof episode.score === 'number' && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-text-secondary">
                      <Star size={12} className="text-primary" fill="currentColor" />
                      {episode.score.toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Relacionados */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Relacionados</h2>
          {relations.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full max-w-md" />
            </div>
          ) : relations.error ? (
            <ErrorState compact onRetry={relations.refetch} />
          ) : !relations.data?.length ? (
            <EmptyState
              compact
              title="Sin animes relacionados"
              description="Este anime no tiene precuelas, secuelas u otras conexiones registradas."
              onRetry={relations.refetch}
            />
          ) : (
            <div className="space-y-4">
              {relations.data.map((group) => (
                <div key={group.relation}>
                  <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                    {RELATION_LABELS[group.relation] || group.relation}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.mal_id}
                        to={animeDetailPath(item.mal_id)}
                        className="flex min-h-11 items-center rounded-full border border-border bg-card px-4 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-text"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Galería */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Galería</h2>
          {pictures.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-video w-full" />
              ))}
            </div>
          ) : pictures.error ? (
            <ErrorState compact onRetry={pictures.refetch} />
          ) : !pictures.data?.length ? (
            <EmptyState
              compact
              title="Sin imágenes disponibles"
              description="Todavía no tenemos imágenes adicionales para este anime."
              onRetry={pictures.refetch}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {pictures.data.map((picture, index) => (
                <a
                  key={picture.large || index}
                  href={picture.large}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl ring-1 ring-border"
                >
                  <img
                    src={picture.small}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </a>
              ))}
            </div>
          )}
        </section>
      </Container>

      {/* Recomendados — reutiliza MovieRow/AnimeCard, fuera del Container para
          conservar el mismo ancho de carrusel que en Home. */}
      <MovieRow
        title="💡 Recomendados"
        movies={recommendations.data?.data}
        loading={recommendations.loading}
        error={recommendations.error}
        onRetry={recommendations.refetch}
        emptyState={{
          title: 'Sin recomendaciones',
          description: 'Todavía no hay recomendaciones registradas para este anime.',
        }}
      />
    </>
  )
}

export default AnimeDetail
