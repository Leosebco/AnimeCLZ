import { AnimatePresence, motion } from 'framer-motion'
import AnimeCard from '@/components/movie/AnimeCard'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

function MovieGrid({
  movies,
  loading,
  error,
  onRetry,
  errorMessage,
  emptyMessage = 'No encontramos resultados con estos filtros.',
}) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LoadingState variant="grid" />
        </motion.div>
      ) : error ? (
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ErrorState message={errorMessage} onRetry={onRetry} />
        </motion.div>
      ) : !movies?.length ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <EmptyState title="Sin resultados" description={emptyMessage} onRetry={onRetry} />
        </motion.div>
      ) : (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.02, ease: 'easeOut' }}
            >
              <AnimeCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MovieGrid
