import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search as SearchIcon, Star } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import useFetch from '@/hooks/useFetch'
import useDebounce from '@/hooks/useDebounce'
import { quickSearchAnime } from '@/providers/AnimeProvider'
import { ROUTES, animeDetailPath } from '@/constants'

/**
 * Expanding, animated search trigger for the Navbar — collapses to an icon,
 * grows into a rounded bar on click, and shows a live (debounced) preview
 * of real results as the user types. "Ver todos los resultados" always
 * lands on the full /buscar page, which has the complete filter set.
 */
function NavbarSearch() {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const trimmedQuery = debouncedQuery.trim()
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const { data: results, loading } = useFetch(
    (signal) => (trimmedQuery ? quickSearchAnime(trimmedQuery, signal) : Promise.resolve([])),
    [trimmedQuery],
  )

  useEffect(() => {
    if (!expanded) return
    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setExpanded(false)
      }
    }
    function handleKey(event) {
      if (event.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [expanded])

  const goToFullResults = () => {
    if (!query.trim()) return
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`)
    setExpanded(false)
    setQuery('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    goToFullResults()
  }

  return (
    <div ref={containerRef} className="relative">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Buscar"
          className="p-2.5 rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text"
        >
          <SearchIcon size={19} />
        </button>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ width: 40, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 40, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative"
        >
          <SearchIcon
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            size={16}
          />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar anime..."
            aria-label="Buscar anime"
            className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
          />

          <AnimatePresence>
            {query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="custom-scrollbar absolute right-0 z-30 mt-2 max-h-96 w-80 overflow-auto rounded-2xl border border-border bg-surface/95 p-2 shadow-2xl backdrop-blur-xl"
              >
                {loading ? (
                  <div className="space-y-2 p-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Skeleton className="h-14 w-10 shrink-0 rounded-md" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results?.length ? (
                  <>
                    {results.map((anime) => (
                      <Link
                        key={anime.id}
                        to={animeDetailPath(anime.id)}
                        onClick={() => {
                          setExpanded(false)
                          setQuery('')
                        }}
                        className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-hover"
                      >
                        <img
                          src={anime.posterSmall || anime.poster}
                          alt=""
                          loading="lazy"
                          className="h-14 w-10 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text">{anime.title}</p>
                          {typeof anime.score === 'number' && (
                            <p className="flex items-center gap-1 text-xs text-text-secondary">
                              <Star size={11} className="text-primary" fill="currentColor" />
                              {anime.score.toFixed(1)}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={goToFullResults}
                      className="mt-1 w-full rounded-xl px-2 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-hover"
                    >
                      Ver todos los resultados
                    </button>
                  </>
                ) : (
                  <EmptyState compact title="Sin resultados" description="Prueba con otro título." />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      )}
    </div>
  )
}

export default NavbarSearch
