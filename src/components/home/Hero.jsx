import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Heart, Bookmark, Star } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { animeDetailPath, ROUTES, STATUS_LABELS } from '@/constants'
import { useFavorites } from '@/context/FavoritesContext'
import { useWatchLater } from '@/context/WatchLaterContext'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const AUTOPLAY_MS = 8000
const SWIPE_THRESHOLD = 80

/**
 * Home hero — a carousel of several real, currently top-rated anime
 * (see getFeaturedSlides in animeService). No fabricated "featured" flag,
 * no stock imagery: the ambient background is the anime's own poster,
 * blurred, so a portrait image never has to be stretched into a landscape
 * banner Jikan doesn't provide.
 *
 * v1.7 — bug real corregido: el gesto de arrastre (`drag="x"`) envolvía
 * TODO el contenido (poster+título+sinopsis+3 botones) — en touch, ese
 * reconocedor de gestos de Framer Motion competía con el scroll vertical
 * nativo de la página sobre un área enorme que incluía botones
 * interactivos ("cuesta seguir bajando"/"captura el dedo" reportado por el
 * usuario). Ahora el drag solo existe en desktop (`useIsDesktop`, mouse no
 * compite con scroll táctil); mobile navega por autoplay + puntos, igual
 * que antes. De paso, mobile deja de tener una altura fija (`92vh`/`620px`
 * — "Hero demasiado grande") y los puntos pasan a flujo normal en vez de
 * `position: absolute` sobre contenido centrado verticalmente (causa real
 * de "líneas del slider entre los botones" en viewports bajos).
 */
function Hero({ slides, loading, error, onRetry }) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isInWatchLater, toggleWatchLater } = useWatchLater()
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const count = slides?.length ?? 0

  useEffect(() => {
    if (paused || count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, count, index])

  if (loading) return <LoadingState variant="hero" />
  if (error) return <ErrorState onRetry={onRetry} />
  if (!count) return null

  const anime = slides[index % count]
  const favorite = isFavorite(anime.id)
  const inWatchLater = isInWatchLater(anime.id)
  const synopsis =
    anime.synopsis && anime.synopsis.length > 280
      ? `${anime.synopsis.slice(0, 280).trim()}…`
      : anime.synopsis

  const goTo = (next) => setIndex(((next % count) + count) % count)

  const handleDragEnd = (_event, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(index + 1)
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(index - 1)
  }

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: animeDetailPath(anime.id) } } })
      return
    }
    action()
  }

  const dotButtonClass = (active) =>
    cn('h-1.5 rounded-full transition-all duration-300', active ? 'w-6 bg-primary' : 'w-1.5 bg-white/30 hover:bg-white/50')

  return (
    <section
      className="relative w-full overflow-hidden sm:h-[92vh] sm:min-h-[620px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient background: the poster itself, blurred and scaled up — a
          real image, never a stretched/pixelated stand-in banner. */}
      <AnimatePresence mode="sync">
        <motion.div
          key={anime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={anime.backdrop || anime.poster}
            alt=""
            className="h-full w-full scale-110 object-cover object-top blur-3xl opacity-60"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-background/10" />
        </motion.div>
      </AnimatePresence>

      <Container className="relative z-10 flex flex-col pb-8 pt-24 sm:h-full sm:justify-center sm:pb-28 sm:pt-20">
        <motion.div
          drag={isDesktop && count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={isDesktop ? handleDragEnd : undefined}
          className="w-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={anime.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8"
            >
              <motion.img
                src={anime.poster}
                srcSet={anime.posterSmall ? `${anime.posterSmall} 1x, ${anime.poster} 2x` : undefined}
                alt={anime.title}
                fetchPriority="high"
                decoding="async"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="aspect-[2/3] w-28 shrink-0 rounded-2xl object-cover ring-1 ring-border shadow-2xl sm:w-44 md:w-56"
              />

              <motion.div
                initial={{ x: 24 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-2xl"
              >
                <span className="mb-4 inline-flex items-center rounded-full border border-border bg-surface/50 px-3.5 py-1.5 text-xs uppercase tracking-widest text-text-secondary backdrop-blur-sm sm:mb-5">
                  Destacado
                </span>

                <h1 className="line-clamp-2 font-display text-2xl font-bold leading-tight text-text sm:text-4xl lg:text-6xl">
                  {anime.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary sm:mt-4">
                  {typeof anime.score === 'number' && (
                    <span className="flex items-center gap-1 text-text">
                      <Star size={14} className="text-primary" fill="currentColor" />
                      {anime.score.toFixed(1)}
                    </span>
                  )}
                  {anime.year && <span>{anime.year}</span>}
                  {anime.type && <span>{anime.type}</span>}
                  {anime.status && <span>{STATUS_LABELS[anime.status] || anime.status}</span>}
                </div>

                {anime.genres?.length > 0 && (
                  <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                    {anime.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {synopsis && (
                  <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:mt-6 sm:line-clamp-none sm:text-base">
                    {synopsis}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button as={Link} to={animeDetailPath(anime.id)} size="lg" className="w-full sm:w-auto">
                    <Play size={18} fill="currentColor" />
                    Ver Ahora
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => requireAuth(() => toggleFavorite(anime))}
                    aria-pressed={favorite}
                    className="w-full sm:w-auto"
                  >
                    <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
                    {favorite ? 'En Favoritos' : 'Favorito'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => requireAuth(() => toggleWatchLater(anime))}
                    aria-pressed={inWatchLater}
                    className="w-full sm:w-auto"
                  >
                    <Bookmark size={18} fill={inWatchLater ? 'currentColor' : 'none'} />
                    {inWatchLater ? 'En Mi Lista' : 'Mi Lista'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Puntos en mobile: flujo normal, debajo de los botones — nunca
            `position: absolute` sobre contenido centrado (eso era la causa
            real del solape "líneas del slider entre los botones"). */}
        {count > 1 && (
          <div className="mt-6 flex justify-center gap-2 sm:hidden">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir al destacado ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                onClick={() => goTo(slideIndex)}
                className={cn('flex min-h-11 min-w-6 items-center justify-center')}
              >
                <span className={dotButtonClass(slideIndex === index)} />
              </button>
            ))}
          </div>
        )}
      </Container>

      {/* Desktop (sm+): puntos y miniaturas absolutos, como siempre. */}
      {count > 1 && (
        <>
          <div className="absolute bottom-28 left-1/2 z-10 hidden -translate-x-1/2 gap-2 sm:flex">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir al destacado ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                onClick={() => goTo(slideIndex)}
                className={dotButtonClass(slideIndex === index)}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 hidden justify-center gap-3 pb-6 sm:flex">
            {slides.slice(0, 6).map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ver ${slide.title}`}
                aria-current={slideIndex === index}
                onClick={() => goTo(slideIndex)}
                className={cn(
                  'h-16 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition-all duration-200',
                  slideIndex === index
                    ? 'scale-105 ring-primary'
                    : 'opacity-60 ring-transparent hover:opacity-100',
                )}
              >
                <img
                  src={slide.posterSmall || slide.poster}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default Hero
