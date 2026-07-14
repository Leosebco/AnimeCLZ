// "Búsquedas recientes" de la pantalla /buscar (v1.7, por perfil desde
// v2.4) — en localStorage, no en Supabase: /buscar es una ruta pública, no
// exige sesión, así que atarlas solo a una cuenta dejaría afuera a
// cualquier visitante sin login. Mismo criterio ya usado por
// `ThemeContext` (`animeclz:theme:guest`): con perfil activo, la clave se
// escopa a `profileId` (pedido explícito v2.4: "nunca compartir entre
// perfiles", igual que favoritos/historial/Mi Lista); sin perfil activo
// (visitante anónimo), cae a una clave `guest` compartida — sigue
// funcionando para quien no inició sesión, en vez de perder la función.
const MAX_ENTRIES = 15

function storageKey(profileId) {
  return `animeclz:recentSearches:${profileId || 'guest'}`
}

export function getRecentSearches(profileId) {
  try {
    const raw = localStorage.getItem(storageKey(profileId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentSearch(term, profileId) {
  const trimmed = term.trim()
  if (!trimmed) return getRecentSearches(profileId)
  try {
    const withoutDuplicate = getRecentSearches(profileId).filter(
      (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
    )
    // Más reciente primero; al superar MAX_ENTRIES se descarta la más
    // antigua (la última del array) automáticamente vía `slice`.
    const next = [trimmed, ...withoutDuplicate].slice(0, MAX_ENTRIES)
    localStorage.setItem(storageKey(profileId), JSON.stringify(next))
    return next
  } catch {
    return getRecentSearches(profileId)
  }
}

export function clearRecentSearches(profileId) {
  try {
    localStorage.removeItem(storageKey(profileId))
  } catch {
    // no-op — localStorage puede no estar disponible (modo privado, etc.)
  }
}
