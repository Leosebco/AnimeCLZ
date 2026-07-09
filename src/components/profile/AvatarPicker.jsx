import { useEffect, useState } from 'react'
import { Loader2, Search, UploadCloud, User, Wand2 } from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import useDebounce from '@/hooks/useDebounce'
import { getCharacterAnime, searchCharacters } from '@/providers/AnimeProvider'
import { uploadAvatarImage } from '@/services/avatarService'
import { AVATAR_TYPES, PROFILE_COLORS } from '@/constants'
import { cn } from '@/utils/cn'

const TABS = [
  { value: AVATAR_TYPES.INITIAL, label: 'Inicial y color', icon: Wand2 },
  { value: AVATAR_TYPES.UPLOAD, label: 'Subir imagen', icon: UploadCloud },
  { value: AVATAR_TYPES.CHARACTER, label: 'Personaje de anime', icon: User },
]

/**
 * Selector de avatar embebido en ProfileFormModal (no es su propio modal —
 * anidar un Dialog dentro de otro complica el foco sin necesidad). Tres
 * modos: color + inicial (por defecto, sin imagen), imagen propia
 * (Supabase Storage, ver avatarService) o personaje de Jikan.
 *
 * El grid de personajes solo muestra imagen + nombre — `/characters` (la
 * búsqueda global) no trae el anime en la respuesta de lista, a diferencia
 * de `/anime/{id}/characters`. El anime real se resuelve con una sola
 * llamada extra (getCharacterAnime) recién cuando el usuario elige uno,
 * no para los 12 resultados a la vez.
 */
function AvatarPicker({ accountId, nombre, value, onChange }) {
  const [tab, setTab] = useState(value.tipoAvatar || AVATAR_TYPES.INITIAL)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const [characters, setCharacters] = useState([])
  const [searching, setSearching] = useState(false)
  const [pendingCharacter, setPendingCharacter] = useState(null)

  const hasQuery = tab === AVATAR_TYPES.CHARACTER && Boolean(debouncedQuery.trim())

  useEffect(() => {
    if (!hasQuery) return
    let active = true
    setSearching(true)
    searchCharacters(debouncedQuery)
      .then((data) => {
        if (active) setCharacters(data)
      })
      .catch(() => {
        if (active) setCharacters([])
      })
      .finally(() => {
        if (active) setSearching(false)
      })
    return () => {
      active = false
    }
  }, [hasQuery, debouncedQuery])

  // Deriva en vez de "resetear" characters con un setState extra en el
  // efecto de arriba: fuera de la pestaña de personajes o sin búsqueda, el
  // grid visible es vacío sin necesidad de un segundo setState síncrono.
  const visibleCharacters = hasQuery ? characters : []

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

  const handlePickCharacter = async (character) => {
    setPendingCharacter({ ...character, anime: undefined })
    const anime = await getCharacterAnime(character.id).catch(() => null)
    setPendingCharacter((prev) => (prev?.id === character.id ? { ...prev, anime } : prev))
  }

  const confirmCharacter = () => {
    onChange({ avatar: pendingCharacter.image, tipoAvatar: AVATAR_TYPES.CHARACTER })
    setPendingCharacter(null)
  }

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
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
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
                'h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-110',
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

      {tab === AVATAR_TYPES.CHARACTER && (
        <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar un personaje..."
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-secondary transition-colors duration-200 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>

          {searching && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-xl" />
              ))}
            </div>
          )}

          {!searching && visibleCharacters.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {visibleCharacters.map((character) => (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => handlePickCharacter(character)}
                  className="group flex flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-hover"
                >
                  <img
                    src={character.image}
                    alt={character.name}
                    className="aspect-square w-full rounded-lg object-cover ring-1 ring-border transition-all group-hover:ring-primary"
                  />
                  <span className="w-full truncate text-center text-[11px] text-text-secondary">
                    {character.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {pendingCharacter && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <img
                src={pendingCharacter.image}
                alt={pendingCharacter.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{pendingCharacter.name}</p>
                <p className="truncate text-xs text-text-secondary">
                  {pendingCharacter.anime === undefined ? 'Buscando el anime...' : pendingCharacter.anime || 'Anime no disponible'}
                </p>
              </div>
              <Button size="sm" onClick={confirmCharacter}>
                Usar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AvatarPicker
