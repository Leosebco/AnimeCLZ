import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Heart, Star } from 'lucide-react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import { animeDetailPath, STATUS_LABELS } from '@/constants'
import { useFavorites } from '@/context/FavoritesContext'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

/**
 * Home hero — always a real, currently top-rated anime from Jikan
 * (see getFeaturedAnime in animeService). No fabricated "featured" content.
 */
function Hero({ anime, loading, error, onRetry }) {
  const { isFavorite, toggleFavorite } = useFavorites()

  if (loading) return <LoadingState variant="hero" />
  if (error) return <ErrorState onRetry={onRetry} />
  if (!anime) return null

  const favorite = isFavorite(anime.id)
  const synopsis =
    anime.synopsis && anime.synopsis.length > 280
      ? `${anime.synopsis.slice(0, 280).trim()}…`
      : anime.synopsis

  return (
    <section className="relative flex h-[86vh] min-h-[560px] w-full items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={anime.backdrop || anime.poster} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
      </div>

      <Container className="relative z-10 pb-14 sm:pb-16">
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-2xl">
          <motion.span
            variants={item}
            className="mb-5 inline-flex items-center rounded-full border border-border/70 bg-surface/50 px-3.5 py-1.5 text-xs uppercase tracking-widest text-text-secondary backdrop-blur-sm"
          >
            Destacado
          </motion.span>

          <motion.h1
            variants={item}
            className="font-display text-3xl font-bold leading-tight text-text sm:text-4xl lg:text-6xl"
          >
            {anime.title}
          </motion.h1>

          <motion.div
            variants={item}
            className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary"
          >
            {typeof anime.score === 'number' && (
              <span className="flex items-center gap-1 text-text">
                <Star size={14} className="text-primary" fill="currentColor" />
                {anime.score.toFixed(1)}
              </span>
            )}
            {anime.year && <span>{anime.year}</span>}
            {anime.type && <span>{anime.type}</span>}
            {anime.status && <span>{STATUS_LABELS[anime.status] || anime.status}</span>}
          </motion.div>

          {anime.genres?.length > 0 && (
            <motion.div variants={item} className="mt-4 flex flex-wrap gap-2">
              {anime.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-border/70 px-3 py-1 text-xs text-text-secondary"
                >
                  {genre}
                </span>
              ))}
            </motion.div>
          )}

          {synopsis && (
            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base"
            >
              {synopsis}
            </motion.p>
          )}

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to={animeDetailPath(anime.id)} size="lg">
              <Play size={18} fill="currentColor" />
              Ver Ahora
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => toggleFavorite(anime)}
              aria-pressed={favorite}
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
              {favorite ? 'En Mi Lista' : 'Mi Lista'}
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

export default Hero
