import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, TrendingUp, Award, Music2, Globe, Tv } from 'lucide-react'
import Container from '@/components/ui/Container'
import Skeleton from '@/components/ui/Skeleton'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import MovieRow from '@/components/movie/MovieRow'
import AnimeDetailHero from '@/components/anime/AnimeDetailHero'
import StatCard from '@/components/ui/StatCard'
import StudioCard from '@/components/anime/StudioCard'
import CharacterCard from '@/components/anime/CharacterCard'
import StaffCard from '@/components/anime/StaffCard'
import EpisodeCard from '@/components/anime/EpisodeCard'
import RelatedAnimeCard from '@/components/anime/RelatedAnimeCard'
import ThemeSongCard from '@/components/anime/ThemeSongCard'
import ExternalLinkCard from '@/components/anime/ExternalLinkCard'
import StreamingPlatformBadge from '@/components/anime/StreamingPlatformBadge'
import GalleryGrid from '@/components/anime/GalleryGrid'
import InfoGrid from '@/components/anime/InfoGrid'
import useFetch from '@/hooks/useFetch'
import {
  getAnime,
  getCharacters,
  getEpisodes,
  getRecommendations,
  getRelations,
  getGallery,
} from '@/providers/ProviderManager'
import { getEpisodes as getPlaybackEpisodes } from '@/providers/playback/PlaybackProviderManager'
import { resolveEpisodeCoverage } from '@/providers/playback/rangeUtils'
import { listHistory } from '@/services/historyService'
import { useFavorites } from '@/context/FavoritesContext'
import { useWatchLater } from '@/context/WatchLaterContext'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ROUTES, RELATION_LABELS, animeDetailPath } from '@/constants'

// Subconjunto de `relation` que representa el "avance" cronológico de una
// franquicia (temporadas/películas/OVAs propias de la misma historia) — a
// diferencia de "Relacionados" (todo tipo de relación, incluida
// Adaptación/Personaje/Otro). Misma fuente de datos (`getRelations`, sin
// una segunda llamada), filtrada distinto — ver informe de entrega v2.3.
const SEASON_RELATION_TYPES = new Set([
  'Prequel',
  'Sequel',
  'Parent story',
  'Full story',
  'Side story',
  'Alternative setting',
  'Summary',
])

// v2.7 — Media Hub. `anime.studioLinks` (AniList, id/name/siteUrl) y
// `anime.studios` (Jikan, solo nombres) son dos listas independientes que
// pueden no alinearse 1:1 (nombres con formato distinto entre fuentes) —
// se resuelve por coincidencia exacta de nombre; sin match, `StudioCard`
// simplemente no se convierte en link (ver ese componente).
function resolveStudioSiteUrl(studioName, studioLinks) {
  return studioLinks?.find((link) => link.name === studioName)?.siteUrl || null
}

