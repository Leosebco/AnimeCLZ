import { useCallback, useEffect, useRef, useState } from 'react'
import { getCached, setCached, removeCached } from '@/utils/cache'

/**
 * Generic async data hook shared by every page in AnimeCLZ.
 * - Cancels the in-flight request (AbortController) on unmount or dep change.
 * - Optionally caches successful results under `cacheKey` for `cacheTTL` ms.
 * - Exposes `refetch` to force a fresh request (used by ErrorState retry).
 */
export default function useFetch(fetcher, deps = [], options = {}) {
  const { cacheKey, cacheTTL, initialDelay = 0 } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    const cached = cacheKey ? getCached(cacheKey) : undefined
    if (cached !== undefined) {
      setData(cached)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    // Staggers independent parallel queries (e.g. Home's 9 sections) so they
    // don't all hit Jikan's rate limit in the same instant.
    const timer = setTimeout(() => {
      fetcherRef
        .current(controller.signal)
        .then((result) => {
          setData(result)
          setLoading(false)
          if (cacheKey) setCached(cacheKey, result, cacheTTL)
        })
        .catch((err) => {
          if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return
          setError(err)
          setLoading(false)
        })
    }, initialDelay)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const refetch = useCallback(() => {
    if (cacheKey) removeCached(cacheKey)
    setVersion((v) => v + 1)
  }, [cacheKey])

  return { data, loading, error, refetch }
}
