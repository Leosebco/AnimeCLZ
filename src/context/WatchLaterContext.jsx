import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useUserCollection } from '@/hooks/useUserCollection'
import { addWatchLater, listWatchLater, removeWatchLater } from '@/services/watchLaterService'

const WatchLaterContext = createContext(null)

/**
 * "Mi Lista" — animes que el usuario planea ver más adelante, persistido en
 * Supabase por PERFIL (tabla `watch_later`, columna `profile_id` desde
 * v1.5/migración 0021 — antes era por cuenta). Distinto de "Favoritos" (♥,
 * ver FavoritesContext). Requiere sesión.
 */
export function WatchLaterProvider({ children }) {
  const { user } = useAuth()
  const { activeProfile } = useProfile()
  const { items, isSaved, toggle, loading } = useUserCollection({
    accountId: user?.id ?? null,
    profileId: activeProfile?.id ?? null,
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
