/**
 * Parsea el campo `episodes` de una entrada de AnimeThemes (p. ej.
 * `"1-25"`, `"104"`, `"1-25,27"`) a una lista de rangos numéricos
 * `{from, to}`. Devuelve `null` cuando el campo es `null`/vacío — "no hay
 * rango declarado", nunca lo confunde con "cero episodios".
 */
export function parseEpisodesLabel(label) {
  if (!label) return null

  const segments = String(label)
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)

  const ranges = segments
    .map((segment) => {
      const [fromRaw, toRaw] = segment.split('-').map((part) => part.trim())
      const from = Number(fromRaw)
      const to = toRaw !== undefined && toRaw !== '' ? Number(toRaw) : from
      if (!Number.isFinite(from) || !Number.isFinite(to)) return null
      return { from, to }
    })
    .filter(Boolean)

  return ranges.length ? ranges : null
}

function rangesContain(ranges, episodeNumber) {
  return ranges.some(({ from, to }) => episodeNumber >= from && episodeNumber <= to)
}

/**
 * Decide, para un tema (OP1/ED2/...) y sus entradas (versiones/cortes),
 * cuáles son elegibles para matchear por número de episodio.
 *
 * Verificado contra datos reales de AnimeThemes (Naruto, OP4): la versión 1
 * declara `episodes: "78-103"`; la versión 2 (un re-corte sin créditos, en
 * BD) declara `episodes: null`. Regla: si AL MENOS una entrada del tema
 * tiene un rango real, las entradas `null` de ese mismo tema quedan
 * EXCLUIDAS del match — son un recorte alternativo del rango ya declarado
 * en otra versión, no "aplica a todos los episodios" (afirmar eso sería un
 * dato que AnimeThemes nunca declaró). Si TODAS las entradas del tema son
 * `null` (películas/OVAs sin backfill de rango), se aceptan como "cubre
 * toda la serie" — únicamente por ausencia de mejor información, no por
 * default.
 */
export function resolveEligibleEntries(entries) {
  const hasRealRange = entries.some((entry) => parseEpisodesLabel(entry.episodesLabel) !== null)
  if (!hasRealRange) return entries
  return entries.filter((entry) => parseEpisodesLabel(entry.episodesLabel) !== null)
}

/**
 * Para un catálogo completo (array de temas, cada uno con sus entradas) y
 * un número de episodio, devuelve los pares `{theme, entry}` que cubren
 * ese episodio — usado tanto para el badge "reproducible" en la grilla de
 * `AnimeDetail.jsx` como por `AnimeThemesProvider.getSources()`.
 */
export function resolveEpisodeCoverage(themes, episodeNumber) {
  const matches = []
  for (const theme of themes) {
    const eligible = resolveEligibleEntries(theme.entries)
    for (const entry of eligible) {
      const ranges = parseEpisodesLabel(entry.episodesLabel)
      const covers = ranges === null ? true : rangesContain(ranges, episodeNumber)
      if (covers) matches.push({ theme, entry })
    }
  }
  return matches
}
