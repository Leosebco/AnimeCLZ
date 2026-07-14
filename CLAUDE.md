# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Esta es la guía oficial del proyecto AnimeCLZ. Las reglas de esta sección se siguen en todo el desarrollo,
no solo en la sesión en que se definieron.

## Identidad

El proyecto se llama **AnimeCLZ**. El nombre "StreamFlix" no debe volver a usarse en ninguna parte:
logo, título, README, favicon, metadata, componentes ni texto visible. (Estado actual: `index.html` y
`README.md` ya usan "AnimeCLZ"; no se encontraron referencias a "StreamFlix" en `src/`. Si aparece alguna
en el futuro — nuevo componente, asset, commit copiado — debe corregirse antes de continuar.)

## Objetivo

AnimeCLZ es una plataforma de streaming de anime pensada para:

- Portafolio profesional.
- Aprender React en profundidad.
- Practicar arquitectura de frontend real.
- Convertirse en un producto/negocio real a futuro.

El código debe sentirse como el de un producto comercial listo para seguir creciendo, no como una prueba
de concepto.

## Diseño

Inspiración: Apple TV, AniList, Arc Browser, Notion, algunas ideas de Crunchyroll — sin copiar a ninguna,
y explícitamente **sin parecerse a Netflix**. AnimeCLZ debe tener identidad visual propia.

Paleta oficial (v0.8 — reemplaza la paleta del Sprint 3.5; ya migrada en `src/styles/index.css`, token
real: `--color-*`):

| Token | Valor |
|---|---|
| Background | `#07111F` |
| Surface | `#0F172A` |
| Card | `#162033` |
| Hover | `#1E2D47` |
| Border | `rgba(255,255,255,.08)` |
| Primary | `#4F8CFF` |
| Primary Hover | `#6AA5FF` |
| Secondary | `#7C5CFF` |
| Text | `#FFFFFF` |
| Text Secondary | `#C5D0E6` |
| Error | `#F87171` (solo para estados de error, nunca decorativo) |

Prohibido como color de marca: **rojo**, amarillo, naranja. `Secondary` es azul-violeta (más "indigo" que
azul puro) — es la única excepción a "no morado", y deliberadamente reservada a acentos puntuales
(`.brand-gradient-bg`, alguna insignia), nunca al botón `primary` ni a fondos grandes, para que no
termine leyéndose como un segundo color de marca. Gradientes solo muy suaves — nunca como fondo de
pantalla completo.

Requisitos transversales: animaciones suaves con Framer Motion, Tailwind limpio (sin clases redundantes
o contradictorias), diseño responsive y accesibilidad (foco visible, contraste, roles/aria donde aplique).

## Arquitectura

Estructura de carpetas a mantener (no aplanar ni reorganizar sin acuerdo explícito):

`components/`, `pages/`, `hooks/`, `services/`, `router/`, `layout/`, `utils/`, `context/`, `constants/`.

- `components/ui/` — primitivas agnósticas del dominio; si un componente "sabe" qué es un anime, no va aquí.
- `layout/` — shell fijo de la app (Navbar, Footer, Layout) montado vía `<Outlet />`.
  `layout/admin/` (AdminLayout/AdminSidebar/AdminHeader) es el shell del Panel de Administración —
  completamente separado del anterior, sin Navbar/Footer públicos.
- `pages/` — un archivo por ruta.
- `router/` — `AppRouter.jsx` es la única fuente de verdad de rutas; toda ruta se referencia como
  `ROUTES.*` desde `constants/`, nunca como string hardcodeado.
- `services/` — única capa que habla con APIs externas (Jikan, ver sección API) y con Supabase (ver
  sección Autenticación); los componentes nunca llaman a `axios`/`jikan`/`supabase` directamente.
- `providers/` (v1.3) — capa desacoplada de proveedores de catálogo, por encima de `services/`. Ver
  sección API para el detalle; en corto: las páginas importan de `providers/AnimeProvider.js`, nunca de
  `services/animeService.js` ni de un proveedor concreto directamente.
- `hooks/` — `useFetch` es el hook de datos genérico (AbortController + caché + retry) que usa toda la
  app; `useDebounce` para inputs (buscador). No crear un hook de fetch nuevo por página: parametrizar
  `useFetch` con la función de servicio correspondiente.
- `context/` — `AuthContext` (sesión de Supabase, ver sección Autenticación) es la fuente única de verdad
  de la CUENTA; `ProfileContext` (v1.1) es la fuente única de verdad del PERFIL activo dentro de esa
  cuenta (ver "Perfiles múltiples" más abajo) — no confundir los dos. `FavoritesContext` ("Favoritos",
  tabla `favorites`) y `WatchLaterContext` ("Mi Lista", tabla `watch_later`) son dos listas persistidas en
  Supabase, cada una por su propio hook (`useFavorites()`/`useWatchLater()`) — los componentes nunca
  llaman a Supabase directamente, ni leen `localStorage` directamente (salvo `ProfileContext`, que sí lo
  usa para recordar el último perfil elegido — ver más abajo).
- `constants/` — rutas y datos de navegación; el resto de la app importa desde aquí en vez de duplicar.
- `utils/` — helpers puros (p. ej. `cn.js`, merge de clases con `clsx` + `tailwind-merge`).

No duplicar código ni componentes: siempre buscar y reutilizar antes de crear uno nuevo.

Alias `@` → `src/` (configurado en `vite.config.js` y `jsconfig.json`) — importar con `@/...` entre
carpetas, no con rutas relativas profundas.

Estilos: Tailwind v4 se configura enteramente en CSS vía el bloque `@theme` de `src/styles/index.css` —
no existe `tailwind.config.js`. Los tokens de diseño (colores, `font-display`/`font-body` — solo dos
familias, no hay mono) viven ahí; se reutilizan en vez de hardcodear valores.

## API

**Arquitectura de proveedores (v1.3) — fachada de catálogo, sigue siendo la que usan la mayoría de las
páginas hoy:** ninguna página/componente debe importar `services/animeService.js` directamente — siempre
importan desde `providers/AnimeProvider.js`, el punto de entrada de datos de anime para las páginas de
catálogo todavía no migradas al Provider Engine (Home, Explore, Search, Top, Season, Landing,
admin/Animes, admin/Seasons — 8 páginas). **`AnimeDetail.jsx` ya NO está en esta lista desde v2.0** — fue
la primera página migrada al `ProviderManager.js` nuevo, ver más abajo.
- `providers/AnimeProvider.js` es, desde v1.9, `export * from '@/services/animeService'` directo — 100%
  Jikan, sin cambios de comportamiento. (Hasta v1.9 pasaba por `providers/jikan/JikanProvider.js`, un
  `export *` intermedio sin transformar nada; ese archivo ahora es otra cosa, ver más abajo — el import se
  saltó ese salto para no arrastrar el cambio de contrato de `JikanProvider.js` hacia esta fachada.)
- **No confundir con `api/anilist.js` (v1.6)**: cliente GraphQL real, usado por `services/searchService.js`/
  `characterSearchService.js`/`avatarSearchService.js` (buscador global y de avatares, ver más abajo) Y
  por `providers/anilist/AniListProvider.js` (Provider Engine, v1.9, ver esa sección) — dos consumidores
  distintos del mismo cliente, con queries propias cada uno (deliberado, no duplicado por descuido — ver
  v1.9). `searchService.js`/`characterSearchService.js`/`avatarSearchService.js` importan
  `animeService.js`/`api/jikan.js`/`api/anilist.js` directamente, sin pasar por `AnimeProvider.js` —
  excepción deliberada: son orquestadores de búsqueda cruzada entre fuentes, no navegación de catálogo.
- Cualquier función nueva de catálogo se agrega en `animeService.js` (mismo lugar de siempre) y queda
  re-exportada automáticamente a través de `AnimeProvider.js`.

**Provider Engine (v1.9, conectado por primera vez en v2.0) — motor nuevo, multi-proveedor:**
`providers/ProviderManager.js` es un segundo punto de entrada, con una interfaz más chica y distinta
(`search/getAnime/getEpisodes/getCharacters/getRelations/getRecommendations/getGallery` — 7 métodos, no
los ~21 de `AnimeProvider.js`), que consulta **varios** proveedores (AniList primero, Jikan de respaldo/
complemento) en vez de uno solo. **`AnimeDetail.jsx` es la primera página conectada** (sus 6 secciones
dependientes de un id de anime) — el resto de páginas de catálogo (Home/Explore/Search/Top/Season/
Landing/admin) siguen en `AnimeProvider.js`, ver esa sección arriba y la entrada v2.0 en Notas técnicas
para por qué se migró en pasos. `providers/jikan/JikanProvider.js` y `providers/anilist/AniListProvider.js`
dejaron de ser lo que describía v1.3 arriba (el primero era el re-export activo de `AnimeProvider.js`; el
segundo un stub) — ahora son los adaptadores de 7 métodos que usa `ProviderManager.js`. `AniListProvider.js`
**ya no es un stub**: tiene una implementación real (5 de 7 métodos; `getEpisodes`/`getGallery` son
no-ops deliberados, AniList no tiene listado de episodios ni galería de imágenes en su schema público)
sobre `api/anilist.js`. `providers/tmdb/TMDBProvider.js` sigue siendo un stub (`createStubProvider`),
solo con el contrato actualizado a los mismos 7 métodos — no completar su implementación sin que se pida.

**`getAnime()` — 4 campos nuevos en v2.7 (Media Hub), sin método nuevo ni llamada nueva:** `staff`,
`officialLinks`, `streamingPlatforms` y `studioLinks` se agregaron a la MISMA query GraphQL que
`AniListProvider.getAnime()` ya hacía (`staff`/`externalLinks`/`studios(isMain:true).siteUrl` sumados al
`ANIME_QUERY` existente) — cero round-trips adicionales, ver la entrada v2.7 en Notas técnicas para el
detalle completo. Los 4 son exclusivos de AniList hoy (Jikan tiene
endpoints reales para staff/enlaces —`/anime/{id}/staff`, `/anime/{id}/external`— pero conectarlos
implicaría 2 llamadas nuevas por página que AniList ya cubre gratis en el mismo `getAnime()`; `JikanProvider.js`
no se tocó) — `mergeAnimeFields` ya trata una clave ausente en el lado de Jikan como vacía, así que el
merge funciona sin declarar explícitamente `staff: []` etc. del lado Jikan.

Usar únicamente **Jikan API** (`src/api/jikan.js`, baseURL `https://api.jikan.moe/v4`) como fuente de
datos — hoy el único proveedor real detrás de `AnimeProvider`. Nunca inventar información de animes
(títulos, ratings, sinopsis, etc.) — todo dato mostrado debe venir de la respuesta real de la API.
`animeService.js` mapea toda respuesta al modelo canónico único (`mapAnime`) y expone funciones que ya
devuelven `{ data, pagination }` de forma consistente — no crear una función de servicio que devuelva
una forma distinta.

**Sinopsis en español (v1.3):** `animeService.js` puede mostrar una sinopsis en español almacenada en
Supabase (tabla `anime_synopsis_es`, migración 0012) en vez de la original de Jikan, vía
`overlaySpanishSynopsis()` — aplicado en `fetchList`/`getAnimeById`. Nunca se traduce en tiempo real; la
tabla se puebla desde un futuro importador (no implementado todavía), así que hoy esto es, en la
práctica, casi siempre un no-op. No agregar una llamada de traducción en vivo aquí.

Jikan es una API pública sin key, con límite de tasa y caídas 5xx/timeout intermitentes bajo carga
(observado empíricamente, y confirmado independientemente con `curl` fuera de la app varias veces —
incluyendo durante v2.0, ver esa entrada en Notas técnicas para el detalle: `/anime/20/episodes` tardó
11s y devolvió 500 en pleno desarrollo de ese sprint). Mitigaciones ya implementadas — no las quites:
- `api/jikan.js` reintenta automáticamente (con backoff exponencial capado a 3s, 4 intentos) respuestas
  429, 5xx, **y timeouts de cliente** (`error.code === 'ECONNABORTED'`, agregado en v2.0 — antes un
  backend lento-y-después-caído se rendía al primer intento sin reintentar, porque un timeout no tiene
  `error.response.status` y el chequeo viejo solo miraba eso).
- `useFetch` cachea resultados por `cacheKey` (TTL configurable) y soporta `initialDelay` (ya no usado
  activamente desde que la cola de `api/jikan.js` centraliza el espaciado, pero se deja disponible).
- `animeService.js` deduplica por `id` cualquier lista antes de devolverla (Jikan repite `mal_id` bajo
  carga).
- `discoverAnime`/`searchAnime` **no fuerzan `order_by`/`sort` por defecto** en una búsqueda por texto —
  ordenar añade carga evitable al backend de búsqueda de MAL y no aporta nada (la relevancia, que Jikan
  ya usa por defecto, es lo que una búsqueda por nombre necesita). Solo Explorar/Temporada/Top —que no
  tienen `q`— aplican un orden por defecto. No reintroducir un `orderBy`/`sort` por defecto en `Buscar`.
- `ErrorState` siempre muestra un mensaje amable + botón "Reintentar", nunca una pantalla en blanco —
  esto aplica a cualquier fetch nuevo que se agregue (Home, catálogo, Detalle, Buscar). Los mensajes
  nunca mencionan "MyAnimeList" ni "Jikan" — son genéricos ("no pudimos cargar esta sección", etc.).
- `api/jikan.js` (Sprint 3.6, reescrito en v2.0) encola **todas** las peticiones salientes por una cola
  de concurrencia propia (máx. 2 en simultáneo, ≥180ms entre inicios) antes de llegar a axios. Por eso
  `Home.jsx` y `AnimeDetail.jsx` ya **no** necesitan un `STAGGER_MS`/`initialDelay` manual por página —
  el espaciado entre peticiones es responsabilidad centralizada de `api/jikan.js`, no de cada página.
  **Bug real corregido en v2.0** (causa raíz de gran parte de los "servidor ocupado" reportados, ver esa
  entrada en Notas técnicas): la reserva de cupo tenía una condición de carrera (chequeaba el contador al
  encolar pero lo incrementaba recién dentro de un `setTimeout` futuro, sin volver a chequear) — bajo una
  ráfaga de peticiones simultáneas (exactamente lo que hacían/hacen `Home.jsx`/`AnimeDetail.jsx` al
  montarse, 6 `useFetch` cada uno) el límite de 2 quedaba completamente anulado. Ahora la reserva es
  síncrona (dentro del mismo `while` que despacha) — no reintroducir un `setTimeout` entre el chequeo del
  cupo y su incremento.
- Aun con estas mitigaciones, `/anime?q=` (búsqueda) puede fallar por completo durante minutos si el
  backend de búsqueda de MAL está degradado — esto es una limitación externa real, verificada varias
  veces con `curl` fuera de la app, no un bug de AnimeCLZ. No prometer 100% de disponibilidad de la
  búsqueda en la documentación ni en la UI.

## Autenticación y datos persistentes (Supabase)

Desde **v0.9**, AnimeCLZ tiene un backend real (Supabase) para todo lo que requiere usuario/persistencia
— Jikan sigue siendo, y sigue siéndolo, la única fuente de datos de animes (ver sección API). No mezclar:
Supabase nunca inventa ni cachea catálogo de anime, solo guarda relaciones "usuario ↔ anime" (favoritos,
mi lista, historial) y el perfil del usuario.

- `src/lib/supabase.js` crea el cliente con `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` (ver
  `.env.example`). Si esas variables no están definidas, `supabase` es `null` y `isSupabaseConfigured` es
  `false` — todo el código de auth/servicios lo comprueba antes de llamar al cliente, así que el resto de
  la app (catálogo, búsqueda, detalle) sigue funcionando sin backend configurado. **Nunca** importar ni
  usar la Secret Key de Supabase en el frontend — solo la Publishable/anon key, protegida por RLS.
- `context/AuthContext.jsx` + `hooks/useAuth.js` exponen `user`, `session`, `profile`, `loading`,
  `isAuthenticated` y los métodos de `services/authService.js` (`signInWithEmail`, `signUpWithEmail`,
  `signInWithGoogle`, `signOut`, `sendPasswordReset`, `updatePassword`). `persistSession`/
  `autoRefreshToken`/`detectSessionInUrl` ya están activados en el cliente — no reimplementar refresh
  manual.
