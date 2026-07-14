import { useEffect } from 'react'

function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable
}

/**
 * Atajos de teclado del reproductor (Espacio/←→/↑↓/F/M/Esc) — único
 * precedente en el proyecto: el Escape-to-close de `NavbarSearch.jsx`,
 * generalizado acá. Activo solo mientras el llamador lo marque `enabled`
 * (la página `Watch.jsx` lo desactiva al desmontar); ignora teclas si el
 * foco está en un input/textarea.
 */
export function useKeyboardShortcuts({
  enabled = true,
  isFullscreen,
  onTogglePlay,
  onSeekBy,
  onVolumeBy,
  onToggleFullscreen,
  onToggleMute,
  onExit,
}) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event) {
      if (isTypingTarget(document.activeElement)) return

      switch (event.key) {
        case ' ':
        case 'Spacebar':
          event.preventDefault()
          onTogglePlay?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          onSeekBy?.(10)
          break
        case 'ArrowLeft':
          event.preventDefault()
          onSeekBy?.(-10)
          break
        case 'ArrowUp':
          event.preventDefault()
          onVolumeBy?.(0.1)
          break
        case 'ArrowDown':
          event.preventDefault()
          onVolumeBy?.(-0.1)
          break
        case 'f':
        case 'F':
          onToggleFullscreen?.()
          break
        case 'm':
        case 'M':
          onToggleMute?.()
          break
        case 'Escape':
          // Si está en fullscreen, el navegador ya sale solo — no
          // duplicar esa salida ni además navegar hacia atrás en el mismo
          // Escape.
          if (!isFullscreen) onExit?.()
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, isFullscreen, onTogglePlay, onSeekBy, onVolumeBy, onToggleFullscreen, onToggleMute, onExit])
}
