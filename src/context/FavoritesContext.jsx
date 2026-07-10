import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useUserCollection } from '@/hooks/useUserCollection'
import { addFavorite, listFavorites, removeFavorite } from '@/services/favoritesService'

const FavoritesContext = createContext(null)

/**
 * "Favoritos" (♥) — persistido en Supabase por PERFIL (tabla `favorites`,
 * columna `profile_id` desde v1.5/migración 0021 — antes era por cuenta).
 * Distinto de "Mi Lista" (ver WatchLaterContext): favorito es "me gusta",
 * Mi Lista es "quiero verlo después". Requiere sesión — los componentes
 * que exponen el botón de favorito deben verificar useAuth().isAuthenticated
 * antes de llamar a toggleFavorite.
 */
export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const { activeProfile } = useProfile()
  const { items, isSaved, toggle, loading } = useUserCollection({
    accountId: user?.id ?? null,
    profileId: activeProfile?.id ?? null,
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
