import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Search, UploadCloud, User, Wand2 } from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'
import AvatarCandidateCard from './AvatarCandidateCard'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import useDebounce from '@/hooks/useDebounce'
import useFetch from '@/hooks/useFetch'
import { searchAvatarCandidates } from '@/services/avatarSearchService'
import { listAvatarHistory, setAvatarFavorite } from '@/services/avatarHistoryService'
import { uploadAvatarImage } from '@/services/avatarService'
import { AVATAR_TYPES, PROFILE_COLORS } from '@/constants'
import { cn } from '@/utils/cn'

const TABS = [
  { value: AVATAR_TYPES.INITIAL, label: 'Inicial y color', icon: Wand2 },
  { value: AVATAR_TYPES.UPLOAD, label: 'Subir imagen', icon: UploadCloud },
  { value: AVATAR_TYPES.CHARACTER, label: 'Personaje de anime', icon: User },
]

const CARD_GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
}

/**
 * Selector de avatar embebido en ProfileFormModal (no es su propio modal —
 * anidar un Dialog dentro de otro complica el foco sin necesidad). Tres
 * modos: color + inicial (por defecto, sin imagen), imagen propia
 * (Supabase Storage, ver avatarService) o personaje de anime.
 *
 * v1.6 — "Personaje de anime" reescrito como buscador inteligente: un solo
 * input detecta si el término es un anime o un personaje (ver
 * avatarSearchService.js — AniList primero, Jikan de respaldo), muestra
 * "Favoritos"/"Avatares recientes" cuando no hay búsqueda activa, y
 * "Seleccionar" es una acción de un solo paso: guarda el perfil YA y
 * cierra el modal (`onSelectAndClose`, confirmado con el usuario) — los
 * otros dos modos siguen usando `onChange` (quedan en borrador hasta
 * pulsar "Guardar").
 */
