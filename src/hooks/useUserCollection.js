import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Estado + acciones compartidas entre FavoritesContext y WatchLaterContext:
 * ambas son "una lista de animes persistida en Supabase, por usuario", solo
 * cambia qué tabla/servicio usan. Actualización optimista con reversión si
 * la escritura falla (sin bloquear la UI en cada click).
 */
export function useUserCollection({ userId, list, add, remove }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    let active = true
    setLoading(true)
    list(userId)
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
  }, [userId, list])

  // Deriva en vez de "resetear" items con un setState extra en el efecto de
  // arriba: sin userId (sesión cerrada) la lista visible es vacía sin un
  // segundo setState síncrono. Memoizado para no invalidar isSaved/toggle
  // en cada render (solo cambia cuando items o userId realmente cambian).
  const visibleItems = useMemo(() => (userId ? items : []), [userId, items])

  const isSaved = useCallback((id) => visibleItems.some((item) => item.id === id), [visibleItems])

  const toggle = useCallback(
    async (anime) => {
      if (!userId) return
      const alreadySaved = items.some((item) => item.id === anime.id)
      setItems((prev) => (alreadySaved ? prev.filter((item) => item.id !== anime.id) : [anime, ...prev]))
      try {
        if (alreadySaved) await remove(userId, anime.id)
        else await add(userId, anime)
      } catch (error) {
        setItems((prev) =>
          alreadySaved ? [anime, ...prev] : prev.filter((item) => item.id !== anime.id),
        )
        throw error
      }
    },
    [userId, items, add, remove],
  )

  return useMemo(
    () => ({ items: visibleItems, isSaved, toggle, loading: userId ? loading : false }),
    [visibleItems, isSaved, toggle, loading, userId],
  )
}
