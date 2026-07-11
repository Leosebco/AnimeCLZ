// "Búsquedas recientes" de la pantalla /buscar (v1.7) — en localStorage,
// no en Supabase: /buscar es una ruta pública, no exige sesión, así que
// atarlas a una cuenta dejaría afuera a cualquier visitante sin login.
const STORAGE_KEY = 'animeclz:recentSearches'
const MAX_ENTRIES = 8

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentSearch(term) {
  const trimmed = term.trim()
  if (!trimmed) return getRecentSearches()
  try {
    const withoutDuplicate = getRecentSearches().filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())
    const next = [trimmed, ...withoutDuplicate].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    return getRecentSearches()
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op — localStorage puede no estar disponible (modo privado, etc.)
  }
}
