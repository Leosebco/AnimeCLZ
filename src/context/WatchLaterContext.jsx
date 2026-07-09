import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserCollection } from '@/hooks/useUserCollection'
import { addWatchLater, listWatchLater, removeWatchLater } from '@/services/watchLaterService'

const WatchLaterContext = createContext(null)

/**
 * "Mi Lista" — animes que el usuario planea ver más adelante, persistido en
 * Supabase (tabla `watch_later`). Distinto de "Favoritos" (♥, ver
 * FavoritesContext). Requiere sesión.
 */
export function WatchLaterProvider({ children }) {
  const { user } = useAuth()
  const { items, isSaved, toggle, loading } = useUserCollection({
    userId: user?.id ?? null,
    list: listWatchLater,
    add: addWatchLater,
    remove: removeWatchLater,
  })

  const value = useMemo(
    () => ({ watchLater: items, isInWatchLater: isSaved, toggleWatchLater: toggle, loading }),
    [items, isSaved, toggle, loading],
  )

  return <WatchLaterContext.Provider value={value}>{children}</WatchLaterContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWatchLater() {
  const context = useContext(WatchLaterContext)
  if (!context) throw new Error('useWatchLater must be used within WatchLaterProvider')
  return context
}
