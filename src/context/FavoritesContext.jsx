import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'animeclz:favorites'
const FavoritesContext = createContext(null)

function readStoredFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Client-side "Mi Lista" store, backed by localStorage today. Consumers
 * only ever call useFavorites() — swapping the storage for Firebase later
 * (Sprint 4) won't require touching Hero/AnimeCard/MyList.
 */
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readStoredFavorites)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback(
    (id) => favorites.some((item) => item.id === id),
    [favorites],
  )

  const toggleFavorite = useCallback((anime) => {
    setFavorites((prev) =>
      prev.some((item) => item.id === anime.id)
        ? prev.filter((item) => item.id !== anime.id)
        : [...prev, anime],
    )
  }, [])

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite }),
    [favorites, isFavorite, toggleFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// Hook is intentionally colocated with its provider; splitting into another
// file just to satisfy Fast Refresh isn't worth the indirection here.
// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider')
  return context
}
