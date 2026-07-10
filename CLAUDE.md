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

**Arquitectura de proveedores (v1.3):** ninguna página/componente debe importar un proveedor concreto
(Jikan, AniList, TMDB) ni `services/animeService.js` directamente — siempre importan desde
`providers/AnimeProvider.js`, el único punto de entrada de datos de anime para toda la app.
- `providers/jikan/JikanProvider.js` es la implementación activa hoy — re-exporta `services/
  animeService.js` (la lógica real no se movió, para no arriesgar reescribir código ya probado).
- `providers/anilist/AniListProvider.js` y `providers/tmdb/TMDBProvider.js` son **stubs sin
  implementar** (arquitectura preparada) — cada método lanza un error claro si se llega a invocar (ver
  `providers/stubProvider.js`). No lo son "por error"; no completar su implementación sin que se pida.
- Cambiar el proveedor activo en el futuro es cambiar el único `export * from './jikan/JikanProvider'`
  de `AnimeProvider.js` — ningún otro archivo debería necesitar tocarse.
- Cualquier función nueva de catálogo se agrega en `animeService.js` (mismo lugar de siempre) y queda
  re-exportada automáticamente a través de `JikanProvider.js` → `AnimeProvider.js`.

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

Jikan es una API pública sin key, con límite de tasa y caídas 5xx intermitentes bajo carga (observado
empíricamente, y confirmado independientemente con `curl` fuera de la app: el endpoint `/anime?q=` de
búsqueda es notablemente más frágil que el resto). Mitigaciones ya implementadas — no las quites:
- `api/jikan.js` reintenta automáticamente (con backoff exponencial, 3 intentos) respuestas 429 y 5xx.
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
- `api/jikan.js` (Sprint 3.6) encola **todas** las peticiones salientes por una cola de concurrencia
  propia (máx. 2 en simultáneo, ≥180ms entre inicios) antes de llegar a axios. Por eso `Home.jsx` y
  `AnimeDetail.jsx` ya **no** necesitan un `STAGGER_MS`/`initialDelay` manual por página — el
  espaciado entre peticiones es responsabilidad centralizada de `api/jikan.js`, no de cada página.
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
    bucket `avatars` de la migración 0010, `services/avatarService.js`) y `personaje` (elegido desde
    Jikan, `searchCharacters`/`getCharacterAnime` en `animeService.js`). El grid de búsqueda de
    personajes solo muestra imagen + nombre — el endpoint de búsqueda global de Jikan (`/characters`) no
    trae a qué anime pertenece cada uno en la respuesta de lista (a diferencia de
    `/anime/{id}/characters`); el anime se resuelve con una sola llamada extra recién al confirmar un
    personaje, no para los 12 resultados del grid a la vez.
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
- `watch_history` (tabla, también por perfil desde v1.5) está preparada para "Continuar viendo" pero
  **nada la escribe todavía** — no hay reproductor. `services/historyService.js` (`listHistory(profileId)`/
  `upsertProgress(accountId, profileId, {...})`) y `/historial` ya existen para cuando lo haya (fase
  "Streaming" del ROADMAP); no fabricar entradas falsas mientras tanto.
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
  comentarios,configuracion}` (protegidas por el rol del perfil activo, ver sección Autenticación).
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

## Objetivo final

AnimeCLZ debe sentirse como un producto comercial, listo para seguir creciendo.
