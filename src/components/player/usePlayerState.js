import { useCallback, useEffect, useState } from 'react'

export const PLAYBACK_RATE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * Estado y controles del reproductor sobre el `<video>` nativo — play/
 * pause, seek, volumen, velocidad, fullscreen, Picture-in-Picture. Sin
 * librería de player: cada fuente de AnimeThemes es un `.webm` estático de
 * una sola resolución (sin manifiesto que manejar), así que lo único que
 * hace falta es API nativa del navegador (ver CLAUDE.md, "Sistema de
 * reproducción", para la decisión completa de no usar video.js/plyr).
 */
export function usePlayerState(videoRef) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [buffering, setBuffering] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration || 0)
    const onProgress = () => {
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1))
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onVolumeChange = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }
    const onWaiting = () => setBuffering(true)
    const onPlaying = () => setBuffering(false)
    const onCanPlay = () => setBuffering(false)
    const onEnterPiP = () => setIsPiP(true)
    const onLeavePiP = () => setIsPiP(false)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('loadedmetadata', onDurationChange)
    video.addEventListener('progress', onProgress)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('volumechange', onVolumeChange)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('enterpictureinpicture', onEnterPiP)
    video.addEventListener('leavepictureinpicture', onLeavePiP)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('loadedmetadata', onDurationChange)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('volumechange', onVolumeChange)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('enterpictureinpicture', onEnterPiP)
      video.removeEventListener('leavepictureinpicture', onLeavePiP)
    }
  }, [videoRef])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }, [videoRef])

  const seek = useCallback(
    (time) => {
      const video = videoRef.current
      if (!video) return
      video.currentTime = Math.max(0, Math.min(time, video.duration || time))
    },
    [videoRef],
  )

  const seekBy = useCallback(
    (deltaSeconds) => {
      const video = videoRef.current
      if (!video) return
      seek(video.currentTime + deltaSeconds)
    },
    [seek, videoRef],
  )

  const setVolumeLevel = useCallback(
    (level) => {
      const video = videoRef.current
      if (!video) return
      const clamped = Math.max(0, Math.min(1, level))
      video.volume = clamped
      if (clamped > 0) video.muted = false
    },
    [videoRef],
  )

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }, [videoRef])

  const setPlaybackRate = useCallback(
    (rate) => {
      const video = videoRef.current
      if (!video) return
      video.playbackRate = rate
      setPlaybackRateState(rate)
    },
    [videoRef],
  )

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.closest('[data-player-root]')
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen?.()
    }
  }, [videoRef])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture()
      }
    } catch {
      // PiP no soportado o rechazado por el navegador — el botón
      // simplemente no tiene efecto, sin romper el resto del reproductor.
    }
  }, [videoRef])

  return {
    playing,
    currentTime,
    duration,
    buffered,
    volume,
    muted,
    playbackRate,
    isFullscreen,
    isPiP,
    buffering,
    togglePlay,
    seek,
    seekBy,
    setVolumeLevel,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    togglePiP,
  }
}