function AvatarPicker({ accountId, nombre, value, onChange, onSelectAndClose }) {
  const [tab, setTab] = useState(value.tipoAvatar || AVATAR_TYPES.INITIAL)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const trimmedQuery = debouncedQuery.trim()

  const [selectingId, setSelectingId] = useState(null)
  const [favoritePendingId, setFavoritePendingId] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const isCharacterTab = tab === AVATAR_TYPES.CHARACTER

  const {
    data: searchResults,
    loading: searching,
    error: searchError,
  } = useFetch(
    (signal) => (trimmedQuery ? searchAvatarCandidates(trimmedQuery, signal) : Promise.resolve([])),
    [trimmedQuery],
    {
      cacheKey: trimmedQuery ? `avatar-search:${trimmedQuery.toLowerCase()}` : undefined,
      cacheTTL: 5 * 60 * 1000,
    },
  )

  useEffect(() => {
    if (!isCharacterTab || !accountId || historyLoaded) return
    let active = true
    listAvatarHistory(accountId)
      .then((data) => {
        if (active) setHistory(data)
      })
      .catch(() => {
        if (active) setHistory([])
      })
      .finally(() => {
        if (active) setHistoryLoaded(true)
      })
    return () => {
      active = false
    }
  }, [isCharacterTab, accountId, historyLoaded])

  // Un personaje ya marcado como favorito (guardado en avatar_history)
  // debe mostrar la estrella llena incluso en resultados de búsqueda
  // recién traídos, no solo en la vista de Favoritos.
  const favoriteIds = useMemo(
    () => new Set(history.filter((item) => item.isFavorite).map((item) => item.id)),
    [history],
  )
  const decoratedResults = useMemo(
    () => (searchResults || []).map((character) => ({ ...character, isFavorite: favoriteIds.has(character.id) })),
    [searchResults, favoriteIds],
  )
  const favorites = useMemo(() => history.filter((item) => item.isFavorite), [history])
  const recientes = useMemo(() => history.slice(0, 10), [history])

  const handleToggleFavorite = async (character) => {
    if (!accountId) return
    setFavoritePendingId(character.id)
    const nextFavorite = !character.isFavorite
    try {
      await setAvatarFavorite(accountId, character, nextFavorite)
      setHistory((prev) => {
        const exists = prev.some((item) => item.id === character.id)
        if (exists) {
          return prev.map((item) => (item.id === character.id ? { ...item, isFavorite: nextFavorite } : item))
        }
        return [{ ...character, isFavorite: nextFavorite, usedAt: new Date().toISOString() }, ...prev]
      })
    } catch {
      // Acción secundaria — si falla, simplemente no se refleja; no
      // bloquea nada más en el picker.
    } finally {
      setFavoritePendingId(null)
    }
  }

  const handleSelect = async (character) => {
    setSelectingId(character.id)
    try {
      await onSelectAndClose(character)
    } finally {
      setSelectingId(null)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const url = await uploadAvatarImage(accountId, file)
      onChange({ avatar: url, tipoAvatar: AVATAR_TYPES.UPLOAD })
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const renderCandidateGrid = (characters) => (
    <motion.div className={CARD_GRID} variants={gridVariants} initial="hidden" animate="visible">
      <AnimatePresence>
        {characters.map((character) => (
          <AvatarCandidateCard
            key={character.id}
            character={character}
            onSelect={handleSelect}
            selecting={selectingId === character.id}
            onToggleFavorite={handleToggleFavorite}
            favoritePending={favoritePendingId === character.id}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )

  return (
    <div>
      <div className="flex items-center gap-4">
        <ProfileAvatar
          avatar={value.avatar}
          tipoAvatar={value.tipoAvatar}
          color={value.color}
          nombre={nombre}
          size={72}
        />
        <div className="flex flex-1 flex-wrap gap-2">
          {TABS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTab(option.value)}
              aria-pressed={tab === option.value}
              className={cn(
                'flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                tab === option.value
                  ? 'border-transparent bg-primary text-white'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-text',
              )}
            >
              <option.icon size={13} aria-hidden />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {tab === AVATAR_TYPES.INITIAL && (
        <div className="mt-4 flex flex-wrap gap-2">
          {PROFILE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              aria-pressed={value.color === color}
              onClick={() => onChange({ avatar: null, tipoAvatar: AVATAR_TYPES.INITIAL, color })}
              style={{ backgroundColor: color }}
              className={cn(
                'h-11 w-11 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-110',
                value.color === color ? 'ring-text' : 'ring-transparent',
              )}
            />
          ))}
        </div>
      )}

      {tab === AVATAR_TYPES.UPLOAD && (
        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-text-secondary transition-colors hover:border-primary/60 hover:text-text">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            {uploading ? 'Subiendo...' : 'Elegir una imagen (máx. 3 MB)'}
          </label>
          {uploadError && (
            <p role="alert" className="mt-2 text-sm text-error">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {isCharacterTab && (
        <div className="mt-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              size={16}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar un anime o personaje..."
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-base text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary sm:text-sm"
            />
          </div>

          <div className="mt-3">
            <AnimatePresence mode="wait">
              {trimmedQuery ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {searching ? (
                    <div className={CARD_GRID}>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <Skeleton key={index} className="aspect-square rounded-xl" />
                      ))}
                    </div>
                  ) : searchError ? (
                    <EmptyState compact title="No pudimos buscar" description="Probá de nuevo en un momento." />
                  ) : decoratedResults.length === 0 ? (
                    <EmptyState compact title="Sin resultados" description="Probá con otro anime o personaje." />
                  ) : (
                    renderCandidateGrid(decoratedResults)
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="browse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-5"
                >
                  {favorites.length > 0 && (
                    <section>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Favoritos
                      </h4>
                      {renderCandidateGrid(favorites)}
                    </section>
                  )}

                  {recientes.length > 0 && (
                    <section>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Avatares recientes
                      </h4>
                      {renderCandidateGrid(recientes)}
                    </section>
                  )}

                  {historyLoaded && favorites.length === 0 && recientes.length === 0 && (
                    <EmptyState
                      compact
                      title="Buscá un anime o personaje"
                      description="Escribí arriba para elegir un avatar — por ejemplo, 'Naruto' o 'Gojo'."
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvatarPicker
