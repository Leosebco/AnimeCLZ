import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search as SearchIcon, Star, X } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import useFetch from '@/hooks/useFetch'
import useDebounce from '@/hooks/useDebounce'
import { searchAll } from '@/services/searchService'
import { ROUTES, animeDetailPath } from '@/constants'

const EMPTY_RESULTS = { anime: [], characters: [], degraded: false }

// v2.4 — 8 sugerencias combinadas en total (pedido explícito del sprint de
// búsqueda: "Autocompletado... Máximo: 8 sugerencias"), repartidas 5
// anime + 3 personajes — ya venían ordenadas por relevancia real desde
// `searchService.searchAll` (ranking v2.4), así que cortar acá no pierde
// el mejor resultado.
const MAX_ANIME_SUGGESTIONS = 5
const MAX_CHARACTER_SUGGESTIONS = 3

/**
 * Expanding, animated search trigger for the Navbar. Dos variantes según
 * viewport (mismo estado/lógica de fetch, dos bloques JSX condicionados por
 * CSS — mismo patrón `md:hidden`/`hidden md:block` que el resto del
 * proyecto, no hay detección de viewport por JS):
 * - Desktop (`md`+): colapsa a un ícono, crece en el propio header a un
 *   ancho fijo (300px) con un dropdown de resultados.
 * - Mobile (`<md`): un ancho fijo desbordaba el header en 320-375px (300px
 *   más el dropdown `w-80` no entran en los ~288px de contenido real tras
 *   el padding de `Container`). En vez de eso abre un overlay a pantalla
 *   completa (`fixed inset-0`), con su propio cierre — se siente "de
 *   aplicación" y de paso elimina el desborde horizontal.
 * "Ver todos los resultados" siempre lleva a la página completa /buscar.
 */
function NavbarSearch() {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const trimmedQuery = debouncedQuery.trim()
  const containerRef = useRef(null)
  const navigate = useNavigate()

  // v2.4 — cacheKey agregado (antes no tenía ninguno: cada tecla disparaba
  // una consulta nueva sin cachear, incluso repitiendo una ya resuelta por
  // esta misma barra o por /buscar). Mismo formato de clave que
  // `Search.jsx` (`search:${query}:${JSON.stringify(filters)}`, acá
  // siempre `{}` porque el Navbar nunca aplica filtros) — así una consulta
  // ya resuelta en una pantalla se reusa en la otra sin pedirla de nuevo.
  const { data, loading } = useFetch(
    (signal) => (trimmedQuery ? searchAll(trimmedQuery, {}, signal) : Promise.resolve(EMPTY_RESULTS)),
    [trimmedQuery],
    { cacheKey: trimmedQuery ? `search:${trimmedQuery}:{}` : undefined, cacheTTL: 10 * 60 * 1000 },
  )
  const results = data ?? EMPTY_RESULTS
  const hasResults = results.anime.length > 0 || results.characters.length > 0

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

  const handleResultClick = () => {
    setExpanded(false)
    setQuery('')
  }

  const renderResults = () => {
    if (loading) {
      return (
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
      )
    }

    if (hasResults) {
      return (
        <>
          {results.anime.length > 0 && (
            <div>
              <p className="px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Anime
              </p>
              {results.anime.slice(0, MAX_ANIME_SUGGESTIONS).map((anime) => (
                <Link
                  key={anime.id}
                  to={animeDetailPath(anime.id)}
                  onClick={handleResultClick}
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
            </div>
          )}

          {results.characters.length > 0 && (
            <div className={results.anime.length > 0 ? 'mt-2' : undefined}>
              <p className="px-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Personajes
              </p>
              {results.characters.slice(0, MAX_CHARACTER_SUGGESTIONS).map((character) => (
                <div key={character.id} className="flex items-center gap-3 rounded-xl p-1.5">
                  <img
                    src={character.image}
                    alt=""
                    loading="lazy"
                    className="h-14 w-10 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{character.name}</p>
                    {character.anime && <p className="truncate text-xs text-text-secondary">{character.anime}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={goToFullResults}
            className="mt-1 w-full rounded-xl px-2 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-hover"
          >
            Ver todos los resultados
          </button>
        </>
      )
    }

    return <EmptyState compact title="Sin resultados" description="Prueba con otro título." />
  }

  return (
    <div ref={containerRef} className="relative">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Buscar"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text"
        >
          <SearchIcon size={19} />
        </button>
      ) : (
        <>
          {/* Mobile: overlay a pantalla completa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="safe-top fixed inset-0 z-[60] flex flex-col bg-background md:hidden"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="relative flex-1">
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
                  className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-3 text-base text-text placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Cerrar búsqueda"
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover hover:text-text"
              >
                <X size={20} />
              </button>
            </form>
            <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
              {query.trim() ? renderResults() : null}
            </div>
          </motion.div>

          {/* Desktop: expande dentro del propio header */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative hidden md:block"
          >
            <SearchIcon
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              size={16}
            />
            <input
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
                  {renderResults()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </>
      )}
    </div>
  )
}

export default NavbarSearch
