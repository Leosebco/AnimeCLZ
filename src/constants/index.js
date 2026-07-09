// Centralized route paths. Every Link, <Route>, and redirect in the app
// should import from here instead of hardcoding strings, so a path only
// ever changes in one place.
export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explorar',
  SEASON: '/temporada',
  TOP: '/top',
  MY_LIST: '/mi-lista',
  FAVORITES: '/favoritos',
  HISTORY: '/historial',
  SEARCH: '/buscar',
  PROFILE: '/perfil',
  PROFILE_SELECT: '/perfiles',
  SETTINGS: '/configuracion',
  ABOUT: '/acerca',
  ANIME_DETAIL: '/anime/:id',
  LOGIN: '/iniciar-sesion',
  REGISTER: '/crear-cuenta',
  FORGOT_PASSWORD: '/recuperar-contrasena',
  RESET_PASSWORD: '/restablecer-contrasena',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ANIMES: '/admin/animes',
  ADMIN_SEASONS: '/admin/temporadas',
  ADMIN_EPISODES: '/admin/episodios',
  ADMIN_CHARACTERS: '/admin/personajes',
  ADMIN_STUDIOS: '/admin/estudios',
  ADMIN_NEWS: '/admin/noticias',
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_COMMENTS: '/admin/comentarios',
  ADMIN_SETTINGS: '/admin/configuracion',
}

// Mismos valores de rol en dos lugares (columna `role` en `profiles` =
// cuenta, migración 0008; columna `rol` en `profiles_account` = perfil,
// migración 0009) — el rol que realmente controla el acceso al Panel de
// Administración es el del PERFIL activo (ver ProtectedRoute + useProfile),
// no el de la cuenta. "usuario" es el rol por defecto de cualquier perfil
// nuevo y no tiene acceso al panel; los otros tres sí (ver STAFF_ROLES).
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  MODERATOR: 'moderador',
  USER: 'usuario',
}

export const ROLE_LABELS = {
  admin: 'Administrador',
  editor: 'Editor',
  moderador: 'Moderador',
  usuario: 'Usuario',
}

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.EDITOR, ROLES.MODERATOR]

// Paleta acotada para el color de un perfil (círculo/avatar de iniciales) —
// todos son variantes de la paleta oficial de marca (ver DESIGN.md), nunca
// rojo/amarillo/naranja.
export const PROFILE_COLORS = [
  '#4F8CFF', // Primary
  '#7C5CFF', // Secondary
  '#22C55E',
  '#06B6D4',
  '#EC4899',
  '#14B8A6',
]

// tipo_avatar de profiles_account.
export const AVATAR_TYPES = {
  INITIAL: 'inicial',
  UPLOAD: 'subida',
  CHARACTER: 'personaje',
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
]

// Reemplaza los links de relleno (en inglés, a rutas que no existían) por
// anclas reales dentro de /acerca — cada sección de esa página tiene un
// id que coincide con el hash de abajo (ver About.jsx).
export const FOOTER_LINKS = {
  AnimeCLZ: [
    { label: 'Acerca de', path: `${ROUTES.ABOUT}` },
    { label: 'Tecnologías', path: `${ROUTES.ABOUT}#tecnologias` },
    { label: 'Preguntas frecuentes', path: `${ROUTES.ABOUT}#preguntas-frecuentes` },
  ],
  Soporte: [
    { label: 'Contacto', path: `${ROUTES.ABOUT}#contacto` },
  ],
  Legal: [
    { label: 'Términos y condiciones', path: `${ROUTES.ABOUT}#terminos` },
    { label: 'Política de privacidad', path: `${ROUTES.ABOUT}#privacidad` },
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

// Jikan's `status` search param (distinct from the raw per-anime `status`
// field in STATUS_LABELS above, which uses different string values).
export const ANIME_STATUS = [
  { value: 'airing', label: 'En emisión' },
  { value: 'complete', label: 'Finalizado' },
  { value: 'upcoming', label: 'Próximamente' },
]

// Jikan's `min_score` search param (0-10 scale).
export const MIN_SCORE_OPTIONS = [
  { value: '9', label: '9+' },
  { value: '8', label: '8+' },
  { value: '7', label: '7+' },
  { value: '6', label: '6+' },
]