- `layout/ProtectedRoute.jsx` protege `/mi-lista`, `/favoritos`, `/historial`, `/perfil`,
  `/configuracion` y `/admin/*` — sin sesión, redirige a `/iniciar-sesion` (guardando `location` en
  `state.from`); con sesión pero sin perfil activo elegido, redirige a `/perfiles` (ver "Perfiles
  múltiples" más abajo). `requireProfile={false}` (solo lo usa la propia ruta `/perfiles`) se salta ese
  segundo chequeo — si no, entrar ahí sin perfil activo (el caso normal) redirigiría en loop a sí misma.
  Acepta también un prop opcional `roles` (usado por `/admin/*`): si el ROL DEL PERFIL ACTIVO no está en
  esa lista, redirige a Inicio en vez de a Login (sí puede entrar al sitio, solo no a esa sección).
  Cualquier ruta nueva que dependa de sesión debe montarse dentro de este wrapper en `AppRouter.jsx`, no
  reinventar el guard. `layout/Layout.jsx` aplica el mismo redirect-a-`/perfiles` para toda ruta pública
  (Home, Explorar, etc.) — `/admin/*` vive fuera del `Layout` público, por eso `ProtectedRoute` repite
  ese chequeo en vez de depender solo de `Layout`.
- **Roles — dos niveles, no confundirlos:**
  - `profiles.role` (columna en la tabla de CUENTA, migración 0008/0013): **es lo que el Panel de
    Gestión de Usuarios edita** (`pages/admin/Users.jsx` → `adminService.updateUserRole`).
  - `profiles_account.rol` (columna en la tabla de PERFIL, migración 0009/0013): **es el que realmente
    controla el acceso al Panel de Administración** — `ProtectedRoute` con `roles={STAFF_ROLES}` lee
    `activeProfile.rol` (`useProfile()`), no `profile.role` de `useAuth()`.
  - Un trigger (`sync_default_profile_rol`, migración 0009) propaga automáticamente cualquier cambio en
    `profiles.role` al perfil predeterminado de esa cuenta — por eso editar el rol de una CUENTA desde
    el Panel de Gestión de Usuarios sí termina afectando el acceso real, sin tener que escribir en
    `profiles_account` por separado.
  - Valores compartidos: `admin`/`editor`/`moderador`/`usuario`, más `super_admin` desde v1.3
    (`constants/index.js`: `ROLES`/`ROLE_LABELS`/`STAFF_ROLES`/`ROLE_MANAGEMENT_ROLES`/`ASSIGNABLE_ROLES`).
  - Ninguno de los dos se acepta como parámetro de escritura libre desde el cliente en los servicios de
    perfil (`profileService.updateProfile`/`profilesAccountService.createProfile`/`updateProfile` nunca
    mandan `role`/`rol`) — el único camino de escritura de rol es `adminService.updateUserRole`, y solo
    lo puede ejecutar quien ya sea `super_admin`. Cada tabla tiene su propio trigger de protección
    (`protect_profile_role` / `protect_profile_account_rol`, reescritos en la migración 0013) que
    revierte/bloquea cualquier intento de cambiarlo si quien llama no es `super_admin`, y que además
    bloquea explícitamente cambiar el **propio** rol (para no perder acceso por accidente).
  - **Importante para quien escriba una migración futura que toque `role`/`rol`:** `auth.uid()` es
    `NULL` fuera de una sesión con JWT (migraciones vía `supabase db push`, SQL Editor) — verificado
    empíricamente. Los triggers de protección de rol solo aplican sus chequeos cuando
    `auth.uid() is not null`; una migración/SQL directo los atraviesa libremente (es un operador de
    confianza actuando fuera del cliente). Antes de la migración 0013 esto NO estaba así — un bug real
    que habría bloqueado incluso la propia elevación de la primera cuenta admin si se hubiera necesitado
    volver a ejecutar ese UPDATE.
  - **SUPER_ADMIN (v1.3):** único rol que puede cambiar el rol de otra cuenta (Panel de Gestión de
    Usuarios, dentro de `/admin/usuarios`) — ni siquiera `admin` puede. La cuenta `leoseb.co@gmail.com`
    se eleva automáticamente a `super_admin`: si ya existía, la migración 0013 la elevó directamente; si
    se registra en el futuro, `handle_new_user()` (reescrita en 0013) la crea así desde el principio. No
    hay una segunda cuenta hardcodeada en ningún otro lugar — ese es el único caso especial.
  - **Bug real de RLS encontrado en v1.0 (migraciones 0017/0018) — recordar para cualquier UPDATE/DELETE
    futuro "de staff sobre fila ajena":** un trigger `before update`/`before delete` NUNCA corre si la
    policy de RLS ya filtró la fila antes — un `GRANT` de tabla (migración 0011) tampoco alcanza, porque
    RLS sigue restringiendo filas por encima del grant. La única policy de `UPDATE` en `profiles` (desde
    la migración 0001) era `auth.uid() = user_id`, así que `adminService.updateUserRole` — ya en
    producción desde v1.3 — llevaba desde entonces actualizando 0 filas en silencio (sin error) al
    intentar cambiar el rol de OTRA cuenta; el trigger `protect_profile_role` nunca llegaba a ejecutarse.
    Mismo patrón en `comments` (única policy de `DELETE` también `auth.uid() = user_id`). Se agregó una
    policy adicional de `UPDATE` para `super_admin` en `profiles` + trigger `protect_profile_activo`
    (mismo criterio que `protect_profile_role`: no se puede desactivar la propia cuenta) y una policy
    adicional de `DELETE` para `STAFF_ROLES` en `comments`. **Regla derivada:** cualquier acción nueva de
    "un rol de staff modifica/elimina la fila de otra cuenta/usuario" necesita su propia policy de RLS
    que deje pasar la fila para ese rol — un trigger de validación fina no sustituye eso, corre después.
- **Perfiles múltiples por cuenta (v1.1, estilo Netflix; completado en v1.5):** una cuenta (login con
  Google/correo) puede tener varios perfiles (`profiles_account`, migración 0009) — no varias cuentas.
  Cada perfil tiene su propio nombre, avatar, color, rol, tema (`tema`, migración 0014) y fondo (`fondo`,
  migración 0020 — ver "Fondo del perfil" más abajo). `context/ProfileContext.jsx` + `hooks/useProfile.js`
  son la fuente única de verdad del perfil activo; se recuerda en `localStorage` por cuenta
  (`animeclz:activeProfile:{accountId}`) para no mostrar el selector en cada visita. Tras el login/
  registro, `Login.jsx`/`Register.jsx` navegan a `/perfiles` (no directo a Inicio); `Layout.jsx`/
  `ProtectedRoute.jsx` refuerzan que ninguna pantalla se muestre con sesión activa pero sin perfil
  elegido. El primer perfil de cada cuenta se autogenera al registrarse (trigger en migración 0009) y es
  el único que no se puede eliminar desde la UI (`defaultProfileId` en `useProfile()`) — `Profile.jsx`
  ("Mi Perfil") lo refleja; `ProfileSelect.jsx` además permite Editar/Eliminar cualquier perfil
  directamente desde su propia tarjeta en la grilla (v1.5, antes solo existía para el perfil activo vía
  "Mi Perfil"). **Máximo 4 perfiles por cuenta** (`MAX_PROFILES` en `constants/index.js`) — el trigger
  `enforce_max_profiles` (migración 0019) es la validación real, el frontend solo evita el intento antes
  del round-trip. **Importante (corregido en v1.5 — antes era distinto a propósito):** Favoritos/Mi
  Lista/Historial pasaron de ser por CUENTA a ser por PERFIL (`profile_id` en `favorites`/`watch_later`/
  `watch_history`, migración 0021) — cada perfil de una misma cuenta tiene su propia lista, y se elimina
  de verdad al eliminar su perfil (ver "Eliminar perfil" más abajo). El sistema de perfiles ya no solo
  cambia identidad visual/rol/tema/fondo — también determina qué contenido ve cada perfil.
  - **Eliminar perfil (`deactivateProfile`, baja lógica `activo=false`) está protegido en la base, no solo
    en la UI (v1.5, migración 0019):** el trigger `protect_profile_account_deletion` bloquea eliminar el
    único perfil activo restante de una cuenta, y bloquea eliminar el perfil con `rol <> 'usuario'` (el
    único que puede tenerlo es el sincronizado por `sync_default_profile_rol` — ver "Roles" más abajo),
    para no dejar una cuenta sin ningún perfil con acceso al Panel de Administración. Ambos casos lanzan
    un mensaje ya amable en español que `profilesAccountService.deactivateProfile` deja pasar tal cual
    (no lo reemplaza por uno genérico) para mostrarlo en el `ConfirmDialog` de `Profile.jsx`/
    `ProfileSelect.jsx`. Al eliminar un perfil, un segundo trigger (`cleanup_profile_data`, misma
    migración) borra de verdad (DELETE real, no lógico) sus filas en `favorites`/`watch_later`/
    `watch_history` — `on delete cascade` en `profile_id` no alcanza para esto porque desactivar un
    perfil es un UPDATE, no un DELETE de la fila. Comentarios queda fuera a propósito: `comments.user_id`
    referencia la cuenta, no hay concepto de autoría por perfil, y no existe interfaz pública para
    crearlos todavía.
  - **Fondo del perfil (v1.5, migración 0020, columna `profiles_account.fondo`):** acento decorativo
    detrás del avatar en el selector de perfiles y en el encabezado de "Mi Perfil" — deliberadamente NO
    reemplaza el fondo de toda la app (eso sigue siendo del sistema de Temas exclusivamente, decisión
    confirmada con el usuario). `constants/index.js` → `PROFILE_BACKGROUNDS`: gradientes CSS puros con
    nombres inspirados en anime (Sakura, Cyber Noche, Fuego Shonen, Océano Ghibli...) — nunca imágenes
    externas, para no fabricar/licenciar arte que no existe. Se edita desde `ProfileFormModal.jsx` (junto
    con Tema, ahora también editable ahí para cualquier perfil, no solo desde `Settings.jsx` para el
    activo) vía los componentes presentacionales `ThemePickerGrid.jsx`/`BackgroundPickerGrid.jsx` — a
    diferencia del picker de `Settings.jsx`, estos son solo estado de formulario local (no aplican el
    tema/fondo en vivo), porque el modal puede estar editando un perfil que no es el activo.
  - **El selector NO debe reaparecer en cada refresh (bug real corregido en v1.0):** antes, una condición
    de carrera entre el fetch de perfiles y la restauración desde `localStorage` hacía que `Layout.jsx`
    redirigiera a `/perfiles` incluso con un perfil activo válido. Se corrigió unificando ambos pasos
    dentro de `fetchProfiles()`. El selector solo debe volver a aparecer en 4 casos: iniciar sesión,
    cambiar de cuenta, cerrar sesión, o volver tras inactividad prolongada — nunca en un refresh normal.
    Para eso, `ProfileContext.jsx` mantiene un timestamp de última actividad por cuenta
    (`activityKey()`/`touchActivity()`/`isActivityFresh()`, TTL de 30 min, `ACTIVITY_TTL_MS`), actualizado
    por un heartbeat (mount + `setInterval` de 60s + evento `visibilitychange`). `clearActiveProfile()`
    (ya existía en el contexto) se invoca explícitamente en los tres cierres de sesión reales
    (`AccountMenu.jsx`, `Navbar.jsx` móvil, `Profile.jsx`) — sin esa llamada expresa, cerrar sesión NO
    limpia el perfil recordado. Si se agrega un cuarto punto de cierre de sesión, debe llamar a
    `clearActiveProfile()` también, o el selector no reaparecerá ahí.
  - Avatar: `AvatarPicker.jsx` ofrece tres modos (`AVATAR_TYPES` en `constants/index.js`) — `inicial`
    (círculo de color + letra, por defecto, sin imagen), `subida` (imagen propia a Supabase Storage,
    bucket `avatars` de la migración 0010, `services/avatarService.js`) y `personaje` (buscador
    inteligente de personajes de anime, rediseñado en v1.6 — ver esa entrada en Notas técnicas para el
    detalle completo: `services/avatarSearchService.js`, AniList primero con Jikan de respaldo,
    "Seleccionar" guarda y cierra en un solo paso).
- **Favoritos vs. Mi Lista son dos listas distintas** (decisión tomada al llegar Supabase, ya anticipada
  en ROADMAP.md desde v0.8): `favorites` = "me gusta" (♥, `FavoritesContext`/`useFavorites()`);
  `watch_later` = "quiero verlo después" (`WatchLaterContext`/`useWatchLater()`). Ambos hooks comparten
  lógica vía `hooks/useUserCollection.js` (factory de servicio compartida en `services/
  collectionService.js`) — no dupliques ese patrón para una tercera lista sin pasar también por ahí.
  Todas las acciones de guardar (card, Hero, AnimeDetail) exigen sesión: si no hay usuario, redirigen a
  `/iniciar-sesion` en vez de fallar silenciosamente o loguear localmente. **Desde v1.5 son por PERFIL,
  no por cuenta** (`profile_id`, migración 0021 — ver "Perfiles múltiples" más arriba): `FavoritesContext`/
  `WatchLaterContext` leen tanto `useAuth()` (accountId, todavía necesario para la columna `user_id`,
  NOT NULL por RLS) como `useProfile()` (profileId, el scope real de lectura/escritura). Las políticas de
  INSERT de las tres tablas además verifican que el `profile_id` enviado pertenezca de verdad a una
  cuenta con `exists(select 1 from profiles_account ...)` — sin eso, `auth.uid() = user_id` no alcanza
  para impedir que una cuenta escriba con el `profile_id` de un perfil ajeno.
- `watch_history` (tabla, también por perfil desde v1.5) tiene desde **v2.1** un escritor real:
  `pages/Watch.jsx` (ver "Sistema de reproducción" más abajo) llama a `historyService.upsertProgress`
  mientras reproduce. Antes de v2.1 la tabla estaba preparada pero vacía en la práctica — ya no.
  `services/historyService.js` expone `listHistory(profileId)`/`getProgress(profileId, malId,
  episodeNumber)`/`upsertProgress(accountId, profileId, {...})`. "Continuar viendo" se deriva en el
  cliente de `listHistory` (agrupado por `mal_id`, la fila más reciente ya que viene `updated_at desc`)
  — no hay tabla/vista nueva para eso.
- `ratings`, `notifications` son tablas preparadas (con RLS) sin interfaz — no construir UI para ellas
  hasta que se pida explícitamente. `comments` ya tiene una acción real desde v1.0: eliminar (moderación,
  `pages/admin/Comments.jsx` → `adminService.deleteComment`) — sigue sin interfaz pública para crear/
  editar comentarios (ver ROADMAP.md).
- **Sistema de temas (v1.0):** `profiles_account.tema` (migración 0014, default `'original'`) — 7
  paletas (`constants/index.js` → `THEMES`): AnimeCLZ Original, Purple Night, Ocean Blue, Sakura Pink,
  Emerald, Sunset Orange, Cyber Neon. Cada una es solo un bloque `:root[data-theme="..."]` en
  `src/styles/index.css` que redefine las mismas variables `--color-*` del `@theme` base — ningún
  componente necesita cambiar porque todos ya consumen esos tokens vía clases Tailwind
  (`bg-background`, `text-primary`, etc.). `context/ThemeContext.jsx` + `hooks/useTheme.js` aplican el
  tema del perfil activo (o de `localStorage` `animeclz:theme:guest` sin sesión) escribiendo
  `document.documentElement.dataset.theme`; el picker real vive en `pages/Settings.jsx`. Sunset Orange es
  una excepción puntual y deliberada a "no naranja de marca" — solo aplica si el usuario elige ese tema,
  nunca al branding por defecto (ver Diseño más arriba).
- **Preferencia de autoplay (v2.1):** `profiles_account.autoplay` (migración 0024, `boolean not null
  default true`) — mismo patrón de escritura que `tema`: `Settings.jsx` llama a
  `useProfile().updateProfile(activeProfile.id, {autoplay})` directo, sin contexto dedicado (a diferencia
  de Tema, esta preferencia no se aplica "en vivo" en ningún otro lado — solo la lee el reproductor al
  terminar un episodio). Ver "Sistema de reproducción" más abajo.
- Migraciones SQL organizadas en `supabase/migrations/000N_*.sql` (ver `supabase/migrations/README.md`
  para cómo aplicarlas) — **sí están aplicadas** contra el proyecto real de Supabase (`supabase db push`,
  verificadas en vivo con `supabase db query --linked` tras cada una). Todas las tablas tienen Row Level
  Security: cada usuario solo lee/escribe sus propias filas (`auth.uid() = user_id`), salvo las policies
  adicionales de staff documentadas arriba (roles, migraciones 0017/0018).
- **Panel de Administrador:** arquitectura y navegación desde v0.10; primer CRUD real desde v1.0
  (Noticias, ver más abajo) más moderación real en Usuarios/Comentarios. El resto de módulos (Animes,
  Temporadas, Episodios, Personajes, Estudios, Configuración) sigue sin CRUD — ver ROADMAP.md para el
  porqué de cada uno.
- **Noticias (v1.0, primer CRUD real del Panel):** tabla `news` (migración 0015, propia de AnimeCLZ, no
  depende de Jikan) + `services/newsService.js` (`listNews`/`createNews`/`updateNews`/`deleteNews`) +
  `components/admin/NewsFormModal.jsx` + `components/admin/ConfirmDialog.jsx` (nuevo, reutilizable para
  cualquier confirmación destructiva del panel — sin `window.confirm()`/`alert()`, mismo criterio que el
  resto de la app). `pages/admin/News.jsx` tiene crear/editar/eliminar/buscar/paginar completos. RLS: SELECT
  público solo para `published = true`; staff (`STAFF_ROLES` vía `profiles_account.rol`) ve también
  borradores y puede crear/editar/eliminar.
- **Activar/desactivar cuenta (v1.0):** `profiles.activo` (migración 0016) + trigger
  `protect_profile_activo` (migración 0017, mismo patrón que `protect_profile_role`) — solo `super_admin`
  puede tocar la de otra cuenta, nadie puede desactivar la propia. `pages/admin/Users.jsx` →
  `adminService.updateUserStatus`. Desactivar NO cierra la sesión ya abierta de esa cuenta por sí solo:
  es una marca que el resto del código puede empezar a respetar si en el futuro se agrega un chequeo de
  acceso basado en `activo` (no implementado todavía — ver ROADMAP.md).

## Sistema de reproducción (v2.1)

Primer sistema de reproducción real de AnimeCLZ. Arquitectura desacoplada (`PlaybackProviderManager`,
misma filosofía que `ProviderManager` — ver "## API"), un reproductor de video completo hecho a mano, y
"Continuar viendo"/autoplay reales — pero con un límite de alcance real y deliberado, no una omisión.

**Decisión de piratería, ya resuelta con el usuario, no se reabre:** el pedido original de este sprint
nombraba Consumet/AnimeKai/AnimePahe/HiAnime como proveedores de video. Los cuatro son agregadores que
funcionan haciendo scraping de sitios de streaming no autorizado (gogoanime/zoro-aniwatch/animepahe...),
no APIs con licencia — implementarlos de verdad habría significado construir la cañería para transmitir
contenido con copyright sin autorización, y además habría contradicho la propia regla de "sin scraping"
ya establecida para `ProviderManager` (v1.9). Se le planteó la disyuntiva al usuario, quien confirmó:
construir el 100% de la arquitectura (idéntico contrato de interfaz al que necesitaría un proveedor real
con licencia) con esos 4 + YouTube como **stubs inertes** (mismo patrón que ya usa `TMDBProvider` desde
v1.9), y usar **AnimeThemes** (base de datos abierta y de licencia permisiva de openings/endings de
anime, `api.animethemes.moe`) como el único proveedor real conectado.

**Límite de alcance real, verificado en vivo con `curl` antes de escribir código, no descubierto a mitad
de sprint:** AnimeThemes solo tiene clips de openings/endings (~90 segundos), nunca episodios completos —
hoy no existe ninguna fuente legal y pública de episodios completos para conectar. Este sprint entrega la
arquitectura completa y un reproductor funcionando de verdad con contenido real (los OP/ED de cada
anime), no episodios completos — esa pieza queda con la interfaz, el modelo de datos y la UI ya listos
para cuando exista un proveedor con licencia real.

- **`src/providers/playback/PlaybackProviderManager.js`** — orquestador, mismo patrón que
  `ProviderManager.js` (`withCache`/`getStaleCached` de `utils/cache.js` reusados sin cambios, prefijo de
  caché `pbm:`). Dos métodos, ambos **fusionan** todos los proveedores activos (hoy, en la práctica,
  solo uno):
  - `getEpisodes(animeId, signal)` — el catálogo PROPIO de cada proveedor de reproducción (para
    AnimeThemes: todas las entradas OP/ED con su rango de episodios). **No reemplaza**
    `ProviderManager.getEpisodes()` (metadatos de Jikan/AniList: número/título/fecha) — responde una
    pregunta distinta ("¿qué hay para reproducir?" vs. "¿qué episodios existen?"). `AnimeDetail.jsx`
    consume ambos, uno al lado del otro. Caché 6h (cambia poco).
  - `getSources(animeId, episodeNumber, signal)` → `{sources: VideoSource[], subtitleLanguages: [],
    audioLanguages: [], info}` — filtra en memoria el catálogo ya cacheado (vía `rangeUtils`), sin una
    segunda llamada de red por episodio.
  - `PLAYBACK_PROVIDERS = [{id:'animethemes', ...AnimeThemesProvider}]` — los 5 stubs (`consumet`/
    `animekai`/`animepahe`/`hianime`/`youtube`, cada uno en su propia carpeta bajo `providers/playback/`,
    mismo `createStubProvider` de siempre) quedan definidos/exportados pero deliberadamente **fuera** del
    array activo — mismo criterio ya usado para excluir TMDB del `ProviderManager` real. `youtube` es
    trailers **preparado como estructura únicamente** — no reemplaza el trailer que ya funciona hoy en
    `AnimeDetail.jsx` (ese sigue siendo YouTube embebido directo, sin tocar).
- **`src/providers/playback/animethemes/AnimeThemesProvider.js`** — implementación real. `src/api/
  animethemes.js` (mismo patrón que `api/anilist.js`: axios simple, `timeout: 10000`, 2 reintentos con
  backoff, sin cola de concurrencia propia — AnimeThemes no mostró la fragilidad que sí tiene Jikan,
  probado en vivo). Internamente cachea SU PROPIO catálogo completo por anime (`animethemes:catalog:
  ${animeId}`, 6h TTL, independiente de la caché de `PlaybackProviderManager`) para que `getEpisodes()` y
  `getSources()` de distintos episodios del mismo anime disparen una sola llamada de red real, sin
  importar el orden en que se llamen.
  - **Parseo de rangos** (`rangeUtils.js`, puro y testeado con fixtures): un tema (`"1-25"`, `"78-103"`,
    `null`) declara qué episodios cubre. Verificado con datos reales de Naruto: OP4 tiene una versión con
    `episodes: "78-103"` y una versión 2 (recorte sin créditos) con `episodes: null`. Regla: si al menos
    una entrada de un tema tiene rango real, las entradas `null` de ese mismo tema quedan EXCLUIDAS del
    match (son un recorte alternativo del rango ya declarado en otra versión, no "aplica a todos los
    episodios" — afirmarlo sería un dato que AnimeThemes nunca declaró). Si TODAS las entradas de un tema
    son `null` (películas/OVAs sin backfill de rango), se aceptan como "cubre toda la serie" — solo por
    ausencia de mejor información, nunca por default.
  - **Mapeo a `VideoSource`** (`createVideoSource()`, nuevo en `providers/models.js` — el `@typedef
    VideoSource` ya estaba documentado desde v1.9, pero le faltaba la fábrica): `calidad:
    "${resolution}p"`; `servidor` identifica el clip en sí (`"OP4 · GO!!!"`, no hay múltiples hosts reales
    que distinguir); `subtitleLanguages: []` siempre (AnimeThemes no tiene pistas de subtítulo por idioma
    — `subbed`/`lyrics` son atributos fijos del archivo, no un idioma seleccionable); `audioLanguage:
    'ja'` (dato real: son clips originales japoneses, nunca doblajes); `preview: null` (no hay miniatura
    por clip — no se reutiliza el poster para no hacerlo pasar por una preview real).
- **Migraciones 0023/0024** — `watch_history.duration_seconds` (integer, nullable, sin CHECK; lo escribe
  el CLIENTE desde `<video>.duration`, ningún proveedor reporta una duración real por episodio) y
  `profiles_account.autoplay` (boolean, default `true`, mismo patrón que `tema`/`fondo`). Ambas aplicadas
  y verificadas contra el proyecto real (`supabase db push` + `supabase db query --linked`, columna/tipo/
  default confirmados).
  - **Limitación aceptada, documentada, no resuelta este sprint:** la clave única de `watch_history` sigue
    siendo `(profile_id, mal_id, episode_number)` — no distingue OP vs. ED del mismo episodio. Si un
    perfil mira el OP y luego el ED del mismo número de episodio, la segunda escritura pisa el progreso de
    la primera. En la práctica un episodio normalmente tiene un solo clip que el usuario mira de verdad,
    así que se acepta como simplificación en vez de ampliar la clave única ahora.
- **El reproductor — `<video>` nativo, controles hechos a mano, no una librería de player.** El motivo
  real para una librería (video.js/plyr) es manejar streaming adaptativo (HLS/DASH) — no aplica acá: cada
  fuente de AnimeThemes es un `.webm` estático de una sola resolución, sin manifiesto que manejar. Lo que
  queda (play/pause, seek, volumen, velocidad, fullscreen, PiP) es API nativa del navegador — coherente
  con el resto de la app (nunca una librería de UI empaquetada) y evita pelear contra el chrome por
  defecto de una librería para que respete los 7 temas de color.
  - `src/pages/Watch.jsx` (ruta `ROUTES.WATCH` = `/anime/:id/ver/:episodeNumber`, helper `watchPath()`) —
    fuera de `Layout` (sin Navbar/Footer, pantalla completa), protegida por sesión+perfil como
    `/mi-lista`/`/favoritos` — nuevo bloque `<Route element={<ProtectedRoute />}>` hermano directo de
    `Layout` en `AppRouter.jsx`, mismo patrón ya usado por `PROFILE_SELECT`, sin tocar `ProtectedRoute.jsx`/
    `Layout.jsx`. Combina metadatos de `ProviderManager` (ficha + episodio real) con las fuentes de
    `PlaybackProviderManager`; si `sources` viene vacío, un `EmptyState` honesto explica que hoy solo hay
    openings/endings, no episodios completos, con link de vuelta a la ficha.
  - `src/components/player/` — `VideoPlayer.jsx` (dueño del `<video>`, overlays, `data-player-root`,
    `[touch-action:none]` acotado a la superficie del reproductor, oculta controles tras 3s de reproducción
    continua), `PlayerControls.jsx` (barra superior con volver+bloqueo, centro con anterior/play-pausa/
    siguiente, barra inferior con progreso+buffer real/volumen/velocidad/subtítulos condicional/selector de
    fuente/PiP/fullscreen — `.safe-top`/`.safe-bottom` en la barra, no en todo el reproductor, para no
    duplicar padding), `SourceSelector.jsx` (Listbox de Headless UI, mismo patrón que `Select.jsx`),
    `NextEpisodeOverlay.jsx` (cuenta regresiva 5→0), `EpisodeInfoPanel.jsx` (reusa `InfoGrid` existente),
    `usePlayerState.js`/`useKeyboardShortcuts.js`/`useWatchProgress.js` (hooks de estado/teclado/progreso).
  - **Botón de subtítulos condicional**: solo se renderiza si `subtitleLanguages?.length > 0` — con
    AnimeThemes (que nunca reporta idiomas) simplemente no aparece, sin lógica especial por proveedor.
  - **Loader de buffering — única excepción documentada a "nunca un spinner, siempre un skeleton"**
    (principio de `LoadingState.jsx`): la carga de página (ficha+fuentes antes de montar el reproductor)
    sigue usando el skeleton de siempre; el buffering EN VIVO de un video ya visible (`waiting`/`playing`
    nativos de `<video>`) usa un pequeño spinner (`animate-spin`) directo en `VideoPlayer.jsx` — un
    skeleton no tiene sentido superpuesto a contenido de video que ya está en pantalla.
  - **Progreso**: `upsertProgress` cada ~15s mientras reproduce + inmediato en `pause` + inmediato en
    `visibilitychange`→`hidden` (funciona al pasar a background en mobile). `sendBeacon`/`beforeunload`
    descartados a propósito: `sendBeacon` no puede llevar el header `Authorization` que exige Supabase, así
    que no puede autenticar la escritura; `beforeunload` no es confiable en iOS Safari.
  - **Resume**: `getProgress()` antes de reproducir; en `loadedmetadata`, si `0 < guardado < duración -
    10s`, hace seek a esa posición (últimos ~10s se tratan como "ya terminado").
  - **Autoplay siguiente episodio**: evento `ended` → `NextEpisodeOverlay` (cuenta regresiva) → navega a
    `watchPath(id, episodeNumber+1)` salvo cancelación, gateado en `activeProfile?.autoplay !== false`. El
    total de episodios sale de `ProviderManager.getAnime(id).episodes` (Jikan/AniList) — nunca de la
    cobertura de AnimeThemes, que solo sabe qué rangos tienen tema, no el total real de la serie.
  - **Atajos de teclado** (`useKeyboardShortcuts.js`): Espacio (play/pausa), ←/→ (±10s), ↑/↓ (±volumen), F
    (fullscreen), M (mute), Escape (volver — solo si NO está en fullscreen; si lo está, el navegador ya
    maneja salir de fullscreen de forma nativa). Ignora teclas si el foco está en un input/textarea. Activo
    solo mientras `Watch` está montada.
  - **Mobile**: bloqueo de controles (ícono dedicado, estado booleano); `[touch-action:none]` acotado a la
    superficie del video (mismo criterio de scoping que ya usa `MovieRow.jsx`, nunca global); `.safe-top`/
    `.safe-bottom` en la barra de controles.
- **`AnimeDetail.jsx` — episodios clickeables**: la sección Episodios pasa de una lista estática (sin
  `Link`, sin hover) a una grilla (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`) de `EpisodeCard.jsx`
  (nuevo, `components/anime/`) — cada una es un `Link` a `watchPath(anime.id, episode.number)`. Miniatura:
  cae al poster/backdrop del anime con un ícono de play superpuesto (ningún proveedor da miniatura real
  por episodio — el ícono deja claro que es portada genérica, no una miniatura inventada). Duración
  mostrada: `anime.duration` (duración típica de la serie, dato real de Jikan) — nunca presentada como si
  describiera el clip específico de AnimeThemes. Badges: `Filler` (ya real, de Jikan), `Visto`/barra de
  progreso (derivados de `watch_history` filtrado a ese `mal_id`, solo si hay sesión), "Sin fuente
  disponible" si `PlaybackProviderManager`+`rangeUtils` no encuentran cobertura para ese episodio.
- **Verificado en vivo** (no solo build/lint): script Vite-SSR contra la API real de AnimeThemes —
  `parseEpisodesLabel`/`resolveEligibleEntries`/`resolveEpisodeCoverage` con fixtures a mano (10
  aserciones); `AnimeThemesProvider.getEpisodes/getSources` contra Naruto (mal_id 20) real: catálogo con
  25 temas, URLs `.webm` reales y reproducibles, fuentes resueltas para el episodio 10 con `audioLanguages:
  ['ja']`; un `mal_id` inexistente resuelve `sources: []` sin lanzar; los 5 stubs lanzan el error esperado
  de `createStubProvider`; `PlaybackProviderManager.getEpisodes/getSources` fusiona y etiqueta
  `provider: 'animethemes'` correctamente (24/24 aserciones pasaron). Migraciones 0023/0024 aplicadas y
  columna/tipo/default verificados con `supabase db query --linked`. El round-trip autenticado real de
  `upsertProgress`/`getProgress` (que requiere una sesión de usuario real con JWT, no disponible en un
  script fuera del navegador) queda para la verificación manual en navegador de abajo — las políticas RLS
  de `watch_history` no cambiaron en 0023/0024 (solo se agregó una columna nullable/con default), así que
  su comportamiento ya estaba probado desde v1.5/v2.1.
- **No implementado, fuera de alcance a propósito**: episodios completos (no existe fuente legal pública
  hoy — ver arriba); los 5 proveedores stub como scrapers funcionales (decisión de piratería, no se
  reconsidera); un segundo `orderBy`/clave única que distinga OP vs. ED en `watch_history`; traducir el
  vocabulario de subtítulos ya que AnimeThemes no tiene ninguno que traducir.

## Flujo de trabajo de código

1. Analizar antes de modificar.
2. Explicar el plan antes de tocar código.
3. Esperar aprobación para cambios grandes (refactors amplios, cambios de arquitectura, migraciones de
   paleta/estilo, renombrados masivos).
4. Nunca romper código existente.
5. Nunca eliminar archivos sin preguntar antes.
6. Siempre comprobar que el proyecto compile (`npm run build` y/o `npm run lint`) tras un cambio.

## Calidad

- Buenas prácticas y SOLID cuando sea razonable aplicarlo en un frontend React.
- Componentes pequeños y con una responsabilidad clara.
- Imports ordenados.
- Código limpio por encima de código "rápido".

## Comandos

- `npm run dev` — servidor de desarrollo Vite (puerto 5173).
- `npm run build` — build de producción.
- `npm run preview` — preview del build de producción.
- `npm run lint` — ESLint sobre todo el repo.
- No hay framework de tests configurado todavía.

## Notas técnicas actuales

- Rutas activas: `/` (Landing pública, v1.3, fuera del `Layout`, con su propio header/Footer — ver Notas
  v1.3), `/inicio` (el catálogo — Home.jsx, dentro del `Layout`; **ya no vive en `/`**), `/explorar`,
  `/temporada`, `/top` (sigue existiendo y funcionando, pero ya no está en `NAV_LINKS` desde v1.3),
  `/buscar`, `/anime/:id` (públicas); `/acerca` ahora es solo un redirect a `/` (preserva el hash, ver
  About.jsx); `/mi-lista`, `/favoritos`, `/historial`, `/perfil` (perfil activo, ya no cuenta — ver
  Autenticación), `/configuracion` (protegidas, requieren sesión + perfil elegido); `/perfiles` (selector
  de perfiles, protegida solo por sesión — ver `requireProfile={false}`); `/iniciar-sesion`,
  `/crear-cuenta`, `/recuperar-contrasena`, `/restablecer-contrasena` (fuera del `Layout`, sin
  Navbar/Footer); `/admin` y `/admin/{animes,temporadas,episodios,personajes,estudios,noticias,usuarios,
  comentarios,configuracion}` (protegidas por el rol del perfil activo, ver sección Autenticación);
  `/anime/:id/ver/:episodeNumber` (v2.1, reproductor — ver "Sistema de reproducción" arriba), protegida
  por sesión+perfil, fuera del `Layout` (sin Navbar/Footer, pantalla completa).
  `src/data/movies.js` fue eliminado — no reintroducir datos mock.
- `AnimeDetail.jsx` es la ficha completa (Sprint 3): banner, info extendida (ranking, popularidad,
  estudios, productores, licenciantes, clasificación, temas, demografía), Personajes principales,
  Trailer, Episodios, Relacionados y Galería, más un carrusel de Recomendados (`MovieRow`/`AnimeCard`).
  Botones de Favorito y Mi Lista, ambos gated por sesión (ver sección Autenticación).
- El componente de card se llama `AnimeCard` (`components/movie/AnimeCard.jsx`), no `MovieCard` — se
  reutiliza en Home, Explorar/Temporada/Top/Buscar, Mi Lista y Recomendados de Detalle.
- Componentes de estado compartidos (`components/ui/LoadingState.jsx`, `ErrorState.jsx`,
  `EmptyState.jsx`, `components/catalog/*`) ya existen — reutilizarlos en vez de crear variantes locales
  por página.
- `components/ui/Select.jsx` (Headless UI `Listbox` + Framer Motion) es el único componente de dropdown
  del proyecto — no usar `<select>` nativo en ningún formulario nuevo, componer `Select` en su lugar.
  `components/ui/Modal.jsx` (v1.1, Headless UI `Dialog` + Framer Motion, mismo patrón de `static` +
  `AnimatePresence`) es, del mismo modo, el único componente de modal del proyecto — usarlo para
  cualquier diálogo nuevo en vez de crear uno ad hoc. Dependencia: `@headlessui/react` (ya instalada).
  **Bug real (crash) encontrado y corregido tras v1.5:** al componer cualquier subcomponente de Headless
  UI (`DialogPanel`/`DialogBackdrop` en `Modal.jsx`, `ListboxOptions` en `Select.jsx`, `MenuItems` en
  `AccountMenu.jsx`) vía `as={motion.div}`, **nunca pasarle un prop `transition` de nivel superior** —
  Headless UI reserva ese mismo nombre de prop en esos tres componentes (booleano: "usar el sistema de
  transición propio de Headless UI"), y lo intercepta antes de que llegue a Framer Motion. Si el objeto
  que Framer Motion espera ahí (`{ duration, ease }`) llega en cambio a Headless UI, lo lee como truthy y
  envuelve el elemento en su propio `Transition.Child` interno — que revienta con `A <Transition.Child />
  is used but it is missing a parent <Transition /> o <Transition.Root />` en cualquier componente que
  además use `static` (que evita que Headless UI cree ese contexto de `Transition` en primer lugar). Este
  crash aparecía al abrir el modal de crear/editar perfil (`ErrorBoundary` capturándolo). **La solución
  correcta no es evitar `as={motion.div}` ni quitar `static`** — es dejar de pasar `transition` como prop
  del elemento y en cambio embeberlo dentro de cada objeto `animate`/`exit` (Framer Motion soporta ambas
  formas): `animate={{ opacity: 1, transition: { duration: 0.2 } }}` en vez de `animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}`. Aplica a cualquier componente nuevo que combine Headless UI + Framer
  Motion de esta forma — no reintroducir un prop `transition` de nivel superior en `DialogPanel`/
  `DialogBackdrop`/`ListboxOptions`/`MenuItems`/`ComboboxOptions`/`PopoverPanel` (todos comparten el mismo
  patrón interno).
- `AnimeCard` ya no tiene un botón "Ver detalles" visible. Desde v1.4, la card entera es un único `Link`
  de cobertura total (`absolute inset-0`), siempre activo — no depende de `:hover` (ver "Sprint móvil" en
  Notas técnicas para el bug real que esto corrige). Play/Información son decorativos, solo refuerzo
  visual en hover de escritorio. El ícono de Favoritos es un botón siempre visible (no gateado por hover,
  para ser alcanzable por touch) en la esquina superior derecha, y exige sesión (redirige a
  `/iniciar-sesion` si no hay usuario); "Mi Lista" no vive en la card compacta, solo en Hero/AnimeDetail
  (ver sección Autenticación). No reintroducir un botón de texto sobre la card, ni volver a poner el
  destino de navegación detrás de un overlay gateado por hover.
- `eslint.config.js` existe desde el Sprint 3.6 (antes no había ninguno y `npm run lint` fallaba en
  silencio) — usa `eslint-plugin-react`/`react-hooks`/`react-refresh`. Los archivos que corren en Node
  en vez de navegador (p. ej. `vite.config.js`) tienen su propio bloque de `globals` en ese archivo.
- **v0.8** — Hero es un carrusel (`getFeaturedSlides`, 6 animes reales, autoplay 8s/pausa en
  hover/swipe/dots/thumbnails), no un solo destacado. `Filters.jsx` usa `ChipGroup`
  (`components/ui/ChipGroup.jsx`) para Género/Formato/Estado/Puntuación y sigue usando `Select` para
  Orden/Año (demasiadas opciones para chips). Buscador con autocomplete real en el Navbar
  (`layout/NavbarSearch.jsx`, `quickSearchAnime`). `AnimeDetail.jsx` suma una sección de Episodios real
  (metadatos: número/título/fecha — Jikan no aloja video, así que no hay reproductor).
- **Calidad de imagen:** nunca estirar un póster para simular un banner ancho. Jikan no da un banner
  panorámico real, así que el patrón es: fondo ambiental = el mismo póster, `blur` + escalado (Hero,
  banner de `AnimeDetail`); primer plano = el póster a su relación de aspecto real (`aspect-[2/3]`,
  `object-cover` dentro de esa caja, nunca distorsionado). `poster`/`posterSmall` en el modelo de
  `animeService.js` alimentan un `srcset` simple (`1x`/`2x`) en vez de servir siempre la imagen grande.
- **Supabase (v0.9):** implementado para auth y datos de usuario (ver sección Autenticación). El
  catálogo de anime en sí (`animeService.js`) sigue siendo 100% Jikan — Supabase no reemplaza esa capa,
  solo la complementa con lo que Jikan no puede dar (cuentas, listas persistentes, historial).
- **Panel de Administrador (v0.10):** arquitectura, navegación y diseño visual. `layout/admin/
  AdminLayout.jsx` (+ `AdminSidebar`/`AdminHeader`) es un shell propio, sin Navbar/Footer públicos; el
  sidebar filtra sus ítems por rol (`Usuarios` y `Configuración` solo para `admin`). Componentes
  reutilizables en `components/admin/`: `StatCard`, `DataTable` (tabla base con loading/error/empty),
  `TableToolbar` (búsqueda + filtros), `AdminPageHeader`, y desde v1.0 también `ConfirmDialog` (confirmar
  acciones destructivas sin `window.confirm()`). `services/adminService.js` trae datos reales de
  Supabase; Animes y Temporadas reutilizan `animeService.js` (Jikan, igual que Explorar). Episodios/
  Personajes/Estudios no tienen fuente de datos real todavía (Jikan solo da episodios/personajes por
  anime, no un listado global; Estudios necesitaría una tabla propia) — se dejaron con la tabla armada y
  un `EmptyState` explicando por qué, no con contenido inventado. Noticias sí tiene fuente real desde
  v1.0 (ver más abajo). No agregar botones de crear/editar/eliminar reales en Episodios/Personajes/
  Estudios/Configuración sin que se pida explícitamente (ver ROADMAP.md).
- **Perfiles múltiples (v1.1):** ver sección Autenticación para el detalle de perfiles/roles/avatares.
  `AccountMenu.jsx` (Navbar) muestra avatar + nombre + rol del perfil activo directamente en el botón
  (antes solo un círculo con iniciales de la cuenta) y su menú incluye Mi Perfil/Cambiar Perfil/Mi
  Lista/Favoritos/Historial/Configuración/Panel de Administración (solo staff)/Cerrar sesión — sin
  sesión, sigue mostrando Iniciar sesión/Crear cuenta.
- **Landing Page + Navbar + roles (v1.3):** `pages/Landing.jsx` (`/`) reemplazó a la antigua página
  institucional (`pages/About.jsx`/`/acerca`, que ahora solo redirige a `/` preservando el hash) como
  página principal pública — vive fuera del `Layout` (header propio + `layout/Footer.jsx` reutilizado al
  pie), con Hero, Qué es AnimeCLZ, Características, Estadísticas del catálogo (datos reales, vía
  `AnimeProvider`), Tecnologías, Capturas del sistema (estructura lista, sin capturas reales todavía —
  agregar en `public/screenshots/`), FAQ, Contacto, Privacidad y Términos. El botón "Explorar Anime"
  dirige a `/iniciar-sesion` sin sesión, a `/inicio` con sesión. El logo del Navbar (no el de la Landing,
  que siempre apunta a `/`) es condicional: `/` sin sesión, `/inicio` con sesión — mismo criterio para
  los redirects tras cerrar sesión (`Navbar.jsx`/`AccountMenu.jsx`/`Profile.jsx` navegan a `ROUTES.LANDING`,
  no a `ROUTES.HOME`, al cerrar sesión). `NAV_LINKS` (`constants/index.js`) ahora incluye Favoritos/Mi
  Lista/Historial (antes solo en el menú de cuenta) además de Inicio/Explorar/Temporada — "Top" quedó
  fuera de `NAV_LINKS` a propósito (no estaba en la lista pedida), su ruta sigue viva. Rol `SUPER_ADMIN` +
  Panel de Gestión de Usuarios (`pages/admin/Users.jsx`, gated por `ROLE_MANAGEMENT_ROLES`) para cambiar
  el rol de cualquier cuenta salvo la propia — ver sección Autenticación para el detalle completo.
- **v1.0 — Landing rediseñada, flujo de perfiles corregido, temas, primer CRUD real:** `Landing.jsx`
  reescrita con menos texto y más contenido visual/animado (componente `Reveal` compartido, blobs
  animados, secciones condensadas — ver ROADMAP.md para el detalle sección por sección). El selector de
  perfiles (`ProfileSelect.jsx`) fue rediseñado (fondo animado, efecto vidrio, transición real al
  seleccionar) y su bug de "reaparece en cada refresh" quedó corregido (ver "Perfiles múltiples" en
  Autenticación). Sistema de temas de 7 paletas (ver "Sistema de temas" en Autenticación). Primer CRUD
  real del Panel (Noticias) y primeras acciones reales de moderación (activar/desactivar cuenta, eliminar
  comentario) — ver esas entradas en Autenticación. Se corrigió, de paso, un bug real de RLS que llevaba
  desde v1.3 impidiendo en silencio que `updateUserRole` afectara cuentas ajenas (ver "Roles" en
  Autenticación, migraciones 0017/0018) — cualquier acción nueva de staff sobre una fila ajena debe
  revisar si necesita su propia policy de RLS, no asumir que el trigger de validación alcanza.
- **v1.4 — Sprint móvil (responsive, gestos táctiles, PWA), sin funciones nuevas:** todo el trabajo es
  CSS-first (clases Tailwind por breakpoint), sin detección de viewport por JS salvo una única excepción
  justificada (`Modal.jsx`, ver abajo).
  - **Bug real corregido (el motivo de "en iPhone a veces no abre el anime"):** `AnimeCard.jsx` tenía el
    único destino de navegación dentro de un overlay que solo aparecía con `group-hover:opacity-100` — en
    iOS Safari el primer tap dispara `:hover` en vez del click, así que "revelaba" los íconos en vez de
    navegar, y la mayor parte del póster no tenía ningún handler. Ahora la card entera es un único `Link`
    de cobertura total (`absolute inset-0`), siempre activo, sin depender de hover; Play/Información pasan
    a ser decorativos (`pointer-events-none`, solo refuerzo visual en hover de escritorio); Favoritos es un
    botón siempre visible (no gateado por hover) en la esquina superior derecha, para ser alcanzable por
    touch — se mantiene como hermano del Link (no anidado dentro de un `<a>`, HTML inválido).
  - **Bug real corregido (desborde horizontal):** `NavbarSearch.jsx` expandía a un ancho fijo de 300px
    (más un dropdown `w-80`) que no entraba en los ~288px de contenido real de un viewport de 320-375px.
    Por debajo de `md` ahora abre un overlay de búsqueda a pantalla completa (`fixed inset-0`) en vez de
    expandirse en el header; a `md`+ el comportamiento no cambió.
  - **Bug real corregido (auto-zoom de Safari iOS):** `FormField.jsx` no fijaba `font-size` en el
    `<input>` — heredaba `text-sm` (14px) del label, por debajo del umbral de 16px que dispara el zoom
    automático al enfocar un input en Safari iOS. Ahora es `text-base` en mobile / `sm:text-sm` en
    desktop — corrige los 6 formularios que comparten este componente (Login/Registro/Recuperar/
    Restablecer/Perfil/Configuración) de una sola vez.
  - **Hero (`Hero.jsx`):** el poster, antes `hidden` por completo debajo de 640px, ahora es visible en
    todos los tamaños (ya estaba primero en el orden del DOM, así que "poster arriba, información debajo"
    no necesitó ningún `order-*`). Título con `line-clamp-2`; sinopsis con `line-clamp-4 sm:line-clamp-none`
    (se mantiene el recorte a 280 caracteres existente como límite adicional). Botones apilados a ancho
    completo en mobile (`flex-col` + `w-full sm:w-auto` por botón), `size="lg"` ya cumplía 44px.
  - **Panel de Administrador — `DataTable.jsx` deja de forzar scroll horizontal:** por debajo de `md`
    (768px) ya no renderiza un `<table>` (que forzaba `min-w-[560px]`) — pasa a un listado de tarjetas,
    misma prop `columns` de siempre (columna `actions` se separa a un pie de tarjeta a ancho completo;
    una columna con `label` vacío —p. ej. un thumbnail de póster en Animes/Temporadas— se muestra sin
    etiqueta). Ninguna página de `pages/admin/*` necesitó tocarse más allá de agrandar sus propios
    botones de acción a 44px (News/Users/Comments) — la prop API de `DataTable` no cambió.
  - **`Modal.jsx` — bottom sheet en mobile:** por debajo de `sm` entra deslizando desde abajo, ancho
    completo, esquinas superiores redondeadas, respeta `env(safe-area-inset-bottom)` (home indicator de
    iOS); a `sm`+ mantiene la caja centrada de siempre. Única excepción de este sprint a "CSS-first": la
    dirección de la animación de Framer Motion (slide-desde-abajo vs. scale+fade centrado) sí depende de
    JS (`matchMedia('(min-width: 640px)')` con listener a `change`) porque las props de animación de
    Framer Motion no son responsive vía clases — duplicar el `DialogPanel` en dos bloques CSS-condicionados
    habría arriesgado dos instancias de foco/ARIA de modal activas a la vez. Resuelve de una sola vez el
    editor de avatar, `NewsFormModal`, `ProfileFormModal` y `ConfirmDialog` (todos usan este `Modal`).
  - **Touch targets ≥44×44px:** auditoría dirigida (no un rediseño de `Button` completo) — bump puntual en
    botón hamburguesa y trigger de búsqueda del Navbar, avatar-trigger de `AccountMenu`, íconos sociales
    del Footer, cierre del drawer de `AdminSidebar`/hamburguesa de `AdminHeader`, cierre de `Modal`,
    íconos de acción por fila en News/Users/Comments, swatches de color y tabs de `AvatarPicker.jsx`,
    flechas de `Pagination.jsx`, chips de relacionados en `AnimeDetail.jsx`. Además, `Button.jsx` size
    `md` (el tamaño por defecto, usado por los CTAs primarios de Login/Registro/Recuperar/Restablecer/
    Perfil) pasó de ~40px a 44px (`py-2.5` → `py-3`) — `sm`/`lg` no se tocaron a propósito, para no
    agrandar chips/botones compactos que no lo necesitan.
  - **Safe-area (notch/Dynamic Island/home indicator):** `viewport-fit=cover` agregado al meta viewport;
    dos utilidades nuevas en `index.css` (`.safe-top`/`.safe-bottom`, cada una solo `env(safe-area-inset-*)`
    sin valor base) aplicadas al elemento EXTERIOR que ya tiene su propio padding visual (header del
    Navbar, overlay de búsqueda mobile, drawer de `AdminSidebar`, header del panel admin, bottom-sheet de
    `Modal` vía `calc()` explícito ahí en vez de la clase, porque en ese caso comparte el mismo `p-6` que
    el padding visual) — nunca se combinan en el mismo elemento que ya tiene un padding de Tailwind para
    esa misma propiedad (`padding-top`/`padding-bottom`), porque una pisaría a la otra en vez de sumarse.
  - **Red de seguridad contra scroll horizontal:** `overflow-x: hidden` agregado a `html, body` en
    `index.css` — no afecta el scroll horizontal intencional de `MovieRow`/`DataTable` (contenido en sus
    propios wrappers `overflow-x-auto`).
  - **PWA:** `vite-plugin-pwa` (+ `@vite-pwa/assets-generator` como devDependency, usado una sola vez vía
    `npx pwa-assets-generator` con `pwa-assets.config.js` para generar `favicon.ico`/
    `apple-touch-icon-180x180.png`/`pwa-{64,192,512}.png`/`maskable-icon-512x512.png` a partir del
    `favicon.svg` real existente — no se fabricó ningún ícono a mano). Manifest generado en
    `vite.config.js` (`name`/`short_name`/`theme_color`/`background_color`: `#07111F` — Background, no
    Primary, confirmado con el usuario — `display: 'standalone'`). `index.html` suma
    `apple-mobile-web-app-capable`/`apple-mobile-web-app-status-bar-style`/`apple-mobile-web-app-title`
    (Safari iOS no lee `manifest.display`, necesita sus propias meta tags para abrir en modo standalone).
    `vercel.json` agrega un `headers` para `sw.js`/`manifest.webmanifest` con cache-control corto, para
    que las actualizaciones no queden cacheadas de forma agresiva.
  - **No implementado (fuera de alcance a propósito):** ningún ícono/splash se ilustró a mano — todos
    salen del `favicon.svg` real vía el generador; no se rediseñó el logo para el "safe zone" de íconos
    maskable (el fondo casi cubre el canvas completo) — puede recortarse un poco raro en launchers que
    apliquen máscara circular, aceptable por ahora, no bloqueante. Auditoría de contraste de color no se
    rehizo desde cero (la paleta ya documentada en CLAUDE.md se dio por buena).
- **v1.5 — Sistema de perfiles definitivo:** ver la sección "Perfiles múltiples por cuenta" en
  Autenticación para el detalle completo. En corto: máximo 4 perfiles por cuenta (validado en el
  frontend y, de verdad, con un trigger en Supabase); Editar/Eliminar ahora disponibles desde cualquier
  tarjeta del selector (`ProfileSelect.jsx`), no solo para el perfil activo vía "Mi Perfil"; eliminar un
  perfil pasa por confirmación real (`ConfirmDialog`, reubicado de `components/admin/` a `components/ui/`
  por ser agnóstico de dominio) y está protegido en la base contra eliminar el único perfil restante o el
  que tiene rol elevado; nuevo campo "Fondo" (gradientes CSS, acento decorativo, no reemplaza el sistema
  de Temas) editable junto con Tema desde el propio modal de crear/editar perfil. **Cambio de arquitectura
  confirmado con el usuario, revirtiendo una decisión de v1.1:** Favoritos/Mi Lista/Historial pasaron de
  ser por cuenta a ser por perfil (migración 0021) — cada perfil tiene su propia lista, que se borra de
  verdad al eliminar su perfil. Migraciones 0019-0021.
- **v1.5.1 — Bug real corregido: crash al abrir el modal de perfil.** "Crear Perfil"/"Editar" disparaba
  el `ErrorBoundary` con `A <Transition.Child /> is used but it is missing a parent <Transition />`.
  Causa raíz confirmada leyendo el código fuente de `@headlessui/react` (no adivinada): `Modal.jsx` pasaba
  un prop `transition={{ duration, ease }}` (pensado para Framer Motion) directamente a `DialogPanel`/
  `DialogBackdrop` — pero Headless UI reserva ese mismo nombre de prop en esos componentes para su propio
  sistema de transición (booleano), lo intercepta, lo ve truthy, y los envuelve en su propio
  `Transition.Child` interno — que revienta porque `Dialog` tenía `static` (por diseño, para que Framer
  Motion controle la animación en su lugar) y por lo tanto nunca crea el contexto `Transition` que
  `Transition.Child` necesita. Ver la entrada de `Modal.jsx` en Componentes/Notas de arriba para la regla
  completa. Corregido en `Modal.jsx`, y con el mismo patrón (mismo bug latente, no confirmado que
  llegara a crashear ahí) en `Select.jsx`/`ListboxOptions` y `AccountMenu.jsx`/`MenuItems` — los únicos
  otros dos lugares del proyecto que componen un subcomponente de Headless UI vía `as={motion.div}`.
  De paso, se corrigió un warning real de Framer Motion sin relación con el crash: `Hero.jsx` tenía dos
  hijos directos (poster + info) dentro de un `AnimatePresence mode="wait"`, que solo admite un hijo a la
  vez — consolidados en un único wrapper por slide.
- **v1.6 — Buscador inteligente de avatares (personaje de anime).** La pestaña "Personaje de anime" de
  `AvatarPicker.jsx` no funcionaba de verdad — dos causas reales, no supuestas:
  - **Bug 100% reproducible**: `getCharacterAnime` (`services/animeService.js`) pedía
    `GET /characters/{id}` — ese endpoint de Jikan nunca trae relación con anime (confirmado pidiéndolo en
    vivo: solo `mal_id/name/images/about`), así que la función devolvía `null` siempre, para cualquier
    personaje. Corregido: ahora pide `GET /characters/{id}/anime` (el sub-recurso correcto, que sí trae
    `role`) y devuelve `{ anime, role }` en vez de un string suelto.
  - **Fragilidad real de Jikan, verificada en vivo durante esta misma sesión**: `/anime?q=` y
    `/characters?q=` devolvieron `504` repetidas veces (backend de búsqueda de MAL degradado en ese
    momento) — con el único manejo de error de antes (`.catch(() => setCharacters([]))`), esto era
    indistinguible en la UI de "no hay resultados".
  - **Arquitectura nueva**: `services/avatarSearchService.js` — único punto de entrada
    `searchAvatarCandidates(query, signal)`. **AniList (GraphQL, `api/anilist.js`, nuevo) primero**: una
    sola consulta con dos ramas (`animeMatch`: busca el término como título de anime y trae su elenco con
    rol; `characterMatch`: busca el término como nombre de personaje directo, con su anime/rol si
    AniList lo tiene resuelto) — fusionadas y deduplicadas por id. Verificado en vivo contra
    `graphql.anilist.co`: "Naruto" trae Naruto/Sasuke/Kakashi/Sakura; "Gojo" (sin ningún anime con ese
    título) trae "Satoru Gojou — Jujutsu Kaisen" igual, vía `characterMatch`; "Frieren" trae
    Frieren/Fern/Stark/Himmel. **No hace falta detectar "¿esto es un anime o un personaje?"** — fusionar
    las dos ramas ya da el comportamiento inteligente pedido. **Jikan como respaldo**, solo si AniList
    lanza error o da 0 resultados combinados: busca anime por título (reusa `searchAnime`) → si hay
    match, trae su elenco con rol (`GET /anime/{id}/characters`, ya lo usa `getAnimeCharacters` en otro
    contexto); además intenta `searchCharacters` (búsqueda directa de personaje) — estos resultados no
    traen anime/rol por la limitación ya documentada de ese endpoint de Jikan, se muestran igual sin esos
    dos campos (opcionales en la tarjeta) en vez de N llamadas extra para resolverlos.
  - **"Avatares recientes" y "Favoritos" (tabla `avatar_history`, migración 0022)** — por CUENTA, no por
    perfil (pedido explícito del usuario para "recientes"; mismo alcance aplicado a "favoritos" por
    consistencia). `services/avatarHistoryService.js`: `listAvatarHistory`/`recordAvatarUse`
    (actualiza `used_at` sin tocar `is_favorite` en un upsert parcial)/`setAvatarFavorite`. Se muestran en
    vez de la grilla de resultados cuando el buscador está vacío.
  - **"Seleccionar" es de un solo paso (confirmado con el usuario)**: guarda el avatar en Supabase y
    cierra el modal entero al instante, sin pasar por el botón "Guardar" — `ProfileFormModal.jsx` expone
    `saveForm()` (extraída de su `handleSubmit` de siempre, para no duplicar validación/cierre) y un nuevo
    prop `onSelectAndClose` que solo usa la pestaña "Personaje"; los otros dos modos de avatar (Inicial+
    color, Subir imagen) siguen usando `onChange` (quedan en borrador hasta "Guardar"), sin cambios.
  - Componente nuevo `AvatarCandidateCard.jsx` (reusado en resultados de búsqueda y en Recientes/
    Favoritos): imagen, nombre, anime, rol, botón Seleccionar, estrella de favorito **siempre visible**
    (no gateada por hover — misma lección del sprint móvil con `AnimeCard`), 44px de área táctil, grid
    `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`.
  - Debounce bajado a 300ms (antes 400ms); caché de búsqueda reutilizando `hooks/useFetch.js` (mismo
    mecanismo de caché/TTL/abort que el resto de la app, no uno nuevo), TTL 5 min.
- **v1.7 — Búsqueda global, Home móvil y scroll entre páginas.** Pedido por el usuario como "v1.6"
  (colisiona con el número ya usado arriba para el buscador de avatares) — documentado con el número real
  de secuencia. Auditoría de código + pruebas en vivo antes de tocar nada (pedido explícito: causa raíz,
  no parches).
  - **`services/searchService.js` (nuevo)** — el buscador general (`/buscar`, `NavbarSearch.jsx`), distinto
    de `avatarSearchService.js` (que fusiona todo en una lista para elegir un único avatar): único punto de
    entrada `searchAll(query, filters, signal)` → `{ anime, characters, degraded }`, **dos grupos
    separados**. Anime: AniList primero (`Page.media(search, sort: SEARCH_MATCH, perPage: ~15)`, trayendo
    `idMal`) con Jikan (`discoverAnime`/`searchAnime`) de respaldo si AniList falla o da 0 — reduce presión
    real sobre el endpoint de búsqueda de Jikan (el más frágil de la API, documentado desde Sprint 3.5).
    **Hallazgo de arquitectura verificado en vivo**: el campo `idMal` de AniList es el mismo `mal_id` que
    usa `AnimeDetail.jsx` (confirmado pidiendo "Naruto": `idMal: 20`) — así que un resultado de AniList
    navega a la MISMA ficha de detalle (100% Jikan, sin tocarla) sin duplicar esa página ni crear una
    segunda fuente de verdad; un resultado sin `idMal` se descarta (no tiene a dónde navegar). Con filtros
    restrictivos activos (género/tipo/estado/puntuación mínima) Jikan pasa a ser el primario para esa
    búsqueda (traducir el vocabulario completo de filtros a enums de AniList quedó fuera de alcance;
    AniList sigue de respaldo igual). Personajes reutiliza la cascada de v1.6, extraída a
    `services/characterSearchService.js` para que avatar picker y buscador general la compartan sin
    duplicarla — `avatarSearchService.js` quedó como un re-export de una línea.
  - **`src/utils/apiCascade.js` (nuevo)** — `withFallback(primary, fallback, { onFailure, ... })`
    centraliza el patrón "intentar primario, si falla o da vacío intentar respaldo, nunca lanzar salvo
    abort real" que antes solo vivía dentro de `avatarSearchService.js`. `onFailure` solo dispara si AMBAS
    fuentes fallan — de ahí sale `degraded`, que le permite a `Search.jsx` distinguir "cero resultados
    reales" de "las dos fuentes cayeron a la vez" sin mostrar nunca un código de error técnico al usuario.
  - **`Search.jsx` rediseñada** — antes mostraba todos los filtros a la vez. Ahora: barra de búsqueda +
    botón "Filtros" (abre `Filters.jsx` dentro del `Modal.jsx` existente, sin drawer nuevo) → sin búsqueda
    activa: "Búsquedas recientes" (`localStorage`, nuevo `utils/recentSearches.js` — pantalla pública, sin
    sesión, no tiene sentido atarlas a Supabase) + "Tendencias" (`getTrending`) → con búsqueda activa:
    secciones "Anime"/"Personajes". **Paginación eliminada** — una búsqueda de texto de dos fuentes ya trae
    un conjunto acotado y ordenado por relevancia (mismo criterio que AniList/Crunchyroll); Explorar sigue
    siendo la pantalla de catálogo paginado. `Filters.jsx` muestra 8 géneros principales + "Ver todos".
    `NavbarSearch.jsx` usa `searchAll` también. `AvatarCandidateCard.jsx` se reutiliza para las tarjetas de
    personaje del buscador general — sus props de acción (favorito/seleccionar) ahora son opcionales para
    soportar un uso de solo lectura, en vez de crear una tarjeta casi idéntica.
  - **`Hero.jsx` — bug real corregido**: `drag="x"` de Framer Motion envolvía TODO el contenido
    (poster+título+sinopsis+3 botones) — en touch, ese reconocedor de gestos competía con el scroll
    vertical nativo sobre un área que incluía botones interactivos (causa real de "cuesta seguir
    bajando"/"captura el dedo"). El `drag` ahora solo existe en desktop, vía nuevo hook compartido
    `hooks/useIsDesktop.js` (generalizado del que vivía inline en `Modal.jsx` desde el sprint móvil — sigue
    siendo la única excepción del proyecto a "CSS-first, sin detección de viewport por JS", porque Framer
    Motion anima valores en JS). Mobile: altura pasa de fija (`h-[92vh] min-h-[620px]`) a dependiente del
    contenido, bastante más chica; los puntos de navegación pasan a flujo normal (debajo de los botones) en
    vez de `position: absolute` sobre contenido centrado verticalmente — eliminaba de raíz el solape
    reportado como "líneas del slider entre los botones" en viewports bajos. Desktop (`sm`+) sin cambios
    visuales; los puntos/miniaturas absolutos existentes quedan gateados `hidden sm:flex`.
  - **`MovieRow.jsx` — bug real corregido**: el scroller `overflow-x-auto` no definía
    `touch-action`/`overscroll-behavior` (confirmado por grep: no existía en ningún lugar del código) —
    sin esa pista CSS el navegador no puede comprometerse de inmediato con el eje horizontal y cede terreno
    al scroll vertical de forma inconsistente entre navegadores (causa real de "bloquea el scroll
    vertical", no un bug de JS). Agregado `[touch-action:pan-x] [overscroll-behavior-x:contain]`
    (Tailwind arbitrario) al scroller — el listener de `wheel` existente (desktop-only) no se tocó.
  - **`components/ScrollToTop.jsx` (nuevo)** — no existía ningún mecanismo de scroll-restauración en todo
    el proyecto (confirmado por grep); React Router v7 no lo hace solo. `useLocation()` + `useEffect` con
    `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` — el `behavior: 'instant'` es explícito y
    necesario: `html` ya tiene `scroll-behavior: smooth` global (sprint móvil), así que sin ese override
    cada cambio de ruta se habría visto como un scroll animado hacia arriba en vez de arrancar ya arriba.
    Montado **una sola vez** dentro de `AppRouter.jsx` (no de `Layout.jsx`), para cubrir también el árbol
    separado de `AdminLayout`.
  - **`Footer.jsx`** suma `.safe-bottom` (utilidad ya existente desde el sprint móvil, sin uso hasta
    ahora — es el último elemento antes del borde real de pantalla).
  - **Auditoría dirigida** (no un segundo pase completo — v1.4 ya lo hizo exhaustivamente): confirmado por
    grep que el único candidato real a overflow horizontal de página era el `drag`/`dragElastic` del Hero
    (ya resuelto arriba); no se encontró otro uso de `drag` de Framer Motion en el resto del código.
- **v1.8 — Explorar simplificado: filtros compactos + Drawer de filtros avanzados.** `Explore.jsx`
  mostraba `Filters.jsx` completo y siempre visible (género/formato/estado/puntuación/año/orden de una
  sola vez) — pedido explícito de reducirlo a un vistazo compacto, con el resto detrás de un botón
  "Filtros". **No se tocó `Filters.jsx` ni `Search.jsx`** (que lo usa dentro de su propio `Modal` desde
  v1.7, con aplicación instantánea) — se construyeron piezas nuevas específicas de Explorar en vez de
  arriesgar esa pantalla ya aprobada.
  - **`components/catalog/QuickFilters.jsx` (nuevo)** — fila compacta, solo desktop (`hidden sm:flex`):
    6 géneros (Acción/Aventura/Fantasía/Romance/Comedia/Drama, orden pedido explícitamente, no el de
    `GENRES`) + toggle "Ver más/Ver menos" que reemplaza la lista completa (`motion.div layout` anima el
    reflow, sin manejo manual de alturas); mismo patrón para Formato (TV/Película/OVA + "Más
    formatos"/"Menos formatos"); Estado fijo a 3 chips (Todos/En emisión/Finalizado — "Próximamente" solo
    vive en el Drawer); Orden reusa el `Select` compacto de siempre. Sin puntuación ni año. Auto-expande
    género/formato si el valor activo (llegado desde el Drawer o la URL) no está en el subconjunto
    popular, vía `useEffect` — sin eso, una selección hecha en el Drawer quedaría "escondida" en la fila
    compacta.
  - **`components/catalog/AdvancedFiltersPanel.jsx` (nuevo)** — contenido del Drawer: set **completo** de
    cada filtro (género/formato/estado/año/calificación/orden), sin ningún "ver más" interno (ya es la
    vista exhaustiva) ni botones propios (el Drawer los pone alrededor). Puramente presentacional,
    controlado (`value`/`onChange`), mismo contrato que `Filters.jsx`.
  - **`Modal.jsx` — nueva prop `variant`** (`'center'` por defecto, sin cambiar ningún consumidor
    existente; `'drawer'` nuevo, solo usado por Explorar). En mobile ambas variantes siguen siendo
    idéntico bottom-sheet; en desktop, `'drawer'` desliza un panel de ancho fijo (`sm:w-96`) a todo el
    alto de pantalla desde el borde derecho (`x: '100%' → 0`) en vez de la caja centrada de siempre —
    mismo componente reutilizado (CLAUDE.md pide no crear un diálogo ad hoc nuevo), sin duplicar el
    diálogo. El `transition` sigue embebido dentro de cada objeto `animate`/`exit`, nunca como prop de
    nivel superior (regla de v1.5.1).
  - **`Explore.jsx` — borrador con Limpiar/Aplicar**: `filters` (el estado real que dispara
    `discoverAnime`) sigue mutado en vivo por `QuickFilters`, igual que los chips de siempre. El Drawer usa
    un estado aparte, `draftFilters`, sembrado desde `filters` cada vez que se abre — "Aplicar" lo copia a
    `filters` (reseteando `page` a 1) y cierra; "Limpiar filtros" solo vacía el borrador, sin tocar el
    grid; cerrar sin aplicar (X/backdrop/Escape) descarta el borrador sin más, porque `openDrawer()`
    siempre re-siembra desde `filters` la próxima vez. En mobile, `QuickFilters` desaparece del todo
    (oculto en el propio componente) — solo quedan visibles el título y el botón "Filtros"; no se agregó
    una caja de búsqueda por texto a Explorar (confirmado con el usuario: eso ya lo hace `/buscar`,
    agregarla aquí habría sido una función nueva y hubiera duplicado ese propósito).
  - **`constants/index.js` — `getYearOptions()` extraído**: el cálculo de años (`CURRENT_YEAR`/
    `Array.from`) vivía inline dentro de `Filters.jsx`; ahora es una función compartida que también usa
    `AdvancedFiltersPanel.jsx`, para no duplicarlo. `Filters.jsx` no cambió de comportamiento, solo de
    dónde importa ese cálculo.
- **v1.9 — Provider Engine: arquitectura multi-proveedor de datos (sin reproductor todavía, sin conectar
  a ninguna página).** Pedido por el usuario como "v1.7" (colisiona con el número ya usado arriba para el
  sprint de búsqueda global/Home móvil) — documentado con el número real de secuencia. Investigación
  previa (no supuestos) encontró que la arquitectura de proveedores ya existía **dos veces, con dos
  propósitos distintos**: la fachada pasiva `AnimeProvider.js`→`JikanProvider.js`→`animeService.js` de
  v1.3 (un solo proveedor activo, la que usan las 9 páginas de catálogo) y el cascade real AniList→Jikan
  de v1.7 (`searchService.js`/`characterSearchService.js`/`apiCascade.js`/`api/anilist.js`), acotado a
  búsqueda de texto. **Decisión confirmada con el usuario vía pregunta aclaratoria**: este sprint construye
  el motor nuevo como arquitectura aislada y aditiva — completo y verificado por sí solo, pero **sin
  reconectar las 9 páginas existentes** (siguen 100% Jikan, sin cambios). Reconectarlas es un sprint
  futuro.
  - **`providers/ProviderManager.js` (nuevo)** — el orquestador. Expone 6 métodos:
    `search/getAnime/getEpisodes/getCharacters/getRelations/getRecommendations`. `PROVIDERS = [{id:
    'anilist', ...AniListProvider}, {id:'jikan', ...JikanProvider}]` es el único punto de extensión —
    agregar un proveedor real nuevo es una línea en este array, nada más se toca. TMDB queda fuera del
    array mientras siga siendo un stub.
  - **Semántica de cascada/merge, distinta por método (pedido explícito, no un único patrón para todos)**:
    `search()` y `getCharacters()` **fusionan** todos los proveedores en paralelo y deduplican (no se
    detienen en el primero que responde) — `search()` dedupea por `id` (`idMal`==`mal_id`, mismo espacio
    numérico hoy); `getCharacters()` dedupea por nombre normalizado a un conjunto de palabras ordenadas
    (minúsculas, sin puntuación) para que "Uzumaki, Naruto" (Jikan) y "Naruto Uzumaki" (AniList) generen la
    misma clave sin un heurístico frágil de "voltear la coma". `getAnime()` fusiona campo por campo
    (`mergeAnimeFields`, `providers/models.js`): conserva el valor de AniList si no está vacío, si no cae a
    Jikan — nunca al revés ("nunca reemplazar datos buenos por peores"). `getEpisodes()`/`getRelations()`/
    `getRecommendations()` son primero-no-vacío-gana (`firstSuccessful`, ver abajo) — AniList primero,
    Jikan de respaldo.
  - **`utils/apiCascade.js` — nuevo export `firstSuccessful(fns, opts)`**, sin tocar `withFallback`/
    `isAbortError` existentes (`searchService.js`/`characterSearchService.js` siguen dependiendo de su
    forma exacta) — generalización a N funciones en orden del mismo algoritmo, para cascadas con más de
    dos proveedores sin fijar de antemano cuántos hay.
  - **`providers/jikan/JikanProvider.js` (reescrito)** — pasa de `export * from 'animeService'` (21
    métodos, el que usaba `AnimeProvider.js`) a ser el adaptador de 6 métodos sobre `animeService.js` (sin
    tocar ese archivo), taggeando cada resultado `source: 'jikan'`.
  - **`providers/anilist/AniListProvider.js` (de stub a implementación real)** — sobre `anilistRequest`
    (`api/anilist.js`, sin tocarlo), con queries GraphQL propias (schema público de AniList, sin scraping).
    **`getEpisodes()` es un no-op permanente y deliberado**: el schema público de AniList no tiene listado
    de episodios (solo un conteo agregado) — no se "arregla" esto inventando datos, se devuelve vacío para
    que el cascade pase a Jikan. **`getAnime()` deja `rank`/`popularity`/`producers`/`licensors`/`themes`/
    `demographics` siempre en `null`/`[]`**: AniList no tiene un equivalente real de esos campos de MAL
    (su `popularity`/`favourites` miden algo distinto a "rank") — mapear uno bajo el nombre del otro sería
    un bug real, no una mejora; el merge los completa siempre desde Jikan. Nota deliberada: las queries de
    `search()`/`getCharacters()` se parecen a las que ya existen en `searchService.js`/
    `characterSearchService.js` — superposición aceptada, no descuido (ver "## API" arriba) — la
    alternativa (reusar esas queries desde acá) habría arriesgado esa función ya en producción sin
    necesidad.
  - **`providers/models.js` (nuevo)** — `createEpisode(partial)`: normaliza cualquier episodio al shape
    preparado para el futuro reproductor (`id, number, title, description, thumbnail, duration, sources:
    [], subtitleLanguages: [], audioLanguages: [], provider`) — `sources`/`subtitleLanguages`/
    `audioLanguages` quedan vacíos hoy (ningún proveedor de video existe todavía, no se inventa nada).
    JSDoc `@typedef VideoSource` documenta el shape futuro (servidor/calidad/subtítulos/audio/preview) sin
    fábrica ni código que lo instancie — nada lo necesita todavía, solo se deja la arquitectura lista, tal
    como se pidió. `mergeAnimeFields(primary, secondary)` es el único algoritmo de "completar sin
    reemplazar bueno por peor", reusado por `getAnime()` y por la deduplicación de `search()`.
  - **`providers/tmdb/TMDBProvider.js`** — solo se achica su `METHODS` (mismo `createStubProvider` de
    siempre) a los 6 nombres nuevos; sigue siendo un stub sin implementar.
  - **`providers/AnimeProvider.js` — cambio de una línea, sin riesgo**: pasa a `export * from
    '@/services/animeService'` directo (antes pasaba por `JikanProvider.js`, que ahora es otra cosa) —
    mismos 21 nombres, mismo comportamiento byte-idéntico, verificado por grep que ninguna de las 9 páginas
    depende de `JikanProvider.js` por nombre/ruta.
  - **Caché**: `ProviderManager.js` envuelve cada método reusando `getCached`/`setCached` de
    `utils/cache.js` (sin mecanismo nuevo), claves con prefijo propio `pm:<método>:<params>` (namespace
    dentro del mismo `Map` compartido con `useFetch`, sin chocar). TTL configurable por método (`search` 5
    min; `getAnime`/`getEpisodes`/`getRecommendations` 30 min; `getCharacters`/`getRelations` 60 min). Un
    resultado vacío se cachea aparte, solo 60s — si ambas fuentes fallaron transitoriamente (Jikan, en
    particular, ver sección API), un "sin datos" no debe quedar pegado media hora.
  - **Nunca rompe la interfaz**: cualquier falla total (todas las fuentes fallan) resuelve a un valor vacío
    seguro (`null`/`[]`/`{data:[],pagination}` según el método), nunca un throw — salvo un abort real, que
    sí se relanza. **Verificado contra las APIs reales** (no solo build/lint): `getAnime(20)` (Naruto) trae
    `source: 'anilist+jikan'` con campos completados de ambas fuentes; `search('frieren')` fusiona y
    dedupea; `getCharacters(20)` combina AniList+Jikan sin duplicados; `getRelations(20)`/
    `getRecommendations(20)` traen datos reales agrupados/ordenados; un id inválido resuelve `null` sin
    lanzar (incluso con Jikan devolviendo 504 real durante la prueba — la degradación funcionó tal como se
    diseñó); abortar a mitad de una llamada sí rechaza la promesa.
- **v2.0 — Estabilización: causa raíz real de los errores de carga + AnimeDetail conectado al Provider
  Engine.** Pedido explícito del usuario: antes de cualquier funcionalidad nueva, dejar AnimeCLZ estable
  — encontrar la causa REAL de los "servidor ocupado" intermitentes (no reformular el mensaje) e integrar
  `ProviderManager`. La investigación (lectura directa de código, no supuestos) encontró **dos causas
  raíz reales y distintas**, no una sola:
  - **Bug 1 — condición de carrera confirmada en `api/jikan.js`** (ver la entrada de ese archivo en la
    sección API arriba para el detalle completo): la cola de concurrencia dejaba pasar ráfagas enteras sin
    respetar `MAX_CONCURRENT=2`, porque reservaba el cupo dentro de un `setTimeout` futuro en vez de al
    momento de chequear. Corregido con reserva síncrona (`while` que despacha y reserva en el mismo paso —
    JS de un solo hilo cierra la condición de carrera de verdad). De paso: las requests abortadas mientras
    esperan turno ahora se remueven de la cola en vez de seguir "gastando" un cupo, y el backoff de
    reintento chequea abort antes/después de esperar en vez de reintentar a ciegas para un llamador que ya
    se fue.
  - **Bug 2 — hallazgo adicional en vivo durante la verificación de este mismo sprint**: `curl` directo
    (fuera de la app) confirmó `/anime/20/episodes` tardando 11s y devolviendo 500 — más que el
    `timeout: 10000` de axios, así que el cliente lo veía como `ECONNABORTED` (timeout), no como un
    status 5xx. El chequeo de reintento (`RETRYABLE_STATUS`) solo miraba `error.response?.status`, que
    para un timeout de cliente es `undefined` — un backend lento-y-después-caído se rendía al primer
    intento sin reintentar nunca. Corregido: un timeout de cliente ahora cuenta como transitorio igual
    que un 429/5xx (mismo presupuesto de 4 reintentos, mismo backoff).
  - **Bug 3 — bug de código real y separado en `AnimeDetail.jsx`, sin relación con el uptime de Jikan**:
    la sección Episodios leía `episodes.data?.length`/`episodes.data.map(...)`, pero `getAnimeEpisodes`
    (y ahora `ProviderManager.getEpisodes`) devuelven `{data:[...], pagination}` — o sea `episodes.data`
    (el campo `data` del propio `useFetch`) es ese objeto completo, no el array. `.length` sobre un
    objeto es `undefined`, así que la condición era SIEMPRE verdadera: la sección mostraba "Sin episodios
    listados" para TODOS los animes, sin importar si Jikan tenía datos. Prueba de que era un bug y no
    diseño: la sección hermana "Recomendados" sí hacía el doble acceso correcto
    (`recommendations.data?.data`) para la misma forma — a Episodios le faltaba ese segundo `.data`.
    Corregido a `episodes.data?.data?.length`/`episodes.data.data.map(...)`.
  - **Alcance de la migración — decisión confirmada con el usuario (pregunta aclaratoria)**: dado que
    `ProviderManager` cubría (antes de este sprint) solo 5 de los ~21 métodos que usan las páginas —
    falta toda la familia Trending/TopRated/MásPopular/MejorValorado/Temporada que necesitan Home/
    Explorar/Buscar/Temporada, con paginación real y un choque de nombre en `getRecommendations` (global
    de Home vs. por-anime) — este sprint se concentró en arreglar la causa raíz (beneficia a TODAS las
    páginas, migradas o no) + migrar `AnimeDetail.jsx` completo (ya casi 1:1) + el nuevo método que le
    faltaba. Home/Explorar/Buscar/Temporada quedan para un sprint propio, documentadas como paso
    siguiente, no como pendiente por descuido.
  - **`providers/models.js`/`ProviderManager.js` — caché "usar último resultado válido"** (pedido
    explícito): `utils/cache.js.getCached` deja de borrar la entrada vencida al leerla (solo devuelve
    `undefined`, preserva el valor); nuevo `getStaleCached(key)` la devuelve igual, aunque esté vencida.
    `ProviderManager`'s `withCache`: si la consulta fresca vuelve vacía (ambos proveedores fallaron o
    genuinamente no tienen datos) y existe una entrada vieja no vacía, se sirve esa (con un TTL corto para
    reintentar de verdad pronto) — nunca un vacío mientras exista algo mejor en caché. Recién si tampoco
    hay nada guardado se devuelve el vacío real, que en la UI termina en `EmptyState` (el último recurso
    pedido explícitamente).
  - **`getGallery` (nuevo, 7º método)** — no existía ningún método de galería en el Provider Engine.
    `JikanProvider.getGallery` envuelve `getAnimePictures` (sin tocar `animeService.js`);
    `AniListProvider.getGallery` es un no-op permanente (mismo criterio que `getEpisodes`: el schema
    público de AniList solo tiene `coverImage`/`bannerImage` únicos, sin concepto de galería);
    `ProviderManager.getGallery` cascada con `firstSuccessful`, TTL de 6h (imágenes promocionales casi no
    cambian). `TMDBProvider` suma `'getGallery'` a su contrato de stub.
  - **`AnimeDetail.jsx` migrado por completo**: sus 6 imports pasan de `@/providers/AnimeProvider` a
    `@/providers/ProviderManager` (`getAnimeById→getAnime`, etc., `getAnimePictures→getGallery`) — la
    página ya no importa `animeService.js`/`AnimeProvider.js` en absoluto. Variable `pictures` renombrada
    a `gallery` (cosmético, ya se tocaba esa sección). Las `cacheKey` del `useFetch` externo no se
    tocaron — siguen evitando el flash de skeleton en una revisita a la misma ficha.
  - **Riesgo real documentado, no silenciado**: como los métodos de `ProviderManager` nunca lanzan salvo
    abort real, la rama `.catch()` de `useFetch` queda efectivamente inalcanzable para estas 5 llamadas —
    cualquier falla total ahora aparece como `EmptyState`, no `ErrorState`. Además, "Reintentar" solo
    limpia la caché EXTERNA de `useFetch`, no la de `ProviderManager` (`pm:getEpisodes:...`) — reintentar
    dentro de la ventana corta de 60s puede devolver el mismo vacío cacheado en vez de golpear la red de
    nuevo. Ventana acotada y autocorregible, no un bloqueo indefinido — una solución genérica
    (`skipCache` por método) queda para el sprint que construya la familia Trending/Top, que va a
    necesitar resolver lo mismo.
  - **Confirmado, sin cambios (documentado para no dar la impresión de pendiente por descuido)**:
    Favoritos/Mi Lista/Historial (`collectionService.js`/`historyService.js`) ya guardan el anime completo
    en la fila de Supabase al agregarlo y lo leen directo — nunca llaman a Jikan/AniList en vivo, no había
    nada que migrar. `services/searchService.js` (motor de `/buscar` y el autocompletar del Navbar) es su
    propia cascada AniList+Jikan ya afinada en dos sprints anteriores, con capacidades que
    `ProviderManager.search()` no tiene (buscar personajes por nombre sin contexto de anime, agrupar
    anime/personajes por separado, estado `degraded`) — reemplazarla habría sido una regresión real, no
    una migración, así que `Search.jsx` no cambió.
  - **Verificación real, no solo build/lint** (pedido explícito): (1) script aislado contra
    `utils/cache.js` confirmando que un valor vencido sigue disponible vía `getStaleCached` pero no vía
    `getCached`; (2) arnés con el adaptador de axios mockeado (determinístico, no la red real) contra
    `api/jikan.js`: ráfaga de 10 peticiones nunca supera 2 en simultáneo Y respeta el espaciado de 180ms;
    abortar peticiones todavía en cola rechaza casi al instante (no esperan su turno) y no llegan a la
    red; abortar a mitad de un backoff de reintento no reintenta. Las 7 aserciones pasaron. (3) Script
    Vite-SSR contra las APIs reales replicando la ráfaga exacta de `AnimeDetail.jsx` (6 llamadas en
    paralelo): primera corrida encontró `/anime/20/episodes` genuinamente caído (confirmado también con
    `curl` directo, HTTP 500 a los 11s) — expuso el Bug 2 de arriba en vivo; con el fix de timeout
    aplicado, la misma ráfaga contra el mismo backend degradado devolvió **100 episodios reales** de
    Naruto, además de ficha/personajes/relaciones/galería/recomendados completos.
- **v2.1 — Sistema de reproducción: `PlaybackProviderManager` + reproductor real.** Ver la sección
  "## Sistema de reproducción (v2.1)" arriba para el detalle completo. En corto: arquitectura desacoplada
  idéntica en filosofía a `ProviderManager`, con AnimeThemes (openings/endings, contenido real y legal)
  como único proveedor activo — Consumet/AnimeKai/AnimePahe/HiAnime quedaron como stubs inertes a
  propósito (decisión de no construir infraestructura de streaming pirata, confirmada con el usuario, no
  se reconsidera). Reproductor de video nativo hecho a mano (play/pausa/volumen/velocidad/fullscreen/PiP/
  seek con buffer real/atajos de teclado/bloqueo mobile), episodios de `AnimeDetail.jsx` ahora clickeables
  hacia `/anime/:id/ver/:episodeNumber`, "Continuar viendo" y autoplay-siguiente-episodio con cuenta
  regresiva realmente escribiendo en Supabase (`watch_history.duration_seconds`, migración 0023;
  `profiles_account.autoplay`, migración 0024). Límite de alcance real y documentado: AnimeThemes solo
  tiene clips de OP/ED (~90s), no episodios completos — no existe hoy una fuente legal pública de
  episodios completos para conectar.
- **Post-v2.1 — Bug real corregido: Galería mostraba "Servidor ocupado" en vez de degradar a
  EmptyState.** Investigación con reproducción en vivo (Vite-SSR contra la API real, no supuestos):
  `/anime/{id}/pictures` de Jikan está actualmente degradado de verdad (504 "Jikan failed to connect to
  MyAnimeList" verificado con `curl` para 9+ animes distintos, incluyendo los 5 pedidos para esta
  verificación: Naruto/One Piece/Frieren/Attack on Titan/Solo Leveling — mientras `/anime/{id}`,
  `/{id}/characters` y `/{id}/videos` responden bien). Eso por sí solo NO es el bug: `ProviderManager.
  getGallery` (vía `firstSuccessful`) ya estaba diseñado para nunca lanzar salvo abort real, y una
  reproducción en vivo confirmó que efectivamente resuelve a `[]` (no lanza) para los 5 animes, incluso
  bajo ráfaga concurrente simulando los 6 `useFetch` reales de `AnimeDetail.jsx`. **La causa real
  encontrada por grep**: `hooks/useFetch.js` era el ÚNICO lugar del código que reimplementaba la
  detección de cancelación en vez de reusar `isAbortError()` de `apiCascade.js` (que ya usan
  `ProviderManager`/`PlaybackProviderManager`/`searchService`/`characterSearchService`) — y su
  reimplementación estaba incompleta: solo miraba `CanceledError`/`ERR_CANCELED` (los que fabrica la cola
  propia de `api/jikan.js`), no `AbortError`. Galería es la sección más lenta con diferencia (~8-10s de
  reintentos agotando el presupuesto de 4 contra un endpoint caído, contra <1.5s del resto) — la ventana
  más grande para que un `useFetch` de Galería quede a mitad de un fetch cuando el usuario navega a otro
  anime (p. ej. desde un link de Relacionados/Recomendados, sin desmontar `AnimeDetail.jsx` porque la
  ruta reusa el mismo componente) y su `AbortController` se cancele a mitad de camino. Corregido
  reemplazando el chequeo inline de `useFetch.js` por el mismo `isAbortError()` compartido. No se tocó el
  mensaje de `ErrorState` ni el de `EmptyState` (pedido explícito) — el fix es puramente de clasificación
  de errores, no de copy. Verificado: `getGallery` resuelve `[]` sin lanzar para los 5 animes pedidos
  (Naruto/One Piece/Frieren/Attack on Titan/Solo Leveling, ~8.2-8.6s cada uno dado el estado actual de
  Jikan) — cuando `/pictures` se recupere, la misma ruta devolverá imágenes reales sin cambios de código.
- **Nota de proceso**: las entradas de "Notas técnicas actuales" para v2.2 (Reproducción Multi Provider),
  v2.3 (AnimeDetail Premium), v2.4 (Smart Search Engine), v2.5 (Landing Premium + Login) y v2.6
  (Recommendation Engine) — los 5 sprints reales entre este punto y v2.7 de abajo — no llegaron a
  escribirse en este archivo (se perdieron en un corte de contexto de la sesión). El código de esos 5
  sprints SÍ existe y está en uso (`providers/playback/{consumet,enime}/*`, el rediseño de
  `AnimeDetail.jsx`/`components/anime/*`, `searchService.js`/`utils/searchRanking.js`, `Landing.jsx`/
  `AuthCard.jsx`/`LoginMascot.jsx`, `services/recommendation/*` — todos verificables por `git status`/
  lectura directa) — falta reconstruir su documentación acá. Pendiente, no se rellenó de memoria para no
  arriesgar una descripción inexacta en el archivo que se trata como fuente de verdad.
- **v2.7 — Media Hub: AnimeDetail como centro multimedia completo (Staff, Enlaces oficiales, Plataformas
  de streaming), usando únicamente APIs públicas y legales — sin reproducción de episodios.** Auditoría
  previa (releyendo `AnimeDetail.jsx`/`ProviderManager.js`/`AniListProvider.js`/`JikanProvider.js` byte a
  byte, no de memoria) encontró que Tags/Trailer/Openings/Endings/Relaciones/Franquicia ya existían desde
  v2.3 — el trabajo real de este sprint fueron 3 piezas genuinamente nuevas: Staff (reemplaza el
  `EmptyState` fijo que existía desde v2.3), Enlaces oficiales y Plataformas oficiales de streaming
  (ninguna existía).
  - **Verificado en vivo antes de diseñar** (`curl` directo contra `graphql.anilist.co`, no supuesto):
    Jikan tiene endpoints reales para esto (`/anime/{id}/staff`, `/anime/{id}/external`,
    `/anime/{id}/streaming`) pero los 3 devolvieron 504 repetidamente durante la verificación (Jikan
    degradado, mismo patrón documentado en toda esta sesión) — mientras que una única query GraphQL a
    AniList con `staff`/`externalLinks`/`studios(isMain:true).siteUrl` devolvió datos reales completos
    (confirmado con Naruto, mal_id 20: 10 miembros de staff con rol e imagen, incluyendo "Original
    Creator"/"Director"/"Character Design"; 9 plataformas de streaming reales —Crunchyroll, Netflix, Hulu,
    Tubi TV, Bilibili, iQ, YouTube, Hoopla×2 con `notes: "Dub"/"Sub"`—, cada una con ícono y color de marca
    reales servidos por AniList; 1 enlace oficial no-streaming, "Official Site" → tv-tokyo.co.jp; y
    `studios(isMain:true).siteUrl` real → `https://anilist.co/studio/1`).
  - **Decisión de arquitectura — extender `AniListProvider.getAnime()` en vez de agregar métodos nuevos a
    `ProviderManager`:** los 3 campos ya están disponibles en la MISMA query GraphQL que `getAnime()`
    hace hoy — agregarlos ahí es una extensión de la respuesta existente, cero llamadas de red nuevas.
    Agregar `getStaff()`/`getMediaLinks()` como métodos nuevos de `ProviderManager` habría significado 2
    round-trips adicionales por carga de `AnimeDetail.jsx` para datos que la página YA está pidiendo —
    exactamente lo que "nunca duplicar llamadas" (pedido explícito del sprint) prohíbe. `staff`,
    `officialLinks`, `streamingPlatforms` y `studioLinks` se agregaron directo al objeto que
    `AniListProvider.getAnime()`/`ProviderManager.getAnime()` ya devuelven — ver la nota nueva en "## API"
    arriba.
  - **Por qué Jikan no tiene un fallback real para estos 4 campos** (a diferencia de todos los demás
    campos de `getAnime()`, que sí cascada AniList→Jikan): a diferencia de rank/popularity/producers/etc.
    (que YA se piden en la llamada existente a Jikan, sin costo adicional), staff/enlaces de Jikan viven
    en 3 endpoints SEPARADOS que hoy nadie llama — conectarlos habría significado 3 llamadas Jikan nuevas
    en CADA carga de ficha, siempre, incluso cuando AniList (más confiable esta sesión) ya cubre el dato.
    Se prefirió dejarlos AniList-only con Jikan ausente (`mergeAnimeFields` ya trata una clave ausente
    como vacía sin necesidad de declarar `staff: []` explícito del lado Jikan) — decisión documentada, no
    un descuido; queda como mejora futura conectar Jikan como respaldo real si AniList llegara a fallar
    sistemáticamente para estos campos en particular.
  - **`providers/models.js`** — 2 fábricas nuevas, mismo patrón que `createEpisode`/`createVideoSource`:
    `createStaffMember({id, name, role, image, provider})` y
    `createExternalLink({id, name, url, type, icon, color, language, note, provider})` (un solo shape
    para "Enlaces oficiales" y "Plataformas de streaming" — solo cambia el filtro de `type` aplicado en
    `AniListProvider.js`, no ameritaba 2 shapes distintos).
  - **`AniListProvider.js`** — `ANIME_QUERY` suma `studios(isMain:true){nodes{id name siteUrl}}`,
    `staff(perPage:10,sort:RELEVANCE){edges{role node{id name{full} image{medium}}}}` y
    `externalLinks{id url site type language icon color notes isDisabled}`. 3 mappers nuevos:
    `mapStaff()` (agrupa `edges` por persona — un miembro con 2 roles créditados aparece en 2 `edges`
    distintos de AniList, ej. "Director" + "Storyboard" — y une los roles en un solo string en vez de
    duplicar la tarjeta), `mapExternalLinks()` (separa `externalLinks` en `streamingPlatforms`
    `type:'STREAMING'` vs. `officialLinks` todo lo demás, descarta `isDisabled:true`), `mapStudioLinks()`
    (`anime.studios` de Jikan, string[], no se tocó — este es un campo aparte, `studioLinks`,
    `{name,siteUrl}[]`, que `AnimeDetail.jsx` resuelve por coincidencia de nombre).
  - **Alcance deliberadamente NO usado: `streamingEpisodes` de AniList.** La misma query de exploración
    confirmó que AniList también expone URLs de streaming POR EPISODIO (`streamingEpisodes{title
    thumbnail url site}`, ~26 entradas de Crunchyroll para Naruto) — se decidió NO usarlas: el sprint
    prohíbe explícitamente "implementar reproducción de episodios", y una lista de links por episodio
    hacia un reproductor externo se acerca demasiado a esa línea (además de quedar fuera del contrato ya
    establecido de "Playback" = `PlaybackProviderManager`/AnimeThemes, que este sprint tampoco debía
    tocar). "Dónde ver" usa únicamente `externalLinks` a nivel de ANIME completo (un link de salida por
    plataforma, hacia la página de la serie en Crunchyroll/Netflix/etc., nunca hacia un episodio
    puntual ni embebido en la app).
  - **Componentes nuevos** (`components/anime/`, ninguno con lógica de datos embebida en JSX —
    `resolveStudioSiteUrl()` en `AnimeDetail.jsx` resuelve el match estudio↔link fuera del render):
    `StaffCard.jsx` (mismo lenguaje visual que `CharacterCard.jsx`; ícono `UserRound` de respaldo si
    `image` viene `null` — AniList no siempre tiene foto de cada miembro, confirmado en vivo con "Art
    Director" de Naruto sirviendo el `default.jpg` genérico de su propio CDN), `ExternalLinkCard.jsx`
    (enlace de salida genérico, ícono `Globe` de respaldo), `StreamingPlatformBadge.jsx` (mismo shape,
    con el `color` de marca real de AniList como acento puntual — borde izquierdo de 4px, nunca fondo
    completo, mismo criterio de "gradientes/color solo suave" que ya aplica el resto del diseño; esto es
    branding de terceros reales, no una segunda excepción a la paleta de marca de AnimeCLZ). `StudioCard.jsx`
    (existente desde v2.3) gana un prop opcional `siteUrl`: con match se vuelve un link real a la página
    del estudio en AniList, sin match se ve exactamente igual que antes.
  - **`AnimeDetail.jsx`** — Staff pasa del `EmptyState` fijo de v2.3 a una grilla real (con su propio
    `EmptyState` solo si `anime.staff` viene vacío de verdad, no como promesa de "sprint futuro" — ya está
    conectado). 2 secciones nuevas, "Dónde ver" (streamingPlatforms) y "Enlaces oficiales" (officialLinks),
    insertadas después de Temporadas/Franquicia y antes de Comentarios — ambas se ocultan por completo si
    la lista viene vacía (mismo criterio que Trailer/Géneros: contenido complementario, no un hueco que
    amerite pedir disculpas). Estudios gana el link opcional descrito arriba.
  - **Skeletons (task 6) — decisión explícita de NO agregar uno nuevo para estas 3 secciones**: a
    diferencia de Personajes/Episodios/Galería/Recomendados/Relaciones (cada una su propio `useFetch`
    independiente, con su propio timing de carga), Staff/Enlaces oficiales/Dónde ver son campos DEL MISMO
    objeto `anime` que la página ya espera antes de renderizar cualquier sección (`if (loading) return
    <LoadingState variant="hero" />` corta el render entero mientras `anime` carga) — mismo criterio ya
    usado por Información/Sinopsis/Estadísticas/Géneros/Estudios, que tampoco tienen skeleton propio.
    Agregar uno ahí sería código muerto que nunca se muestra.
  - **Verificado en vivo, no solo build/lint**: script Vite-SSR contra las APIs reales — 14/14
    aserciones: `AniListProvider.getAnime(20)` trae `staff`/`streamingPlatforms`/`officialLinks`/
    `studioLinks` reales y con la forma esperada; `ProviderManager.getAnime(20)` conserva los 4 campos
    después del merge con Jikan, y `merged.studios` sigue siendo `string[]` de Jikan sin cambios (prueba
    de que no se rompió ese campo existente); un id inexistente resuelve `null` sin lanzar tanto en
    AniList (404 propio de AniList para un `idMal` sin match) como en el cascade completo de
    `ProviderManager` (con Jikan devolviendo su 504 habitual en paralelo) — el `Promise.allSettled` ya
    existente en `runGetAnime` maneja ambos fallos sin código nuevo.
  - **Restricciones respetadas, verificado por timestamp** (`ls --time-style=full-iso`): `Search.jsx`
    (20:43:39 del 12/07), `Landing.jsx` (23:31:46), `Login.jsx` (23:36:57), `pages/admin/*`, `context/
    ProfileContext.jsx` (13:25:52), `services/recommendation/*` (hasta 00:04:12 del 13/07) y
    `providers/playback/**`/`pages/Watch.jsx` — todos con última modificación ANTES del primer archivo
    tocado en este sprint (`AniListProvider.js`, 00:18:14) — ninguno se tocó.
  - **No implementado, fuera de alcance a propósito**: reproducción de episodios (prohibido
    explícitamente); logo/descripción de estudio (AniList no los expone en `studios`, solo `siteUrl` —
    Jikan tampoco sin un segundo endpoint `/producers/{id}` no conectado); `streamingEpisodes` de AniList
    (decisión explícita de no usarlos, ver arriba); Jikan como fallback real de staff/enlaces (ver
    decisión de arquitectura arriba).
- **v2.8 — Quality, Performance & Stabilization: auditoría completa + corrección de lo encontrado, sin
  funciones nuevas ni cambios de arquitectura.** Pedido explícito del usuario: "Corregir únicamente
  problemas encontrados" — documentar todo antes de tocar código (FASE 1), aplicar solo mejoras con
  beneficio real (FASE 2-5), actualizar documentación solo si hay cambios importantes (FASE 6).
  - **Hallazgo más importante — contraste WCAG del botón primario, verificado matemáticamente (fórmula de
    luminancia relativa, no una apreciación visual):** `bg-primary text-white` (el patrón del botón
    primario — el elemento más repetido de la app: Login, Registro, "Ver Ahora", "Aplicar" filtros,
    "Crear cuenta", badges "Visto"/"Filler", etc.) **no cumplía WCAG AA (4.5:1) en NINGÚN tema de los 7**:
    Original 3.22:1, Purple Night 3.41:1 (ambos fallan igual, aunque menos mal), y **severamente** en
    Ocean Blue (2.38:1), Sakura Pink (2.37:1), Emerald (2.22:1), Sunset Orange (2.34:1) y Cyber Neon
    (1.54:1 — prácticamente ilegible). El patrón aparecía 11 veces en 10 archivos, no solo en
    `Button.jsx`: `EpisodeCard.jsx` (badge "Visto"), `RoadmapTimeline.jsx`, `NextEpisodeOverlay.jsx`,
    `AvatarCandidateCard.jsx`, `AvatarPicker.jsx` (tab activo), `AccountMenu.jsx`, `Navbar.jsx`,
    `Explore.jsx`, `Search.jsx` (botones "Aplicar"/"Cerrar" del Drawer de filtros).
    - **Corrección, confirmada con el usuario antes de aplicar** (dado el alcance visual — es el CTA más
      repetido de toda la app): nuevo token `--color-on-primary` por tema en `src/styles/index.css`, que
      reutiliza el propio `--color-background` de ESE MISMO tema como color de texto sobre `--color-
      primary` — no inventa ningún color nuevo ni toca los hues de marca ya confirmados en sprints
      anteriores. Verificado matemáticamente: pasa AA con margen amplio en los 7 temas (5.68:1–13.22:1).
      Los 11 usos de `text-white` junto a `bg-primary` pasaron a `text-on-primary`.
  - **Performance — bundle:** `npm run build` marcaba el chunk principal (`index-*.js`) con la
    advertencia propia de Vite por superar 500KB (598.65KB real, gzip 198.32KB) — solo `@supabase/
    supabase-js` tenía `manualChunks` propio; `framer-motion`/`@headlessui/react` (usadas en casi toda la
    app, no candidatas a code-splitting por ruta) viajaban dentro del chunk principal. Se agregaron sus
    propios `manualChunks` en `vite.config.js` (`motion`/`headless-ui`) — el chunk principal bajó a
    363.73KB (gzip 119.15KB), sin advertencia de Vite. Mismo total de bytes de red en una carga en frío;
    la ganancia real es cacheo entre despliegues (esas librerías no cambian de versión tan seguido como el
    código de la app) y descarga en paralelo vía HTTP/2 en vez de un único archivo secuencial.
  - **Race condition real (4 archivos) — `setTimeout` antes de `navigate()`/actualizar estado, sin
    limpiar al desmontar:** `Login.jsx`/`Register.jsx` (700ms), `ProfileSelect.jsx`
    (`SELECT_TRANSITION_MS`, 260ms) y, la ventana más larga, `ResetPassword.jsx` (2000ms) — si el usuario
    navegaba a otro lado (botón atrás, otro link) DENTRO de esa ventana, el `setTimeout` disparaba igual
    más tarde y `navigate()` producía una redirección sorpresa hacia una página que el usuario ya no
    estaba mirando. Corregido con el mismo patrón en los 4: un `useRef` guarda el id del timeout, un
    `useEffect(() => () => clearTimeout(ref.current), [])` lo cancela al desmontar.
  - **Duplicación real de componentes:** `components/admin/StatCard.jsx` y `components/anime/
    StatCard.jsx` — mismo patrón visual (icono en círculo + etiqueta + valor en una tarjeta), mismo
    contrato de props base (`icon`/`label`/`value`), solo diferían en layout (vertical "número grande" del
    Dashboard vs. horizontal compacto de AnimeDetail) y en política de vacío (Skeleton+"—" vs. ocultar la
    tarjeta entera). Consolidados en `components/ui/StatCard.jsx` (agnóstico de dominio, ver
    "Arquitectura" arriba — `ui/` es exactamente el lugar para esto) con una prop `variant` (`"dashboard"`
    default / `"compact"`) que preserva el comportamiento exacto de cada uno de los dos originales, ambos
    eliminados.
  - **Auditoría exhaustiva, con hallazgo de "ya está bien hecho" en cada área — verificado por grep/
    lectura directa, no asumido:** cobertura de `AbortController`/guardas de carrera (patrón `active =
    true/false` en el cleanup de `useEffect`, ya consistente en los ~15 efectos con llamadas async del
    proyecto, incluyendo `useUserCollection.js`/`AuthContext.jsx`/`AvatarPicker.jsx`); memoización de
    `value` en los 5 Context principales (`AuthContext`/`ProfileContext`/`ThemeContext`/
    `FavoritesContext`/`WatchLaterContext`, los 5 ya usan `useMemo`); limpieza de event listeners (los ~15
    `addEventListener` del proyecto ya tienen su `removeEventListener` en el cleanup) y de timers
    (`setInterval`/la mayoría de `setTimeout` ya con `clearInterval`/`clearTimeout`, salvo los 4 de
    arriba); CLS de imágenes (los 19 `<img>`/`motion.img` del proyecto ya reservan su espacio vía clases
    `aspect-[2/3]`/`aspect-video`/tamaño fijo de Tailwind — funcionalmente equivalente a los atributos
    `width`/`height` HTML que pide `docs/13_PERFORMANCE.md`, y más correcto para imágenes responsive);
    `aria-label` en botones solo-ícono (ya presente 1:1 en cada botón de acción de `Users.jsx`/
    `News.jsx`/`Comments.jsx`, `PlayerControls.jsx`, `Pagination.jsx`, `AccountMenu.jsx`, `Modal.jsx`);
    `key={index}` (los ~13 usos que aparecen son todos sobre `Array.from({length: N})` de skeletons
    estáticos, el único caso donde ese patrón es correcto); sin imports/variables muertos (`no-unused-
    vars` de ESLint ya en 0 antes de empezar); sin llamadas directas a `axios`/`fetch` fuera de
    `services`/`providers`/`api` (el único "hallazgo" de un grep inicial era un falso positivo:
    `refetch()` contiene la subcadena `fetch(`).
  - **Diferido a otro sprint, documentado, no un descuido:** el warning `react-hooks/set-state-in-effect`
    de `useFetch.js`/`useUserCollection.js`/`Search.jsx` ya está downgradeado a `warn` desde el
    `eslint.config.js` original (v0.8/Sprint 3.6) con la razón documentada ahí mismo — arreglarlo de raíz
    necesita reescribir el patrón de "cache hit síncrono" a "derive state during render", un cambio de
    arquitectura del hook de datos más usado de la app, fuera de alcance de "No modificar la arquitectura"
    de este sprint. Reconstruir las entradas de CLAUDE.md/ROADMAP.md para v2.2–v2.7 (ver la nota de
    proceso más arriba) tampoco se hizo en este sprint — es documentación faltante de sprints anteriores,
    no un hallazgo de calidad de v2.8.
  - **Build/Lint**: `npm run build` y `npm run lint` limpios tras cada cambio — 0 errores de lint, mismos
    14 warnings preexistentes (ninguno nuevo); build sin la advertencia de chunk grande de Vite (ver
    arriba).
- **v3.1 — Sync Engine: cola de mutaciones offline, no un sistema de sincronización paralelo.** Pedido
  del usuario: un "SyncManager" que sincronice Favoritos/Mi Lista/Historial/Continuar viendo/
  Recomendaciones/Configuración/Tema/Perfil entre dispositivos, con cola offline, reintentos automáticos
  y resolución de conflictos ("última modificación", "nunca duplicar datos").
  - **Hallazgo de auditoría que define todo el diseño (FASE 1, verificado leyendo el código real, no
    supuesto):** en esta app, "sincronizar entre dispositivos" ya ocurre hoy automáticamente para casi
    todo, porque Supabase ES la única fuente de verdad — cada dispositivo lee/escribe las mismas filas
    directamente, sin una copia local propia que pueda divergir. Favoritos/Mi Lista
    (`collectionService.js`, ya usa `upsert`/`delete` filtrado por `profile_id`), Historial/Continuar
    viendo (`historyService.upsertProgress`, ya `upsert`), Tema/Autoplay/Perfil
    (`profilesAccountService.updateProfile`, ya un PATCH por campo) — los 3 ya estaban sincronizados de
    verdad, ya sin duplicados (constraints únicos de cada tabla). "Configuración" en la práctica son solo
    Tema y Autoplay — Idioma/Notificaciones/Privacidad en `Settings.jsx` son tarjetas sin estado, nada que
    sincronizar ahí. "Recomendaciones" se calculan en el cliente a partir de datos YA sincronizados,
    cacheadas solo en memoria (`utils/cache.js`) — no hay nada que escribir, es 100% derivado. Confirmado
    por grep: cero detección online/offline en todo el proyecto antes de este sprint, cero patrón de
    cola/outbox para datos, cero uso de IndexedDB (`localStorage` es la única persistencia que la app usó
    siempre). **Conclusión:** la única divergencia real posible es cuando un dispositivo está offline en
    el momento de escribir — por eso "SyncManager" se construyó como una cola de mutaciones offline, no
    como una capa de sincronización redundante que hubiera significado tocar la arquitectura de datos ya
    probada de toda la app.
  - **`src/services/sync/offlineQueue.js` (nuevo)** — persistencia pura, sin conocimiento de Supabase.
    Entradas `{key, type, payload, createdAt}`; `upsertEntry` reemplaza por `key` (última intención gana:
    togglear un favorito on/off/on offline colapsa a una sola entrada) o, con `merge: true`, fusiona el
    `payload` nuevo sobre el existente (lo usa `profile:update`, para que dos ediciones offline distintas
    — tema y luego autoplay — sobrevivan ambas en vez de que la segunda pise a la primera). Storage:
    `localStorage` con `try/catch` (JSON corrupto, `QuotaExceededError` de Safari privado) cayendo en
    silencio a un `Map` en memoria — también hace el módulo testeable sin navegador/jsdom.
  - **`src/services/sync/SyncManager.js` (nuevo)** — orquestador, plain JS, nunca dentro de React (mismo
    principio que `ProviderManager` con sus Providers: nunca importa un servicio, cada servicio registra
    su propio `type` con `registerHandler()`, evita el import circular y lo mantiene agnóstico de
    dominio). `createSyncManager({isOnline, storage})` es una factory (permite instancias independientes
    para tests — "2 dispositivos" simulados con storage separado) con un `export default` singleton para
    la app real. `run({type, key, payload, merge, ownErrorMessage, optimisticResult}, executeFn)`: si
    `!isOnline()`, encola directo (nunca llama a `executeFn`) y resuelve `optimisticResult` (o
    `undefined`) — optimista, no revierte la UI. Si hay conexión, llama a `executeFn()` igual que siempre;
    si lanza, distingue error real de fallo de red **sin sniffear el tipo/mensaje de la excepción nativa
    de fetch** (frágil, varía por navegador): compara `err.message` contra `ownErrorMessage`, el mensaje
    genérico que ese MISMO servicio ya usa para un error real de Supabase (patrón `if (error) throw new
    Error(GENERIC_ERROR)` ya establecido en toda la app) — si coincide, error real, se re-lanza (preserva
    el revert optimista de `useUserCollection.js`); si no, nunca llegó a ese chequeo porque `fetch` mismo
    falló, se encola igual que offline. `flush()` repite cada entrada con su handler registrado, para en
    el primer fallo (no sigue intentando el resto). Auto-flush: `window.addEventListener('online', flush)`
    al cargar el módulo + un flush inicial **diferido con `queueMicrotask`** (nunca síncrono: los 3
    servicios que importan este módulo recién registran sus handlers DESPUÉS de que termina de evaluarse
    este archivo — ES modules resuelven el grafo de imports antes de reanudar al importador — un flush
    síncrono correría siempre con la lista de handlers vacía; encontrado en la revisión de diseño antes de
    escribir código, no en producción).
  - **Integración — 3 archivos existentes, wrap mínimo, cero cambio de comportamiento con conexión**:
    `collectionService.js` (la lógica de `add`/`remove` de siempre pasa a `rawAdd`/`rawRemove`, envueltas
    en `syncManager.run`, registradas como `collection:${table}:add`/`collection:${table}:remove` — cubre
    Favoritos y Mi Lista con un solo cambio, la factory ya es compartida por ambas), `historyService.js`
    (mismo wrap para `upsertProgress`, `history:${profileId}:${malId}:${episodeNumber}` — cubre Historial
    y Continuar viendo), `profilesAccountService.js` (mismo wrap para `updateProfile`, `profile:${id}`,
    `merge: true`).
  - **Bug real encontrado y corregido durante la implementación (no en el diseño aprobado, un detalle que
    solo se vio al cablear `profilesAccountService.js`):** el diseño original pasaba `payload: {id,
    fields: {...}}` (anidado) — pero `offlineQueue.upsertEntry`'s `merge: true` hace un merge SUPERFICIAL
    (`{...existing.payload, ...payload}`), así que la segunda edición offline reemplazaba el objeto
    `fields` completo de la primera en vez de combinarse campo por campo (verificado con el script de
    prueba: la aserción de "ambos campos presentes" falló, mostrando solo el último campo). Corregido
    aplanando el payload (`{id, ...fields}`) — el handler registrado le pasa el objeto completo a
    `rawUpdateProfile(id, fields)`, que solo destructura las claves que le interesan, así que la `id` de
    más no molesta.
  - **Segundo ajuste real encontrado durante la implementación:** `profilesAccountService.updateProfile`
    devuelve la fila completa actualizada, y `ProfileContext.updateProfileById` hacía
    `setProfiles((prev) => prev.map((p) => p.id === id ? updated : p))` — un reemplazo TOTAL. Si
    `updateProfile` resolvía `undefined` al encolar offline (como sí es correcto para `collectionService`/
    `historyService`, cuyos llamadores no leen el valor resuelto), ese reemplazo total habría dejado el
    perfil local en `undefined`, rompiendo la UI. Se agregó `optimisticResult` a la firma de
    `SyncManager.run()` (opcional, `undefined` por defecto — no cambia ningún otro call site) para que
    `updateProfile` resuelva `{id, ...fields}` en vez de nada, y se cambió
    `ProfileContext.updateProfileById` de reemplazo total a fusión (`{...profile, ...updated}`) — con
    conexión no cambia nada (`updated` ya es la fila completa, fusionar todas las claves da lo mismo que
    reemplazar); sin conexión, preserva rol/avatar/activo/etc. mientras la edición sigue encolada.
  - **Fuera de alcance, documentado explícitamente (no un descuido):** `createProfile`/`deactivateProfile`
    no se envuelven — dependen de triggers de validación del estado actual del servidor
    (`enforce_max_profiles`, `protect_profile_account_deletion`) que sería riesgoso repetir a ciegas más
    tarde sin revalidar. Indicador visual de "cambios pendientes de sincronizar" en la UI — no se pidió
    una funcionalidad nueva de interfaz, solo el motor. Un chequeo de timestamp servidor-vs-local antes de
    repetir una edición de perfil encolada — se consideró y se descartó (ver revisión de diseño): como
    `updateProfile` ya es PATCH por campo, comparar por fila completa habría descartado incorrectamente un
    campo no conflictivo solo porque otro campo distinto se editó más recientemente desde otro
    dispositivo; al ser PATCH por campo, "última modificación gana" ya sale solo del orden real de
    escritura en Supabase.
  - **Verificado en vivo, no solo build/lint**: script Node (Vite-SSR) con 17 aserciones — encolar
    offline sin llamar a `executeFn`; togglear add→remove→add offline colapsa a una sola entrada con el
    último estado; reconexión + `flush()` invoca el handler correcto y vacía la cola; 2 instancias
    independientes ("2 dispositivos") editando campos DISTINTOS del mismo perfil offline terminan con
    AMBOS campos aplicados en un objeto "servidor" falso compartido (nunca uno pisando al otro); 2
    instancias editando el MISMO campo offline resuelven a un valor único, consistente, según qué flush
    llega último (nunca corrupto/duplicado); la fusión de dos ediciones offline en una sola entrada
    conserva ambos campos; una entrada encolada sobrevive a una instancia nueva de `SyncManager` sobre el
    mismo storage (simula recargar la app offline); un error real se re-lanza y nunca se encola; una
    excepción que no es el error conocido del servicio (fallo de red en pleno vuelo, con conexión) sí se
    encola. Las 17 pasaron.
  - **Build/Lint**: limpios — 0 errores, mismos 14 warnings preexistentes; bundle principal +2KB
    (esperado, código nuevo), sin acercarse al umbral de advertencia de Vite.
- **v3.2 — Backend Gateway & Observability: preparación de infraestructura, sin servidor propio ni
  cambios de UI.** Pedido del usuario: preparar una migración gradual a un Backend Gateway propio —
  capa Gateway, sistema de métricas, Health Monitor, objeto serializable para un futuro panel, cache
  metrics — sin crear un servidor todavía y sin tocar UI/Search/Landing/Login/Recommendation Engine/
  SyncManager/Playback.
  - **Auditoría (FASE 1)**: AniList se consulta desde `AniListProvider.js` (7 métodos de
    `ProviderManager`) y, por separado y a propósito, desde `searchService.js`/`characterSearchService.js`
    (cascada de búsqueda, bypass ya documentado desde v1.7 — no se tocó). Jikan se consulta desde
    `animeService.js` (20 funciones), usado por `AnimeProvider.js` (8 páginas de catálogo aún no
    migradas) y por `JikanProvider.js` (adaptador de `ProviderManager`). AnimeThemes se consulta
    únicamente desde `AnimeThemesProvider.js` (`PlaybackProviderManager`, 2 métodos). "Datos duplicados":
    `search()`/`getAnime()` ya consultan AniList Y Jikan en paralelo para el mismo id/query a propósito
    (fusión de campos, no duplicación accidental — ya documentado desde v1.9/v2.0); no se encontró ninguna
    llamada duplicada por descuido. "Críticas": `getAnime()` (cada carga de `AnimeDetail.jsx`) y
    `search()` (cada tecla en el buscador, contra el endpoint de Jikan ya documentado como el más frágil
    de toda la API).
  - **Decisión de alcance, antes de escribir código**: AnimeThemes/Playback quedan **fuera** del Gateway y
    de toda la observabilidad nueva — "Playback" está en la lista de restricciones de este sprint, y
    `api/animethemes.js` es transporte dedicado y exclusivo de ese subsistema. Se instrumentaron
    únicamente AniList y Jikan (los dos proveedores detrás de `ProviderManager`, que no está en la lista
    de restricciones). El Health Monitor y el Dashboard igual incluyen una entrada para `animethemes`,
    marcada explícitamente `tracked: false` con el motivo — para que el shape ya esté listo el día que
    esto cambie, en vez de omitirla en silencio.
  - **`src/services/gateway/Gateway.js` (nuevo, FASE 2)** — fachada de alto nivel, hoy un pass-through
    directo a los 7 métodos de `ProviderManager.js` (que sigue siendo, sin cambios, el único responsable
    de decidir proveedor/orden/merge/caché — ver docs/06_PROVIDER_MANAGER.md). Ninguna página existente
    se migró a importar desde acá (pedido explícito "No modificar la UI") — es un punto de entrada nuevo
    y paralelo, listo para que código futuro lo adopte gradualmente, y para que el día que exista un
    backend real, solo estas funciones cambien de "llamar a ProviderManager en el mismo proceso" a "hacer
    fetch a un endpoint propio", sin tocar ninguna página.
  - **`src/services/gateway/metrics.js` (nuevo, FASE 3)** — registro en memoria, `MAX_ENTRIES=200` por
    lista (acotado, nunca crece sin límite), **solo activo en desarrollo**
    (`if (!import.meta.env.DEV) return` como primera línea de cada función de registro — Vite reemplaza
    esa constante por `false` en build de producción, así que el minificador elimina el resto del cuerpo:
    verificado en vivo, el bundle de producción no creció ni un byte tras instrumentar 3 archivos
    críticos). `recordProviderCall()` (cache hit/miss/stale, duración, proveedor detectado, éxito) +
    `recordRetry()` (proveedor, status, si fue timeout de cliente) + `detectProviderTag()` (heurística
    pura: usa `result.source` si existe —ya lo pone `getAnime()`—, si no el `.source` del primer item de
    un array/`.data[]` —ya lo taggean `search()`/`getCharacters()`/etc.—, si no `'unknown'`; nunca
    inventa un proveedor que no se pueda inferir del dato real).
  - **`src/services/gateway/healthMonitor.js` (nuevo, FASE 4)** — deriva salud por proveedor
    (`availability`, `avgLatencyMs`, `lastError`, `lastSuccess`, `retryCount`) a partir de lo que
    `metrics.js` ya registró, sin hacer ninguna llamada de red propia. **Nota de honestidad**:
    `ProviderManager` nunca propaga una excepción salvo abort real (ver docs/06_PROVIDER_MANAGER.md,
    "La UI jamás conoce" fallos crudos) — así que "último error" acá significa genuinamente "última vez
    que este proveedor contribuyó un resultado vacío", no una excepción con mensaje real; documentado así
    en vez de simular un mensaje de error que no existe.
  - **`src/services/gateway/cacheMetrics.js` (nuevo, FASE 6)** — combina dos fuentes: hit/miss ratio de
    `metrics.js` (cada llamada ya trae `cacheHit`) + TTL restante por entrada viva de
    `utils/cache.js`'s nuevo `getCacheSnapshot(prefix)` (introspección de solo lectura del `Map` interno,
    namespace `pm:` — no cambia ninguna función existente de ese archivo, es un export nuevo y aparte).
  - **`src/services/gateway/dashboard.js` (nuevo, FASE 5)** — `getGatewayDashboardSnapshot()`: un objeto
    100% serializable (verificado con un roundtrip real de `JSON.stringify`/`JSON.parse`, no solo
    asumido) que combina `healthMonitor` + `cacheMetrics` — **sin ninguna pantalla ni ruta nueva**, tal
    como pide explícitamente la FASE 5 ("No crear aún la pantalla").
  - **Instrumentación mínima de 3 archivos existentes, comportamiento observable sin cambios**:
    `ProviderManager.js`'s `withCache()` (el único choque de los 7 métodos — se agregó una medición de
    tiempo + 3 llamadas a `recordProviderCall` en sus 3 ramas ya existentes —cache hit, fresco, stale—,
    la lógica de caché en sí no se tocó) y `api/jikan.js`/`api/anilist.js` (una llamada a `recordRetry()`
    dentro del interceptor de reintento YA existente, en la misma línea donde ya se incrementaba
    `config.__retryCount` — no se tocó cuándo/cómo se reintenta, solo se agregó la observación).
  - **Verificado en vivo, no solo build/lint**: script Vite-SSR con 24 aserciones — `detectProviderTag`
    con fixtures puros (5); `Gateway.getAnime(20)` (Naruto) contra las APIs reales, pass-through fiel a
    `ProviderManager`, primera llamada cache MISS con proveedor detectado `anilist+jikan` (5); segunda
    llamada al mismo id, cache HIT, 0ms (2); Health Monitor refleja las llamadas reales, `animethemes`
    marcado `tracked:false` (3); Cache Metrics con hit ratio exacto (0.5 tras 1 hit/1 miss) y TTL restante
    real > 0 (4); **fallback real, no simulado**: una entrada manualmente sembrada como vencida
    (`setCached` con TTL negativo) para un id inexistente (que hace que AMBOS proveedores reales
    devuelvan vacío) se sirvió igual gracias al mecanismo de "último resultado válido" ya existente de
    `ProviderManager` — y la métrica lo registró correctamente como `stale: true` (2); Dashboard
    serializable con los 3 proveedores (3). **Bonus real, no buscado a propósito**: la corrida capturó
    4 reintentos reales de Jikan (504) durante la prueba — prueba en vivo, sin mockear nada, de que
    `recordRetry()` funciona de punta a punta contra la degradación real de Jikan ya documentada en toda
    esta sesión. Las 24 pasaron.
  - **Qué queda preparado para un backend propio** (FASE 2, resumen): el día que exista un servidor real,
    el plan es que `Gateway.js` deje de llamar a `ProviderManager` en el mismo proceso y en cambio haga
    `fetch` a un endpoint propio — ninguna página necesita tocarse porque ya ninguna importa de
    `ProviderManager` directo salvo a través de este Gateway (una vez que se migren, en un sprint futuro).
    El sistema de métricas/health monitor/cache metrics ya tiene la forma de datos que un backend real
    reportaría igual (duración, proveedor, cache hit, reintentos) — no haría falta rediseñarlo, solo
    cambiar de dónde vienen los números.
  - **Build/Lint**: limpios — 0 errores, mismos 14 warnings preexistentes; bundle de producción
    **byte-idéntico** antes/después (365.91KB) — la instrumentación entera se elimina en el build gracias
    al gate `import.meta.env.DEV`.

## Objetivo final

AnimeCLZ debe sentirse como un producto comercial, listo para seguir creciendo.
