import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlayerControls from './PlayerControls'
import NextEpisodeOverlay from './NextEpisodeOverlay'
import { usePlayerState } from './usePlayerState'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { useWatchProgress } from './useWatchProgress'
import { watchPath } from '@/constants'

const CONTROLS_HIDE_DELAY_MS = 3000

/**
 * Reproductor completo — `<video>` nativo + controles hechos a mano (ver
 * CLAUDE.md, "Sistema de reproducción", para por qué no se usa una
 * librería de player). Gestos táctiles acotados a esta superficie
 * (`[touch-action:none]`, mismo criterio de scoping que ya usa
 * `MovieRow.jsx`, nunca global).
 */
function VideoPlayer({
  anime,
  episode,
  episodeNumber,
  sources,
  subtitleLanguages,
  accountId,
  profileId,
  autoplayEnabled,
  totalEpisodes,
}) {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.id ?? null)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [locked, setLocked] = useState(false)
  const [showNextOverlay, setShowNextOverlay] = useState(false)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    setSelectedSourceId(sources[0]?.id ?? null)
    setShowNextOverlay(false)
  }, [sources])

  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources[0] ?? null
  const player = usePlayerState(videoRef)

  useWatchProgress({
    videoRef,
    accountId,
    profileId,
    anime,
    episodeNumber,
    enabled: Boolean(accountId && profileId),
  })

  const hasPrevEpisode = Number(episodeNumber) > 1
  const hasNextEpisode = totalEpisodes ? Number(episodeNumber) < totalEpisodes : true

  const goToEpisode = (number) => navigate(watchPath(anime.id, number))

  useKeyboardShortcuts({
    enabled: true,
    isFullscreen: player.isFullscreen,
    onTogglePlay: player.togglePlay,
    onSeekBy: player.seekBy,
    onVolumeBy: (delta) => player.setVolumeLevel(player.volume + delta),
    onToggleFullscreen: player.toggleFullscreen,
    onToggleMute: player.toggleMute,
    onExit: () => navigate(-1),
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    function handleEnded() {
      if (hasNextEpisode && autoplayEnabled) setShowNextOverlay(true)
    }
    video.addEventListener('ended', handleEnded)
    return () => video.removeEventListener('ended', handleEnded)
  }, [hasNextEpisode, autoplayEnabled])

  useEffect(() => {
    if (locked) return
    if (!player.playing) {
      setControlsVisible(true)
      clearTimeout(hideTimerRef.current)
      return
    }
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS)
    return () => clearTimeout(hideTimerRef.current)
  }, [player.playing, player.currentTime, locked])

  const handleSurfaceClick = () => {
    if (locked) return
    setControlsVisible((visible) => !visible)
  }

  return (
    <div
      data-player-root
      className="relative flex h-[100dvh] w-full items-center justify-center bg-black [touch-action:none] [overscroll-behavior:contain]"
      onClick={handleSurfaceClick}
    >
      <video
        ref={videoRef}
        src={selectedSource?.url}
        autoPlay
        playsInline
        className="h-full w-full object-contain"
      />

      {player.buffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-primary" />
        </div>
      )}

      <PlayerControls
        visible={controlsVisible}
        player={player}
        sources={sources}
        selectedSourceId={selectedSource?.id}
        onSourceChange={setSelectedSourceId}
        subtitleLanguages={subtitleLanguages}
        backHref={`/anime/${anime.id}`}
        title={`${anime.title} — Episodio ${episodeNumber}${episode?.title ? `: ${episode.title}` : ''}`}
        onPrevEpisode={() => goToEpisode(Number(episodeNumber) - 1)}
        onNextEpisode={() => goToEpisode(Number(episodeNumber) + 1)}
        hasPrevEpisode={hasPrevEpisode}
        hasNextEpisode={hasNextEpisode}
        locked={locked}
        onToggleLock={() => setLocked((value) => !value)}
      />

      <NextEpisodeOverlay
        visible={showNextOverlay}
        nextEpisodeLabel={`Episodio ${Number(episodeNumber) + 1}`}
        onConfirm={() => goToEpisode(Number(episodeNumber) + 1)}
        onCancel={() => setShowNextOverlay(false)}
      />
    </div>
  )
}

export default VideoPlayer