function AnimeDetail() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { activeProfile } = useProfile()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isInWatchLater, toggleWatchLater } = useWatchLater()
  const navigate = useNavigate()
  const [shared, setShared] = useState(false)

  const {
    data: anime,
    loading,
    error,
    refetch,
  } = useFetch((signal) => getAnime(id, signal), [id], { cacheKey: `anime:${id}` })

  const characters = useFetch((signal) => getCharacters(id, signal), [id], {
    cacheKey: `anime:${id}:characters`,
  })
  const recommendations = useFetch(
    (signal) => getRecommendations(id, { limit: 12 }, signal),
    [id],
    { cacheKey: `anime:${id}:recommendations` },
  )
  const relations = useFetch((signal) => getRelations(id, signal), [id], {
    cacheKey: `anime:${id}:relations`,
  })
  const gallery = useFetch((signal) => getGallery(id, signal), [id], {
    cacheKey: `anime:${id}:gallery`,
  })
  const episodes = useFetch((signal) => getEpisodes(id, { limit: 12 }, signal), [id], {
    cacheKey: `anime:${id}:episodes`,
  })
  // v2.1 — catálogo del Provider Engine de reproducción (qué hay disponible
  // para reproducir de este anime, incluye los temas OP/ED de AnimeThemes
  // que la sección "Opening / Ending" de v2.3 reusa sin una llamada nueva)
  // y, solo autenticado, el historial de este perfil (para los badges
  // "Visto"/progreso) — ambos independientes de los 6 fetches de arriba,
  // que siguen siendo 100% Jikan/AniList.
  const playback = useFetch((signal) => getPlaybackEpisodes(id, signal), [id], {
    cacheKey: `anime:${id}:playback-catalog`,
  })
  const profileId = activeProfile?.id
  const history = useFetch(
    () => (isAuthenticated && profileId ? listHistory(profileId) : Promise.resolve([])),
    [isAuthenticated, profileId],
    { cacheKey: isAuthenticated && profileId ? `history:${profileId}` : undefined },
  )

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

  // v2.1 — estado por episodio (¿hay una fuente real para reproducirlo?,
  // ¿este perfil ya lo vio?, ¿en qué porcentaje?) — calculado una vez acá,
  // reusado por cada EpisodeCard de la grilla de abajo.
  const historyForAnime = (history.data || []).filter((entry) => entry.id === anime.id)
  const getEpisodeState = (episodeNumber) => {
    const playable = playback.data ? resolveEpisodeCoverage(playback.data, episodeNumber).length > 0 : false
    const entry = historyForAnime.find((item) => item.episodeNumber === episodeNumber)
    const progressPercent =
      entry?.durationSeconds > 0 ? (entry.secondsWatched / entry.durationSeconds) * 100 : null
    const watched = progressPercent !== null && progressPercent >= 90
    return { playable, watched, progressPercent }
  }

  // v2.3 — Opening/Ending: mismo catálogo de `playback` de arriba,
  // agrupado por tipo (OP/ED) y ordenado por secuencia (OP1, OP2...).
  const openings = (playback.data || [])
    .filter((theme) => theme.type === 'OP')
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  const endings = (playback.data || [])
    .filter((theme) => theme.type === 'ED')
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))

  // v2.3 — Temporadas: mismo `relations.data` que "Relacionados", filtrado
  // a los tipos que representan la franquicia cronológica del anime (ver
  // SEASON_RELATION_TYPES arriba) — sin una segunda llamada de red.
  const seasonGroups = (relations.data || []).filter((group) => SEASON_RELATION_TYPES.has(group.relation))

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
          banner panorámico distinto), nunca el póster estirado sin más.
          Fuera de `Container` a propósito: debe ser full-bleed, el
          `Container` de abajo lo superpone con margen negativo. */}
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

        <AnimeDetailHero
          anime={anime}
          favorite={favorite}
          inWatchLater={inWatchLater}
          onToggleFavorite={() => requireAuth(() => toggleFavorite(anime))}
          onToggleWatchLater={() => requireAuth(() => toggleWatchLater(anime))}
          onShare={handleShare}
          onWatchNow={handleWatchNow}
          shared={shared}
        />

        {/* Información principal */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Información</h2>
          <InfoGrid
            items={[
              { label: 'Tipo', value: anime.type },
              { label: 'Estado', value: anime.status },
              { label: 'Duración', value: anime.duration },
              { label: 'Episodios', value: anime.episodes },
              {
                label: 'Temporada',
                value: anime.season ? `${anime.season} ${anime.year || ''}`.trim() : null,
              },
              { label: 'Año', value: anime.year },
              { label: 'Clasificación', value: anime.rating },
              { label: 'Estudios', value: anime.studios?.join(', ') },
              { label: 'Productores', value: anime.producers?.join(', ') },
              { label: 'Licenciantes', value: anime.licensors?.join(', ') },
            ]}
          />
        </section>

        {/* Sinopsis */}
        {anime.synopsis && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Sinopsis</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              {anime.synopsis}
            </p>
          </section>
        )}

        {/* Estadísticas — Favoritos/Miembros/Votos omitidos a propósito:
            ProviderManager.getAnime() no los expone hoy (ver informe de
            entrega v2.3), nunca se muestra un número inventado. */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Estadísticas</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard variant="compact" icon={Star} label="Score" value={typeof anime.score === 'number' ? anime.score.toFixed(2) : null} />
            <StatCard variant="compact" icon={TrendingUp} label="Popularidad" value={anime.popularity ? `#${anime.popularity}` : null} />
            <StatCard variant="compact" icon={Award} label="Ranking" value={anime.rank ? `#${anime.rank}` : null} />
          </div>
        </section>

        {/* Géneros */}
        {tags.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Géneros</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Estudios */}
        {anime.studios?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Estudios</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {anime.studios.map((name) => (
                <StudioCard key={name} name={name} siteUrl={resolveStudioSiteUrl(name, anime.studioLinks)} />
              ))}
            </div>
          </section>
        )}

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

        {/* Staff (v2.7 — Media Hub) — real, vía `ProviderManager.getAnime()`
            → `AniListProvider` (`staff`, mismo round-trip que la ficha,
            sin fetch nuevo). Jikan no aporta este campo hoy (ver
            `providers/models.js`), así que `anime.staff` puede venir vacío
            si AniList no tiene datos para este anime en particular — mismo
            EmptyState honesto de siempre, no una promesa de "sprint
            futuro" (ya está conectado). */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Staff</h2>
          {!anime.staff?.length ? (
            <EmptyState
              compact
              title="Sin staff registrado"
              description="Todavía no tenemos el equipo de producción de este anime."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {anime.staff.map((member) => (
                <StaffCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </section>

        {/* Episodios — sección ya existente (v2.1), mantenida sin cambios de
            lógica para no romper el reproductor (fuera de alcance de este
            sprint). */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Episodios</h2>
          {episodes.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-video w-full rounded-xl" />
              ))}
            </div>
          ) : episodes.error ? (
            <ErrorState compact onRetry={episodes.refetch} />
          ) : !episodes.data?.data?.length ? (
            <EmptyState
              compact
              title="Sin episodios listados"
              description="Todavía no tenemos el listado de episodios de este anime."
              onRetry={episodes.refetch}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {episodes.data.data.map((episode) => {
                const { playable, watched, progressPercent } = getEpisodeState(episode.number)
                return (
                  <EpisodeCard
                    key={episode.id}
                    anime={anime}
                    episode={episode}
                    playable={playable}
                    watched={watched}
                    progressPercent={progressPercent}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Opening / Ending — clips reales de AnimeThemes, mismo catálogo ya
            cargado arriba (`playback`), sin autoplay (ver ThemeSongCard). */}
        {(openings.length > 0 || endings.length > 0) && (
          <section className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-text sm:text-2xl">
              <Music2 size={20} className="text-primary" aria-hidden />
              Opening / Ending
            </h2>
            {playback.loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-video w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...openings, ...endings].map((theme) => (
                  <ThemeSongCard key={theme.id} theme={theme} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trailer — si no existe, la sección se oculta por completo (nunca
            un error), tal como pide el sprint. */}
        {anime.trailerUrl && (
          <section id="trailer" className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Trailer</h2>
            <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl ring-1 ring-border">
              <iframe
                src={anime.trailerUrl}
                title={`Trailer de ${anime.title}`}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Galería */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Galería</h2>
          {gallery.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-video w-full" />
              ))}
            </div>
          ) : gallery.error ? (
            <ErrorState compact onRetry={gallery.refetch} />
          ) : !gallery.data?.length ? (
            <EmptyState
              compact
              title="Sin imágenes disponibles"
              description="Todavía no tenemos imágenes adicionales para este anime."
              onRetry={gallery.refetch}
            />
          ) : (
            <GalleryGrid pictures={gallery.data} />
          )}
        </section>
      </Container>

      {/* Recomendados — reutiliza MovieRow/AnimeCard, fuera del Container
          para conservar el mismo ancho de carrusel que en Home. */}
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

      <Container className="pb-16">
        {/* Relacionados */}
        <section className="mt-4">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Relacionados</h2>
          {relations.loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
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
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <RelatedAnimeCard
                        key={item.mal_id}
                        item={item}
                        relationLabel={RELATION_LABELS[group.relation] || group.relation}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Temporadas — franquicia completa (precuela/secuela/historia
            paralela/resúmenes), mismo dato que Relacionados, filtrado. */}
        {seasonGroups.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Temporadas</h2>
            <div className="space-y-4">
              {seasonGroups.map((group) => (
                <div key={group.relation}>
                  <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                    {RELATION_LABELS[group.relation] || group.relation}
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <RelatedAnimeCard
                        key={item.mal_id}
                        item={item}
                        relationLabel={RELATION_LABELS[group.relation] || group.relation}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Plataformas oficiales de streaming (v2.7 — Media Hub) — enlaces
            de salida a dónde ver legalmente este anime (Crunchyroll,
            Netflix...), vía AniList `externalLinks` (`type: STREAMING`).
            Deliberadamente NO usa `streamingEpisodes` de AniList (URLs por
            episodio) — el sprint prohíbe explícitamente implementar
            reproducción de episodios; solo enlaces de salida a nivel de
            anime, nunca un reproductor embebido. Se oculta por completo si
            no hay ninguna (mismo criterio que Trailer/Géneros arriba: es
            contenido complementario, no un hueco que amerite EmptyState). */}
        {anime.streamingPlatforms?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-text sm:text-2xl">
              <Tv size={20} className="text-primary" aria-hidden />
              Dónde ver
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {anime.streamingPlatforms.map((platform) => (
                <StreamingPlatformBadge key={platform.id} platform={platform} />
              ))}
            </div>
          </section>
        )}

        {/* Enlaces oficiales (v2.7 — Media Hub) — sitio oficial, redes
            sociales, vía AniList `externalLinks` (todo lo que no sea
            `STREAMING`). Mismo criterio de ocultar si está vacío. */}
        {anime.officialLinks?.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-text sm:text-2xl">
              <Globe size={20} className="text-primary" aria-hidden />
              Enlaces oficiales
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {anime.officialLinks.map((link) => (
                <ExternalLinkCard key={link.id} link={link} />
              ))}
            </div>
          </section>
        )}

        {/* Comentarios — no hay todavía un listado público por anime (solo
            moderación en el Panel Admin, ver CLAUDE.md); construir esa
            lectura pública es una funcionalidad nueva de backend, fuera de
            alcance de un sprint de rediseño visual. EmptyState honesto en
            vez de datos de muestra inventados. */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Comentarios</h2>
          <EmptyState
            compact
            title="Comentarios no disponibles todavía"
            description="Esta sección está preparada, pero la lectura pública de comentarios por anime es una funcionalidad de backend pendiente."
          />
        </section>

        {/* Noticias — la tabla `news` es global al sitio, sin relación con
            un anime puntual todavía (ver CLAUDE.md) — mostrar noticias sin
            relación real sería engañoso, así que se omite con un
            EmptyState honesto en vez de listar contenido no relacionado. */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-text sm:text-2xl">Noticias</h2>
          <EmptyState
            compact
            title="Sin noticias relacionadas"
            description="Todavía no existe una relación entre noticias y animes puntuales."
          />
        </section>
      </Container>
    </>
  )
}

export default AnimeDetail
