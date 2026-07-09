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
- **Perfiles múltiples por cuenta (v1.1, estilo Netflix):** una cuenta (login con Google/correo) puede
  tener varios perfiles (`profiles_account`, migración 0009) — no varias cuentas. Cada perfil tiene su
  propio nombre, avatar, color y rol. `context/ProfileContext.jsx` + `hooks/useProfile.js` son la fuente
  única de verdad del perfil activo; se recuerda en `localStorage` por cuenta
  (`animeclz:activeProfile:{accountId}`) para no mostrar el selector en cada visita. Tras el login/
  registro, `Login.jsx`/`Register.jsx` navegan a `/perfiles` (no directo a Inicio); `Layout.jsx`/
  `ProtectedRoute.jsx` refuerzan que ninguna pantalla se muestre con sesión activa pero sin perfil
  elegido. El primer perfil de cada cuenta se autogenera al registrarse (trigger en migración 0009) y es
  el único que no se puede eliminar (`defaultProfileId` en `useProfile()`) — `Profile.jsx` ("Mi Perfil")
  lo refleja. **Importante:** Favoritos/Mi Lista/Historial siguen siendo por CUENTA, no por perfil — no
  se fragmentaron en v1.1 a propósito (ver ROADMAP.md); el sistema de perfiles hoy solo cambia identidad
  visual y rol, no qué contenido ve cada perfil.
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
  lógica vía `hooks/useUserCollection.js` — no dupliques ese patrón para una tercera lista sin pasar
  también por ahí. Todas las acciones de guardar (card, Hero, AnimeDetail) exigen sesión: si no hay
  usuario, redirigen a `/iniciar-sesion` en vez de fallar silenciosamente o loguear localmente.
- `watch_history` (tabla) está preparada para "Continuar viendo" pero **nada la escribe todavía** — no
  hay reproductor. `services/historyService.js` y `/historial` ya existen para cuando lo haya (fase
  "Streaming" del ROADMAP); no fabricar entradas falsas mientras tanto.
- `ratings`, `comments`, `notifications` son tablas preparadas (con RLS) sin interfaz — no construir UI
  para ellas hasta que se pida explícitamente.
- Migraciones SQL organizadas en `supabase/migrations/000N_*.sql` (ver `supabase/migrations/README.md`
  para cómo aplicarlas) — no se ejecutaron contra ningún proyecto real todavía. Todas las tablas tienen
  Row Level Security: cada usuario solo lee/escribe sus propias filas (`auth.uid() = user_id`).
- **Panel de Administrador (v0.10):** arquitectura y navegación implementadas, sin CRUD todavía (ver
  Notas técnicas más abajo y ROADMAP.md).

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
- `AnimeCard` ya no tiene un botón "Ver detalles" visible — el hover revela solo tres íconos (Ver/
  Favoritos/Información) sin fondo ni caja; el bloque de título es siempre un link (para que funcione sin
  hover en táctil). No reintroducir un botón de texto sobre la card. El ícono de Favoritos exige sesión
  (redirige a `/iniciar-sesion` si no hay usuario); "Mi Lista" no vive en la card compacta, solo en
  Hero/AnimeDetail (ver sección Autenticación).
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
- **Panel de Administrador (v0.10):** implementada la arquitectura, navegación y diseño visual — **sin
  CRUD todavía** (pedido explícito). `layout/admin/AdminLayout.jsx` (+ `AdminSidebar`/`AdminHeader`) es un
  shell propio, sin Navbar/Footer públicos; el sidebar filtra sus ítems por rol (`Usuarios` y
  `Configuración` solo para `admin`). Componentes reutilizables en `components/admin/`: `StatCard`,
  `DataTable` (tabla base con loading/error/empty), `TableToolbar` (búsqueda + filtros),
  `AdminPageHeader`. `services/adminService.js` trae datos reales de Supabase donde ya hay una policy de
  SELECT pública-para-autenticados (`profiles` → Usuarios/Dashboard, `comments` → Comentarios); Animes y
  Temporadas reutilizan `animeService.js` (Jikan, igual que Explorar). Episodios/Personajes/Estudios/
  Noticias no tienen fuente de datos real todavía (Jikan solo da episodios/personajes por anime, no un
  listado global; Estudios y Noticias necesitarían una tabla propia) — se dejaron con la tabla armada y
  un `EmptyState` explicando por qué, no con contenido inventado. No agregar botones de crear/editar/
  eliminar reales en estas vistas sin que se pida explícitamente (ver ROADMAP.md).
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

## Objetivo final

AnimeCLZ debe sentirse como un producto comercial, listo para seguir creciendo.
