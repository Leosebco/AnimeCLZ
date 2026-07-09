import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserCollection } from '@/hooks/useUserCollection'
import { addFavorite, listFavorites, removeFavorite } from '@/services/favoritesService'

const FavoritesContext = createContext(null)

/**
 * "Favoritos" (♥) — persistido en Supabase por usuario (tabla `favorites`).
 * Distinto de "Mi Lista" (ver WatchLaterContext): favorito es "me gusta",
 * Mi Lista es "quiero verlo después". Requiere sesión — los componentes
 * que exponen el botón de favorito deben verificar useAuth().isAuthenticated
 * antes de llamar a toggleFavorite.
 */
export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const { items, isSaved, toggle, loading } = useUserCollection({
    userId: user?.id ?? null,
    list: listFavorites,
    add: addFavorite,
    remove: removeFavorite,
  })

  const value = useMemo(
    () => ({ favorites: items, isFavorite: isSaved, toggleFavorite: toggle, loading }),
    [items, isSaved, toggle, loading],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider')
  return context
}
