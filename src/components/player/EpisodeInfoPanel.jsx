import InfoGrid from '@/components/anime/InfoGrid'

/**
 * "Información del episodio" — reusa `InfoGrid` ya existente (mismo
 * componente que la sección "Información" de `AnimeDetail.jsx`), sin
 * inventar un panel nuevo. Combina metadatos reales de Jikan/AniList
 * (número/título/fecha del episodio) con lo que devuelve
 * `PlaybackProviderManager.getSources().info` (p. ej., para AnimeThemes:
 * qué tema/canción es el clip que se está reproduciendo).
 */
function EpisodeInfoPanel({ anime, episode, sourcesInfo }) {
  const themeLines = (sourcesInfo || []).flatMap((entry) => entry.themes || [])

  return (
    <div className="space-y-4">
      <InfoGrid
        items={[
          { label: 'Anime', value: anime?.title },
          { label: 'Episodio', value: episode?.number },
          { label: 'Título', value: episode?.title },
          { label: 'Duración', value: anime?.duration },
          {
            label: 'Emitido',
            value: episode?.aired
              ? new Date(episode.aired).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
              : null,
          },
        ]}
      />
      {themeLines.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Reproduciendo</h3>
          <ul className="space-y-1 text-sm text-text">
            {themeLines.map((theme, index) => (
              <li key={`${theme.slug}-${index}`}>
                {theme.type === 'OP' ? 'Opening' : 'Ending'} {theme.songTitle ? `— ${theme.songTitle}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default EpisodeInfoPanel
