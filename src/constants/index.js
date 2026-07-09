// Centralized route paths. Every Link, <Route>, and redirect in the app
// should import from here instead of hardcoding strings, so a path only
// ever changes in one place.
export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explorar',
  SEASON: '/temporada',
  TOP: '/top',
  MY_LIST: '/mi-lista',
  SEARCH: '/buscar',
  PROFILE: '/perfil',
  ANIME_DETAIL: '/anime/:id',
}

export function animeDetailPath(id) {
  return `/anime/${id}`
}

// Primary navigation, consumed by the Navbar. Kept as data (not JSX) so
// it can be reused for mobile menus, breadcrumbs, or sitemaps later.
export const NAV_LINKS = [
  { label: 'Inicio', path: ROUTES.HOME },
  { label: 'Explorar', path: ROUTES.EXPLORE },
  { label: 'Temporada', path: ROUTES.SEASON },
  { label: 'Top', path: ROUTES.TOP },
  { label: 'Mi Lista', path: ROUTES.MY_LIST },
]

export const FOOTER_LINKS = {
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Newsroom', path: '/newsroom' },
  ],
  Support: [
    { label: 'Help Center', path: '/help' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Device Support', path: '/devices' },
  ],
  Legal: [
    { label: 'Terms of Use', path: '/terms' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Cookie Preferences', path: '/cookies' },
  ],
}

// Stable MyAnimeList / Jikan genre ids — used by the catalog filters and by
// the fixed genre-based Home sections. Only the ids AnimeCLZ actively uses
// as dedicated Home sections get a named shortcut below.
export const GENRES = [
  { id: 1, label: 'Acción' },
  { id: 2, label: 'Aventura' },
  { id: 4, label: 'Comedia' },
  { id: 8, label: 'Drama' },
  { id: 10, label: 'Fantasía' },
  { id: 14, label: 'Terror' },
  { id: 7, label: 'Misterio' },
  { id: 22, label: 'Romance' },
  { id: 24, label: 'Sci-Fi' },
  { id: 36, label: 'Slice of Life' },
  { id: 30, label: 'Deportes' },
  { id: 37, label: 'Sobrenatural' },
  { id: 41, label: 'Suspenso' },
  { id: 18, label: 'Mecha' },
  { id: 19, label: 'Música' },
]

export const FEATURED_GENRE_IDS = {
  romance: 22,
  action: 1,
  comedy: 4,
  horror: 14,
}

export const ANIME_TYPES = [
  { value: 'tv', label: 'TV' },
  { value: 'movie', label: 'Película' },
  { value: 'ova', label: 'OVA' },
  { value: 'special', label: 'Especial' },
  { value: 'ona', label: 'ONA' },
  { value: 'music', label: 'Música' },
]

// Jikan relation labels ("Prequel", "Side story"...) translated for display
// in AnimeDetail's "Relacionados" section. Falls back to the raw label for
// any relation type not listed here (still real data, just untranslated).
export const RELATION_LABELS = {
  Prequel: 'Precuela',
  Sequel: 'Secuela',
  'Side story': 'Historia paralela',
  'Spin-off': 'Spin-off',
  'Alternative version': 'Versión alternativa',
  'Alternative setting': 'Ambientación alternativa',
  'Full story': 'Historia completa',
  Summary: 'Resumen',
  Adaptation: 'Adaptación',
  Character: 'Personaje',
  Other: 'Otro',
  'Parent story': 'Historia principal',
}

// Jikan's raw status strings, translated for display on the Hero and
// AnimeCard (falls back to the raw value for anything not listed here).
export const STATUS_LABELS = {
  'Currently Airing': 'En emisión',
  'Finished Airing': 'Finalizada',
  'Not yet aired': 'Próximamente',
}

export const ORDER_OPTIONS = [
  { value: 'popularity', label: 'Popularidad', orderBy: 'popularity', sort: 'asc' },
  { value: 'score', label: 'Puntuación', orderBy: 'score', sort: 'desc' },
  { value: 'title', label: 'Título (A-Z)', orderBy: 'title', sort: 'asc' },
  { value: 'newest', label: 'Más recientes', orderBy: 'start_date', sort: 'desc' },
]
