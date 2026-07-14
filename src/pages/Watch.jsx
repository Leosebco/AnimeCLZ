import { Link, useParams } from 'react-router-dom'
import Container from '@/components/ui/Container'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import VideoPlayer from '@/components/player/VideoPlayer'
import EpisodeInfoPanel from '@/components/player/EpisodeInfoPanel'
import useFetch from '@/hooks/useFetch'
import { getAnime, getEpisodes } from '@/providers/ProviderManager'
import { getSources } from '@/providers/playback/PlaybackProviderManager'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { animeDetailPath } from '@/constants'

/**
 * Página del reproductor (v2.1) — fuera de `Layout` (sin Navbar/Footer,
 * pantalla completa), protegida por sesión+perfil como el resto de
 * `/mi-lista`/`/favoritos`/`/historial` (ver `AppRouter.jsx`).
 *
 * Combina metadatos reales de Jikan/AniList (`ProviderManager`, ficha +
 * episodio) con las fuentes reproducibles del Provider Engine de
 * reproducción (`PlaybackProviderManager` — hoy, en la práctica, siempre
 * AnimeThemes: openings/endings reales, no episodios completos, ver
 * CLAUDE.md).
 */
function Watch() {
  const { id, episodeNumber } = useParams()
  const { user } = useAuth()
  const { activeProfile } = useProfile()

  const {
    data: anime,
    loading: animeLoading,
    error: animeError,
    refetch: refetchAnime,
  } = useFetch((signal) => getAnime(id, signal), [id], { cacheKey: `anime:${id}` })

  const episodesList = useFetch((signal) => getEpisodes(id, { limit: 100 }, signal), [id], {
    cacheKey: `anime:${id}:episodes:all`,
  })

  const sourcesFetch = useFetch((signal) => getSources(id, episodeNumber, signal), [id, episodeNumber], {
    cacheKey: `anime:${id}:sources:${episodeNumber}`,
  })

  if (animeLoading || sourcesFetch.loading) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background">
        <LoadingState variant="hero" />
      </div>
    )
  }

  if (animeError || !anime) {
    return (
      <Container className="pt-28 pb-16">
        <ErrorState onRetry={refetchAnime} />
      </Container>
    )
  }

  const episode = episodesList.data?.data?.find((ep) => Number(ep.number) === Number(episodeNumber)) || {
    id: `${id}-${episodeNumber}`,
    number: Number(episodeNumber),
    title: null,
    aired: null,
    score: null,
    filler: false,
  }

  const sources = sourcesFetch.data?.sources || []

  if (!sources.length) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <EmptyState
          title="Sin fuente disponible para este episodio"
          description="Todavía no tenemos un video real para este episodio — hoy solo conectamos openings/endings de anime (AnimeThemes), no episodios completos."
        />
        <Link
          to={animeDetailPath(id)}
          className="flex min-h-11 items-center rounded-full border border-border px-5 text-sm text-text-secondary transition-colors hover:text-text"
        >
          Volver a la ficha del anime
        </Link>
      </div>
    )
  }

  return (
    <>
      <VideoPlayer
        anime={anime}
        episode={episode}
        episodeNumber={episodeNumber}
        sources={sources}
        subtitleLanguages={sourcesFetch.data?.subtitleLanguages || []}
        accountId={user?.id ?? null}
        profileId={activeProfile?.id ?? null}
        autoplayEnabled={activeProfile?.autoplay !== false}
        totalEpisodes={anime.episodes}
      />
      <Container className="py-8">
        <EpisodeInfoPanel anime={anime} episode={episode} sourcesInfo={sourcesFetch.data?.info} />
      </Container>
    </>
  )
}

export default Watch
