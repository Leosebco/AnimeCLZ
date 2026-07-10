import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Estado + acciones compartidas entre FavoritesContext y WatchLaterContext:
 * ambas son "una lista de animes persistida en Supabase, por perfil", solo
 * cambia qué tabla/servicio usan. Actualización optimista con reversión si
 * la escritura falla (sin bloquear la UI en cada click).
 *
 * v1.5: el scope real es `profileId` (antes era `userId`/la cuenta — ver
 * migración 0021) — `accountId` solo hace falta para `add` (la columna
 * `user_id` sigue siendo NOT NULL en las tablas, por RLS).
 */
export function useUserCollection({ accountId, profileId, list, add, remove }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profileId) return
    let active = true
    setLoading(true)
    list(profileId)
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [profileId, list])

  // Deriva en vez de "resetear" items con un setState extra en el efecto de
  // arriba: sin profileId (sin perfil activo) la lista visible es vacía sin
  // un segundo setState síncrono. Memoizado para no invalidar isSaved/toggle
  // en cada render (solo cambia cuando items o profileId realmente cambian).
  const visibleItems = useMemo(() => (profileId ? items : []), [profileId, items])

  const isSaved = useCallback((id) => visibleItems.some((item) => item.id === id), [visibleItems])

  const toggle = useCallback(
    async (anime) => {
      if (!profileId || !accountId) return
      const alreadySaved = items.some((item) => item.id === anime.id)
      setItems((prev) => (alreadySaved ? prev.filter((item) => item.id !== anime.id) : [anime, ...prev]))
      try {
        if (alreadySaved) await remove(profileId, anime.id)
        else await add(accountId, profileId, anime)
      } catch (error) {
        setItems((prev) =>
          alreadySaved ? [anime, ...prev] : prev.filter((item) => item.id !== anime.id),
        )
        throw error
      }
    },
    [accountId, profileId, items, add, remove],
  )

  return useMemo(
    () => ({ items: visibleItems, isSaved, toggle, loading: profileId ? loading : false }),
    [visibleItems, isSaved, toggle, loading, profileId],
  )
}
