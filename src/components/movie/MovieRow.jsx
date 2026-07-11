import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AnimeCard from './AnimeCard'
import AnimeCardSkeleton from './AnimeCardSkeleton'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import Container from '@/components/ui/Container'
import { cn } from '@/utils/cn'

const arrowClass = (visible) =>
  cn(
    'absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-background/80 p-2.5 text-text ring-1 ring-border backdrop-blur-md transition-all duration-200 hover:ring-primary/50 sm:flex',
    visible ? 'opacity-100' : 'pointer-events-none opacity-0',
  )

/**
 * Horizontally-scrolling shelf of AnimeCards with a section heading, arrow
 * controls, and its own loading/error handling. Every Home section (and
 * AnimeDetail's "Recomendados") renders this same component with a
 * different title/dataset. Home rows hide silently on empty (no
 * `emptyState`); pass `emptyState` where an explicit "sin resultados" state
 * is expected instead. Mouse/trackpad/touch all move the row: native touch
 * scroll, a vertical mouse wheel redirected to horizontal (Netflix-style),
 * and the side arrow buttons.
 */
function MovieRow({ title, movies, loading, error, onRetry, emptyState }) {
  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return

    // A plain vertical mouse-wheel gesture over the row scrolls it
    // horizontally instead of scrolling the page — the classic Netflix-row
    // feel. A real horizontal trackpad swipe (deltaX already dominant) is
    // left alone. Needs a native listener (not JSX onWheel) because React
    // attaches wheel handlers as passive, which silently ignores
    // preventDefault.
    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (el.scrollWidth <= el.clientWidth) return
      event.preventDefault()
      el.scrollLeft += event.deltaY
    }

    el.addEventListener('scroll', updateArrows, { passive: true })
    el.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      el.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', updateArrows)
    }
  }, [movies])

  const scrollByAmount = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.85 * direction, behavior: 'smooth' })
  }

  const isEmpty = !loading && !error && !movies?.length
  if (isEmpty && !emptyState) return null

  return (
    <section className="py-8 sm:py-11">
      <Container>
        <h2 className="mb-5 font-display text-2xl font-bold text-text sm:text-3xl">{title}</h2>
      </Container>

      {error ? (
        <Container>
          <ErrorState compact onRetry={onRetry} />
        </Container>
      ) : isEmpty ? (
        <Container>
          <EmptyState compact onRetry={onRetry} {...emptyState} />
        </Container>
      ) : loading ? (
        <div className="flex gap-5 overflow-x-hidden px-4 pb-2 sm:px-6 lg:px-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-40 shrink-0 sm:w-44 md:w-48">
              <AnimeCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            aria-label="Desplazar a la izquierda"
            onClick={() => scrollByAmount(-1)}
            className={cn('left-3', arrowClass(canScrollLeft))}
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollerRef}
            className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth px-4 pb-2 [touch-action:pan-x] [overscroll-behavior-x:contain] sm:px-6 lg:px-8"
          >
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -80px 0px' }}
                transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
                className="w-40 shrink-0 sm:w-44 md:w-48"
              >
                <AnimeCard movie={movie} />
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Desplazar a la derecha"
            onClick={() => scrollByAmount(1)}
            className={cn('right-3', arrowClass(canScrollRight))}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  )
}

export default MovieRow
