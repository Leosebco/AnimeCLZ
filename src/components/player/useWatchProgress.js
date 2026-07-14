import { useCallback, useEffect, useRef } from 'react'
import { getProgress, upsertProgress } from '@/services/historyService'

const SAVE_INTERVAL_MS = 15000
const RESUME_SKIP_TAIL_SECONDS = 10

/**
 * Persistencia de "Continuar viendo" — guarda progreso cada ~15s mientras
 * reproduce, más inmediato en `pause` y al pasar a background
 * (`visibilitychange`), y reanuda desde la posición guardada al cargar.
 *
 * `sendBeacon` queda descartado a propósito: no puede llevar el header
 * `Authorization` que exige Supabase, así que no puede autenticar la
 * escritura — `beforeunload` tampoco es confiable en iOS Safari. El peor
 * caso con este enfoque es perder hasta ~15s de progreso en un cierre
 * abrupto de pestaña, aceptable frente a la complejidad de otra vía.
 */
export function useWatchProgress({ videoRef, accountId, profileId, anime, episodeNumber, enabled }) {
  const savedProgressRef = useRef(null)
  const hasResumedRef = useRef(false)

  useEffect(() => {
    hasResumedRef.current = false
    savedProgressRef.current = null
  }, [anime?.id, episodeNumber])

  const save = useCallback(() => {
    const video = videoRef.current
    if (!enabled || !video || !accountId || !profileId || !anime) return
    if (!video.currentTime) return
    upsertProgress(accountId, profileId, {
      malId: anime.id,
      episodeNumber: Number(episodeNumber),
      secondsWatched: Math.floor(video.currentTime),
      durationSeconds: video.duration ? Math.floor(video.duration) : null,
      title: anime.title,
      poster: anime.poster,
    }).catch(() => {
      // Best-effort: no bloquea la reproducción si Supabase falla.
    })
  }, [videoRef, enabled, accountId, profileId, anime, episodeNumber])

  // Trae el progreso guardado antes de que el video termine de cargar.
  useEffect(() => {
    if (!enabled || !profileId || !anime) return
    let cancelled = false
    getProgress(profileId, anime.id, Number(episodeNumber))
      .then((progress) => {
        if (!cancelled) savedProgressRef.current = progress
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [enabled, profileId, anime, episodeNumber])

  // Reanuda una sola vez, cuando el video ya sabe su duración real.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !enabled) return

    function handleLoadedMetadata() {
      if (hasResumedRef.current) return
      hasResumedRef.current = true
      const saved = savedProgressRef.current
      if (!saved?.secondsWatched) return
      if (saved.secondsWatched < video.duration - RESUME_SKIP_TAIL_SECONDS) {
        video.currentTime = saved.secondsWatched
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
  }, [videoRef, enabled])

  useEffect(() => {
    if (!enabled) return
    const video = videoRef.current
    if (!video) return
    const interval = setInterval(() => {
      if (!video.paused) save()
    }, SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [enabled, videoRef, save])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !enabled) return

    function handlePause() {
      save()
    }
    function handleVisibility() {
      if (document.visibilityState === 'hidden') save()
    }

    video.addEventListener('pause', handlePause)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      video.removeEventListener('pause', handlePause)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [videoRef, enabled, save])

  return { save }
}
