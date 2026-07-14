# ROADMAP.md

Plan de desarrollo de **AnimeCLZ**, organizado en sprints. Este documento organiza el trabajo; las reglas
de arquitectura, diseño y flujo de trabajo están en [CLAUDE.md](CLAUDE.md) y aplican a cada sprint.

---

## Sprint 1 — Fundación (completado)

- ✔ Arquitectura
- ✔ Diseño
- ✔ Hero
- ✔ Navbar
- ✔ API

**Estado:** cerrado. Base de carpetas, sistema de diseño, Hero, Navbar y conexión a Jikan API listos.

---

## Sprint 2 — Home profesional y navegación de catálogo (completado)

- ✔ **Home profesional** — Hero real (anime tomado del top-rated actual, sin datos mock) + 5 carruseles
  (🏆 Top Anime, 📅 Temporada Actual, 📈 Más Populares, ⭐ Mejor Valorados, 💡 Recomendados) + sección
  🧭 Explorar (banner CTA) + sección 🎭 Géneros (píldoras de navegación a Explorar filtrado). `src/data/movies.js` fue eliminado.
- ✔ **Carruseles** — `MovieRow` rediseñado, alimentado 100% por Jikan, con Skeleton/Error/Empty propios.
- ✔ **Buscador** — página `/buscar` real: input con debounce, filtros, loading (skeleton), error y
  estado vacío.
- ✔ **Página Explorar** (`/explorar`) — catálogo general con grid + filtros + paginación; acepta
  `?genre=` en la URL (usado por las píldoras de género de Home).
- ✔ **Página Temporada** (`/temporada`) — grid paginado de `getCurrentSeason`.
- ✔ **Género** — implementado como filtro dentro de Explorar/Buscar + sección de navegación en Home (no
  como páginas estáticas por género) para que escale a cualquier género sin crear una ruta nueva por cada uno.
- ✔ **Cards** — modelo único, hover elegante (elevación + zoom, sin brillo), botones explícitos "Ver
  detalles" y "Agregar a Mi Lista", géneros visibles.
- ✔ **ErrorBoundary** global (`src/components/ErrorBoundary.jsx`).
- ✔ **Lazy loading** — rutas con `React.lazy`/`Suspense` (code-splitting por página) además del lazy
  loading de imágenes ya existente.

Adelantado desde el Sprint 3 (porque Hero/MovieCard necesitaban botones que funcionaran de verdad, no
placeholders): **Favoritos** (`FavoritesContext`, localStorage), **Mi Lista** (`/mi-lista`, ya funcional)
y una versión básica de **Detalle** (`/anime/:id`, con trailer si Jikan lo expone). El Sprint 3 profundiza
sobre esa base (episodios completos, recomendaciones detalladas, historial) en vez de partir de cero.

También se resolvió una fragilidad real detectada al probar contra la API pública: Jikan devuelve 429/5xx
bajo carga y a veces repite `mal_id` en una misma lista — ver "Reintentos y caché" en CLAUDE.md.

**Criterio de aceptación:** Home y todas las páginas de este sprint muestran únicamente datos reales de
Jikan, sin ningún dato inventado. Verificado en navegador (Home, Explorar, Buscar, Detalle, Mi Lista,
menú móvil, navegación por género) con capturas reales.

---

## Sprint 3 — Ficha de Detalle completa (completado, salvo Historial)

- ✔ **Página Detalle reconstruida por completo** — banner grande, poster, título, título japonés,
  sinopsis completa, puntuación, ranking, popularidad, estado, tipo, duración, año, temporada, estudios,
  productores, licenciantes, clasificación, géneros, temas y demografía. Todo real, sin datos inventados.
- ✔ **Sección Información** — grid de metadatos (`InfoGrid`, nuevo componente reutilizable).
- ✔ **Personajes principales** — elenco `role: Main` + actor de voz japonés (`CharacterCard`, nuevo
  componente reutilizable).
- ✔ **Trailer** — embed real si Jikan lo expone; `EmptyState` elegante si no existe.
- ✔ **Recomendados** — carrusel real reutilizando `MovieRow`/`AnimeCard` (sin componente nuevo).
- ✔ **Relacionados** — precuelas/secuelas/spin-off/OVA/películas/especiales agrupados por tipo de
  relación, como lista de enlaces (Jikan no da póster/score para relaciones, así que no se simulan).
- ✔ **Galería** — grid de imágenes reales, con lazy loading.
- ✔ **Botones** — Ver Ahora (reproduce el trailer), Agregar a Mi Lista (reutiliza `FavoritesContext`),
  Compartir (Web Share API con fallback a copiar enlace). *Nota:* "Favoritos" no se implementó como un
  sistema aparte de "Mi Lista" — habría duplicado el mismo estado sin un propósito distinto; ver
  TODO.md.
- ✔ **Estados** — Skeleton/Loading/Error/Sin resultados en cada sección, de forma independiente (una
  sección puede fallar sin bloquear las demás).
- ✔ Renombrado `MovieCard` → `AnimeCard` en todo el proyecto (Home, catálogo, Mi Lista, Recomendados).

**Episodios** — no incluido: Jikan no expone streaming, y sin reproductor propio (fase "Streaming" en
TODO.md, muy posterior) un listado de episodios sin nada que reproducir no aporta valor real todavía.
Se retoma cuando el reproductor exista.

**Historial** — pendiente. Necesita persistencia por usuario; Firebase llega en el Sprint 4, así que se
recomienda resolver Historial junto con esa migración en vez de duplicar el patrón de `FavoritesContext`
dos veces.

**Criterio de aceptación:** la ficha de detalle muestra información completa, personajes, trailer,
recomendados, relacionados y galería reales de la API, con estados de carga/error/vacío en cada sección.
Verificado en navegador (desktop y móvil) con capturas reales.

---

## Sprint 3.5 — Arreglo del buscador + rediseño visual completo (completado)

**Buscador — causa real y arreglo.** Auditoría completa del flujo (`searchAnime` → `discoverAnime` →
`fetchList` → `useFetch` → `Search.jsx` → `MovieGrid`/`AnimeCard`/`Filters`/`Pagination`). Conclusión:
no era un bug de lógica que devolviera vacío en silencio — `discoverAnime` forzaba `order_by=popularity
&sort=asc` en **toda** búsqueda por texto, incluso sin que el usuario lo pidiera. Eso añade carga extra
al endpoint `/anime?q=` de Jikan, que ya es el más frágil de la API (confirmado de forma independiente
con `curl` fuera de la app: fallos 504 frecuentes incluso con una sola petición cada varios segundos).
Arreglado:
- ✔ `discoverAnime`/`searchAnime` ya no fuerzan un orden por defecto — Buscar solo lo envía si el
  usuario lo elige explícitamente en Filtros; Explorar/Temporada/Top siguen con su orden por defecto
  (no buscan por texto, así que no tiene el mismo costo).
- ✔ Reintento con backoff exponencial (3 intentos) en `api/jikan.js`, en vez de 2 con backoff fijo.
- ✔ `ErrorState` ahora muestra un mensaje amable y específico ("no pudimos conectar con MyAnimeList...
  inténtalo de nuevo en unos segundos") con botón Reintentar — nunca una pantalla en blanco, verificado
  provocando el fallo real (Jikan estaba caído en el momento de la prueba).
- ✔ Verificado con las búsquedas pedidas (Naruto, One Piece, Bleach, Frieren, Solo Leveling, Dragon
  Ball, Kimetsu) en mayúsculas/minúsculas/parcial — la búsqueda de Jikan ya es insensible a
  mayúsculas y hace match parcial de forma nativa; no hacía falta lógica adicional para eso.

**Rediseño visual — identidad propia, sin Netflix.** Paleta completamente nueva (ver CLAUDE.md/DESIGN.md
para valores exactos): fondo casi negro, dúo de azules suaves (`Primary`/`Secondary`) como único acento,
cero rojo/amarillo/naranja/morado. Rediseñados: Navbar (indicador de pestaña activa tipo píldora, blur
más marcado), Hero (banner más grande, muestra Estado además de puntuación/año/tipo/géneros, botones
"Ver Ahora"/"Mi Lista"), `AnimeCard` (sombra suave con tinte de `Primary` al hover, blur en el overlay,
Estado visible), `MovieRow` (títulos más grandes, más espacio, flechas con blur), sistema de botones
(píldora, gradiente suave en el primario), y todos los formularios (selects/inputs con el mismo
lenguaje). Nada de componentes eliminados ni duplicados — todo reutiliza `AnimeCard`/`MovieRow`/`Button`
existentes con nuevas clases.

**Criterio de aceptación:** build y dev sin errores; búsquedas de ejemplo verificadas en navegador;
ningún rojo/amarillo/naranja/morado en la UI; toda página revisada visualmente en desktop y móvil.

---

## Sprint 3.6 — Refinamiento visual, UX y limpieza (completado)

- ✔ **Buscador, segunda pasada** — se auditó de nuevo el flujo completo. La causa raíz confirmada (con
  `curl` fuera de la app, repetida en varias sesiones) es que el endpoint de búsqueda de Jikan (`/anime?q=`)
  es sustancialmente más inestable que el resto de la API, independientemente de nuestros parámetros.
  Mitigado con una **cola de concurrencia centralizada** en `api/jikan.js` (máx. 2 peticiones en
  simultáneo, ≥180ms entre inicios, para toda la app) que reemplaza el escalonado manual por página
  (`STAGGER_MS` eliminado de `Home.jsx`/`AnimeDetail.jsx`), más reintentos con backoff exponencial
  (4 intentos). No se promete disponibilidad al 100% — es una limitación externa real, documentada en
  CLAUDE.md.
- ✔ **Selects nativos → `Select` propio** — nuevo componente (`components/ui/Select.jsx`) sobre Headless
  UI `Listbox` (nueva dependencia: `@headlessui/react`), con panel animado (Framer Motion), scroll
  personalizado, checkmark de selección. Reemplaza los 4 `<select>` de `Filters.jsx`.
- ✔ **Mensajes de error** — ninguna pantalla vuelve a mencionar "MyAnimeList" (ni "Jikan"); mensajes
  genéricos y amables en `ErrorState`, `EmptyState`, Footer, Search/Season/Top.
- ✔ **Favicon** — corregido (seguía en rojo desde el Sprint 2, un olvido real detectado en esta auditoría).
- ✔ **`AnimeCard` rediseñada** — sin botón "Ver detalles"; hover revela tres íconos sueltos (Ver/Mi
  Lista/Información) sin caja ni fondo; indicador de favorito como glyph, no botón; el bloque de título
  es siempre un link para que funcione igual en táctil.
- ✔ **Microanimaciones** — transición de página en `Layout.jsx`, `MovieGrid` con `AnimatePresence` entre
  loading/error/vacío/resultados, `--default-transition-duration: 220ms` en el tema para que **todo**
  `transition-*` sin duración explícita caiga en el rango 180-300ms pedido (antes usaban el default de
  Tailwind, 150ms).
- ✔ **Skeleton con shimmer** — reemplaza el pulso plano anterior.
- ✔ **Espaciado** — reducido un poco el padding vertical de `MovieRow` y del Hero (el "mucho aire" del
  Sprint 3.5 se sintió excesivo en la práctica); balance ajustado, no es un valor fijo definitivo.
- ✔ **Consistencia visual** — radios (`rounded-lg`→`rounded-xl`, chips `rounded-md`→`rounded-full`) y
  duraciones (150ms→200ms, 500ms→280ms) unificados en varios puntos de `AnimeDetail`/`AnimeCard`/`Hero`
  que se habían quedado desalineados del resto del sistema.
- ✔ **`eslint.config.js` creado** — no existía ningún config desde el inicio del proyecto; `npm run lint`
  fallaba en silencio. Con el config real (react/react-hooks/react-refresh) se confirmó que no había
  imports muertos ni código duplicado real (los falsos positivos de una primera versión del config sin
  soporte JSX fueron descartados). Se corrigieron 2 problemas reales que el lint sí encontró: una mutación
  de ref durante el render en `useFetch`, y `__dirname` sin definir en `vite.config.js` (config sin
  globals de Node). Queda un warning conocido y documentado (`react-hooks/set-state-in-effect` en
  `useFetch`) — ver "Recomendaciones para el próximo sprint" más abajo.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios (0 errores); todas las rutas
verificadas en navegador; favoritos persisten; responsive revisado en desktop/tablet/móvil; consola sin
errores de la app (solo 429/504 intermitentes de Jikan, ya mitigados).

---

## v0.8 — Renovación mayor UI/UX (completado, con exclusiones documentadas)

**Identidad visual — segunda paleta.** Fondo/superficie más profundos (azul-noche en vez de casi-negro
puro), `Card`/`Hover` separados como tokens distintos (antes uno solo cubría ambos roles), bordes ahora
blanco-translúcido (`rgba(255,255,255,.08)`) en vez de un gris sólido, `Primary Hover` reintroducido como
token explícito. `Secondary` (`#7C5CFF`) es azul-violeta — única excepción documentada a "no morado",
reservada a acentos puntuales (nunca el botón `primary`, ver CLAUDE.md/DESIGN.md).

**Hero → carrusel real.** `getFeaturedSlides` trae 6 animes reales del top actual (antes 1 solo). Nuevo
`Hero`: autoplay cada 8s (se pausa en hover, se detiene con `prefers-reduced-motion`), swipe/drag en
cualquier dispositivo, indicadores de punto, tira de miniaturas (6), fade+slide al cambiar de slide.
Botones "Ver Ahora"/"Mi Lista" (ver nota sobre "Favorito" abajo).

**Calidad de imagen.** El problema real: Jikan no da un banner panorámico, solo pósters verticales, y
mostrarlos a ancho completo los recortaba brutalmente. Arreglado con un patrón de dos capas (fondo
ambiental = mismo póster desenfocado y escalado; primer plano = póster nítido en su relación de aspecto
real, nunca estirado) en Hero y en el banner de `AnimeDetail`. `animeService.js` ahora expone
`poster`/`posterSmall` y los componentes arman un `srcset` simple (`1x`/`2x`).

**Buscador — tercera revisión + autocomplete nuevo.** La causa raíz (endpoint de búsqueda de Jikan
frágil) es la misma de Sprint 3.5/3.6 — no hay una cuarta causa nueva que corregir, y no se puede
prometer 100% de disponibilidad de un servicio externo que no controlamos. Lo que sí es nuevo: caché de
resultados de búsqueda (3 min) para no repetir la misma llamada frágil, y un buscador de resultados
instantáneos en el Navbar (`NavbarSearch.jsx`, `quickSearchAnime`) — barra que se expande, resultados en
vivo con debounce, "Ver todos los resultados" hacia `/buscar`.

**Filtros — chips + Select.** Género/Formato/Estado/Puntuación ahora son `ChipGroup` (un vistazo, un
clic); Orden/Año siguen en `Select` (demasiadas opciones para chips). Se sumaron los filtros de Estado
(`status` de Jikan) y Puntuación mínima (`min_score`) que no existían antes.

**Cards.** Se reintrodujo "Formato" (tipo) en el pie de la card junto a año/estado/géneros (se había
quitado en el Sprint 3.5). El hover de tres íconos (Ver/Mi Lista/Información) del Sprint 3.6 se mantiene
sin cambios.

**Ficha de Detalle — Episodios real.** Se reconsideró la decisión del Sprint 3 de no construir Episodios:
Jikan sí expone metadatos reales por episodio (número, título, fecha, puntuación) aunque no aloja video,
y esa información por sí sola es real y útil (MAL/AniList la muestran igual). Nueva sección entre Trailer
y Relacionados. "Temporadas" no es una sección nueva — ya está cubierta por Relacionados (secuelas) e
Información (temporada/año).

**Microanimaciones y rendimiento.** Scroll con rueda del mouse redirigido a horizontal en los carruseles
(`MovieRow`) — antes solo funcionaba con touch/arrastre. `EmptyState` ahora acepta `onRetry` (varios
endpoints de Jikan, no solo el de búsqueda, sirven una respuesta 200 vacía bajo carga en vez de un error
limpio — un botón de reintento ahí es barato y a veces evita un "no hay nada" falso). `memo` en
`CharacterCard` (ya estaba en `AnimeCard`).

**Preparación de arquitectura (sin implementar):**
- *Supabase:* `animeService.js` ya expone funciones por nombre de recurso en vez de que las páginas
  llamen a Jikan directamente — ese es el punto de corte para que, cuando exista Supabase, esas
  funciones lean de ahí primero y usen Jikan solo como importador de respaldo, sin tocar páginas/hooks.
  No se instaló ningún cliente de Supabase ni se creó configuración — no hay proyecto real todavía.
- *Panel de Administrador:* no implementado (pedido explícito). Cuando se aborde, va en rutas propias
  (`/admin/*`) protegidas por auth, separado de las páginas públicas.

**Exclusiones documentadas (no fabricadas):**
- **Continuar viendo** y **Nuevos episodios** — necesitan historial real por usuario, que no existe sin
  auth/base de datos (Sprint 4). Se muestran cuando haya datos reales, no antes.
- **Noticias** — Jikan no tiene un feed de noticias; no hay una fuente real que mostrar todavía.
- Estas tres NO aparecen en Home con contenido inventado — omitirlas es la aplicación directa de "nunca
  inventar datos" (CLAUDE.md), no un olvido.
- **"Favorito" como botón separado de "Mi Lista":** pedido dos veces (Sprint 3 y v0.8) con íconos
  distintos (♥ vs. +). Se mantiene consolidado en un solo `FavoritesContext` — un segundo sistema de
  "me gusta" sin persistencia ni propósito distinto habría sido complejidad sin beneficio real. Si el
  producto necesita de verdad dos listas distintas (p. ej. "me gusta" vs. "ver después"), es una
  decisión de datos para cuando exista Supabase/Firebase, no una maqueta visual ahora.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; todas las rutas, el buscador (con
autocomplete), los filtros, las cards y las animaciones verificados en navegador; responsive revisado en
desktop/tablet/móvil; cero rojo/amarillo/naranja en la UI.

---

## v0.9 — Módulo completo de autenticación + Supabase (completado, con exclusiones documentadas)

Cumple, con Supabase en vez de Firebase, lo que el Sprint 4 planeaba (ver nota más abajo) — Jikan sigue
siendo la única fuente de datos de anime; Supabase solo cubre lo que Jikan nunca pudo: cuentas, listas
persistentes, historial.

**Supabase.** `@supabase/supabase-js` instalado; `src/lib/supabase.js` crea el cliente desde
`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` (`.env.example` agregado). Solo la Publishable/anon
key se usa en el frontend — nunca la Secret Key. Si las variables no están definidas, el cliente es
`null` y el resto de la app (catálogo, búsqueda, detalle) sigue funcionando igual que antes.

**Autenticación.** Login con correo/contraseña y con Google, registro (con confirmación por correo),
recuperar/restablecer contraseña, cerrar sesión — todo en `services/authService.js`, con mensajes de
error traducidos a español (mismo criterio que los errores de Jikan: nunca texto técnico crudo).
`context/AuthContext.jsx` + `hooks/useAuth.js` exponen la sesión globalmente; persistencia y refresh de
token los maneja el propio cliente de Supabase (`persistSession`/`autoRefreshToken`).

**Rutas protegidas.** `layout/ProtectedRoute.jsx` protege `/mi-lista`, `/favoritos`, `/historial` y
`/perfil` — sin sesión, redirige a `/iniciar-sesion` y vuelve a la página original tras el login.

**Navbar.** Sin sesión: "Iniciar sesión"/"Crear cuenta". Con sesión: avatar con iniciales y un menú
desplegable (Headless UI `Menu`, mismo patrón visual que `Select.jsx`) con Perfil/Mi Lista/Favoritos/
Cerrar sesión.

**Favoritos y Mi Lista, ahora sí separados.** La nota del v0.8 sobre esto ya anticipaba el criterio: "si
el producto necesita de verdad dos listas distintas... es una decisión de datos para cuando exista
Supabase". Con Supabase real, se separaron: `favorites` (♥, "me gusta") y `watch_later` ("Mi Lista",
"quiero verlo después") son tablas y contextos distintos (`FavoritesContext`/`useFavorites()` y
`WatchLaterContext`/`useWatchLater()`, compartiendo lógica vía `hooks/useUserCollection.js`). La card
compacta (`AnimeCard`) conserva sus tres íconos de hover de siempre, solo que el corazón ahora es
Favoritos; Hero y AnimeDetail muestran ambos botones (♥ Favorito / 🔖 Mi Lista) por separado. Toda acción
de guardar exige sesión — sin ella, redirige a `/iniciar-sesion` en vez de fallar en silencio.

**Perfil real.** Deja de ser un placeholder: muestra avatar (iniciales), permite editar
username/bio (`profiles`, con trigger que crea la fila automáticamente al registrarse) y cerrar sesión.

**Base de datos y RLS.** Migraciones organizadas en `supabase/migrations/000N_*.sql` (no ejecutadas contra
ningún proyecto real — ver `supabase/migrations/README.md` para aplicarlas): `profiles`, `favorites`,
`watch_later`, `watch_history`, `ratings`, `comments`, `notifications`. Todas con Row Level Security:
cada usuario solo accede a sus propias filas.

**Preparado sin interfaz (a propósito):**
- `watch_history`/"Continuar viendo" — tabla y `services/historyService.js` listos, y ya existe la
  página `/historial`, pero nada la escribe todavía: no hay reproductor real (fase "Streaming").
- `ratings` y `comments` — tablas con RLS listas; sin interfaz. Se construyen cuando se pida
  explícitamente.
- `notifications` — tabla lista, sin política de `insert` para el rol `authenticated` a propósito (se
  crearían desde el backend/service role, no desde el cliente); sin interfaz.

**No implementado (pedido explícito):**
- Panel de Administrador — su arquitectura llegó después, en v0.10 (ver abajo).
- CRUD de animes, subida de episodios — no implementado.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; registro, login (correo y Google),
recuperar/restablecer contraseña, cerrar sesión, rutas protegidas, Favoritos y Mi Lista como listas
independientes, y Perfil editable, todo verificado sin romper ninguna pantalla existente.

---

## v0.10 — Panel de Administración: arquitectura (completado, sin CRUD a propósito)

Arquitectura, navegación, layout y diseño visual del Panel de Administración — el CRUD real (crear/
editar/eliminar contenido) queda para otra pasada, pedido explícitamente así.

**Roles.** Columna `role` en `profiles` (migración 0008): `admin`/`editor`/`moderador`/`usuario`, por
defecto `usuario`. Protegida con un trigger (`protect_profile_role`) que impide que un usuario cambie su
propio rol a menos que ya sea `admin` — necesario porque `profileService.updateProfile` hace un UPDATE
normal sin filtrar columnas, y la policy de RLS ya permitía editar la propia fila.

**Rutas protegidas por rol.** `ProtectedRoute` ahora acepta un prop `roles`: con sesión pero sin el rol
requerido, redirige a Inicio (no a Login, ya que sí inició sesión). `/admin/*` completo está detrás de
`roles={STAFF_ROLES}` (admin/editor/moderador). Se corrigió una condición de carrera real durante el
desarrollo: el estado de "perfil cargando" se derivaba con un booleano aparte que podía quedar en `false`
un instante después del login (antes de que el efecto de traer el perfil arrancara), lo que habría
rebotado a un admin legítimo a Inicio en la primera carga. Se resolvió derivando ese estado por
comparación (`profileFetchedFor !== userId`) en vez de un segundo `useState`.

**Layout separado.** `layout/admin/AdminLayout.jsx` + `AdminSidebar` + `AdminHeader` — sin Navbar/Footer
públicos. Sidebar fija en desktop, drawer deslizante con overlay en mobile (mismo patrón de animación que
el menú mobile del Navbar público). El sidebar filtra sus ítems por rol: Usuarios y Configuración solo
para `admin`.

**Acceso.** Cuentas con rol de staff ven "Panel de Administración" en el menú de cuenta (`AccountMenu`,
el mismo componente que ya usaba el Navbar público) — no hay otra forma de llegar a `/admin` desde la UI
pública, a propósito.

**Componentes reutilizables (`components/admin/`):** `StatCard`, `DataTable` (tabla base con
loading/error/empty, sin lógica de datos propia), `TableToolbar` (búsqueda + slot de filtros),
`AdminPageHeader`. Pensados para que el futuro CRUD los reutilice en vez de reimplementar tablas por
sección.

**Las 10 vistas:**
- *Dashboard* — 4 métricas reales (usuarios, equipo, comentarios, calificaciones — conteos de Supabase,
  no inventados; muestran "—" si Supabase no está configurado) + tabla de usuarios recientes.
- *Animes* — catálogo de Jikan en modo lectura, mismo servicio que Explorar (búsqueda + filtro de
  formato/estado + paginación, todo real).
- *Temporadas* — anime de la temporada actual (Jikan `/seasons/now`); búsqueda y filtro de formato son
  del lado del cliente porque ese endpoint no soporta `q`.
- *Usuarios* — tabla `profiles` real (búsqueda por nombre, filtro por rol, paginación real). Sin edición
  de rol desde aquí todavía (eso es CRUD).
- *Comentarios* — tabla `comments` real (estará vacía en la práctica: nada la escribe todavía).
- *Episodios, Personajes, Estudios, Noticias* — sin fuente de datos real: Jikan solo da episodios/
  personajes por anime, no como listado global; Estudios (Jikan sí tiene `/producers`, no integrado
  todavía) y Noticias (no hay fuente) necesitan trabajo propio. Se dejaron con la tabla y columnas ya
  definidas y un `EmptyState` que explica por qué, en vez de datos de relleno.
- *Configuración* — sin controles interactivos a propósito: no hay tabla de configuración en Supabase
  todavía, y un toggle que no persiste nada sería peor que no tenerlo. Documenta los grupos previstos
  (General, Apariencia, Notificaciones, Roles y permisos).

**No implementado (pedido explícito):**
- CRUD completo de cualquier sección (crear/editar/eliminar Animes, Episodios, Personajes, Estudios,
  Noticias; editar rol o eliminar un Usuario; moderar Comentarios).
- Integración de Estudios con `/producers` de Jikan.
- Tabla de Noticias y su CRUD.
- Tabla de Configuración y su CRUD.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; las 10 vistas navegables desde el
sidebar (filtrado por rol); un usuario sin rol de staff no puede entrar a `/admin/*` (redirige a Inicio);
Animes/Temporadas/Usuarios/Comentarios muestran datos reales con búsqueda/filtro/paginación funcionando;
ninguna pantalla existente se rompió.

---

## v1.1 — Sistema de perfiles + página institucional (completado, con exclusiones documentadas)

**Perfiles múltiples estilo Netflix.** Una cuenta puede tener varios perfiles (`profiles_account`,
migración 0009) — no varias cuentas. Cada perfil: nombre, avatar (inicial+color / imagen propia /
personaje de Jikan), color y rol propio. Pantalla "¿Quién está viendo AnimeCLZ?" (`/perfiles`) tras el
login/registro; "Cambiar Perfil" queda disponible en todo momento desde el menú de cuenta. El primer
perfil de cada cuenta se autogenera al registrarse y es el único que no se puede eliminar.

**El rol que importa se movió al perfil.** Hasta v0.10, `ProtectedRoute roles={STAFF_ROLES}` leía
`profiles.role` (rol de la CUENTA). Ahora lee `profiles_account.rol` (rol del PERFIL activo) — así,
dentro de una misma cuenta administradora, un perfil "Invitado" o "Niños" no hereda acceso al Panel de
Administración solo por compartir cuenta con "Leonardo (Administrador)". Se agregó un trigger
(`sync_default_profile_rol`) para que, al elevar una cuenta a admin desde el SQL Editor (el único camino
que existe para la primera cuenta admin, ver v0.10), el perfil por defecto de esa cuenta quede
sincronizado automáticamente — sin ese trigger, el Panel de Administración nunca habría aparecido para
nadie tras ese único paso manual documentado en v0.10.

**Bug real encontrado y corregido durante el desarrollo.** El estado "perfiles cargando" se calculó al
principio con un booleano de estado aparte (mismo patrón que se usó — y ya había dado un problema real —
en `AuthContext` durante v0.10). Se corrigió antes de integrarlo, derivándolo por comparación
(`profilesFetchedFor !== accountId`) en vez de un segundo `useState`, replicando la solución que ya
existía para el mismo tipo de condición de carrera en `AuthContext`.

**Avatares.** Tres modos en `AvatarPicker.jsx`: inicial + color (por defecto), imagen propia (Supabase
Storage, bucket `avatars`, migración 0010, con política de que cada cuenta solo escribe en su propia
carpeta) y personaje de Jikan (`/characters`, búsqueda global). El grid de personajes solo muestra
imagen + nombre — ese endpoint no trae el anime en la respuesta de lista (a diferencia de
`/anime/{id}/characters`, que sí); el anime se resuelve con una sola llamada extra recién al confirmar
la elección, no para los 12 resultados del grid.

**Menú de cuenta rediseñado.** El botón ya no es un simple círculo: muestra avatar + nombre + rol del
perfil activo. El menú desplegable creció a Mi Perfil / Cambiar Perfil / Mi Lista / Favoritos /
Historial / Configuración / Panel de Administración (solo staff) / Cerrar sesión.

**Página institucional real (`/acerca`).** Diez secciones con contenido redactado específicamente para
AnimeCLZ (no texto de relleno genérico): qué es, misión, objetivos, tecnologías, arquitectura, el
desarrollador, preguntas frecuentes, contacto, privacidad y términos. El Footer, que desde el inicio del
proyecto apuntaba a rutas de relleno en inglés que nunca existieron (`/about`, `/careers`, `/terms`...),
ahora enlaza a anclas reales dentro de esta página.

**Deliberadamente NO fragmentado por perfil (pedido explícito: no romper Favoritos/Mi Lista/
Historial):** las tres siguen siendo por CUENTA, no por perfil — cada perfil de una misma cuenta ve la
misma Mi Lista/Favoritos/Historial. Fragmentarlas habría exigido una migración de esquema (agregar
`profile_id` a `favorites`/`watch_later`/`watch_history`, reescribir sus RLS, sus servicios y sus
contextos) muy por fuera de "sistema de perfiles + página institucional"; queda anotado como decisión de
alcance, no como omisión accidental.

**No implementado (pedido explícito):**
- CRUD del Panel de Administración — sin cambios respecto a v0.10.
- Configuración (`/configuracion`, la de usuario): misma arquitectura de "estructura lista, sin lógica"
  que ya se usó en `/admin/configuracion` en v0.10 — sin controles interactivos reales todavía.
- Favoritos/Mi Lista/Historial por perfil (ver el punto de arriba).

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; registro/login llevan al selector de
perfiles antes que a Inicio; crear, editar (nombre/color/avatar) y eliminar un perfil (salvo el
predeterminado) funcionan; el rol del perfil activo —no el de la cuenta— controla el acceso a
`/admin/*`; `/acerca` navegable con anclas funcionando desde el Footer; ninguna pantalla, ni la
autenticación, ni el Panel de Administración existentes se rompieron.

---

## v1.3 — Landing Page, navegación, arquitectura de proveedores y SUPER_ADMIN (completado, con exclusiones documentadas)

**Landing Page.** La antigua página institucional (`/acerca`) se convirtió en la página principal
pública (`pages/Landing.jsx`, ruta `/`) — Home (el catálogo) se movió a `/inicio`. Landing vive fuera del
`Layout` público (header propio + `layout/Footer.jsx` reutilizado), con: Hero + CTA "Explorar Anime"
(a `/iniciar-sesion` sin sesión, a `/inicio` con sesión), Qué es AnimeCLZ, Características (nueva,
6 tarjetas reales), Estadísticas del catálogo (nueva — número real de animes vía `AnimeProvider`,
número real de géneros, no inventados), Objetivos, Tecnologías, Arquitectura, Capturas del sistema
(nueva — estructura lista, sin capturas reales todavía: se agregan en `public/screenshots/`), Sobre el
desarrollador, FAQ, Contacto, Privacidad y Términos (estas últimas seis, heredadas de /acerca, se
mantuvieron para no perder contenido ni romper los anclajes del Footer). `/acerca` ahora es un simple
redirect a `/` que preserva el hash — no se borró el archivo (`pages/About.jsx`), solo se vació de
contenido real.

**Logo condicional.** El logo del Navbar (no el de la Landing, que siempre va a `/`) apunta a `/` sin
sesión y a `/inicio` con sesión. Mismo criterio aplicado a los redirects tras cerrar sesión
(`Navbar.jsx`/`AccountMenu.jsx`/`Profile.jsx` ahora navegan a la Landing, no al catálogo).

**Navbar.** Favoritos, Mi Lista e Historial se movieron del menú de cuenta a `NAV_LINKS` (el menú
horizontal principal), junto a Inicio/Explorar/Temporada. "Top" quedó fuera de esa lista a propósito —no
estaba en la lista pedida explícitamente— pero su ruta (`/top`) sigue existiendo y funcionando, solo sin
enlace en el menú principal.

**Arquitectura de proveedores.** Nueva capa `src/providers/`: `AnimeProvider.js` es el único punto de
entrada de datos de anime para toda la app — ninguna página debe importar un proveedor concreto ni
`services/animeService.js` directamente (los 10 archivos que sí lo hacían se migraron a importar de
`AnimeProvider`). `providers/jikan/JikanProvider.js` es la implementación activa (re-exporta
`animeService.js`, sin mover/reescribir esa lógica ya probada). `providers/anilist/AniListProvider.js` y
`providers/tmdb/TMDBProvider.js` son *stubs* — mismo contrato de ~20 métodos, cada uno lanza un error
claro si se invoca, en vez de fingir funcionar.

**Sinopsis en español.** Nueva tabla `anime_synopsis_es` (migración 0012, lectura pública incluso sin
sesión) + `overlaySpanishSynopsis()` en `animeService.js`, aplicado en `fetchList`/`getAnimeById`: si
existe una traducción curada para un `mal_id`, se muestra en vez de la original; si no, se muestra la de
Jikan sin traducir en tiempo real. La tabla nace vacía — se puebla desde un futuro importador (no
implementado), así que hoy esto es, en la práctica, casi siempre un no-op.

**SUPER_ADMIN + Panel de Gestión de Usuarios.** Nuevo rol por encima de `admin` (migración 0013). Único
que puede cambiar el rol de otra cuenta (`admin`/`editor`/`moderador`/`usuario` — `SUPER_ADMIN` no se
asigna desde la UI) desde `pages/admin/Users.jsx`, ahora con una columna de rol editable cuando quien
mira es `super_admin`; bloqueado explícitamente cambiar el propio rol. `leoseb.co@gmail.com` se elevó
automáticamente a `super_admin` (ya existía la cuenta; si no hubiera existido, se habría creado así
desde el registro).

**Bug real encontrado y corregido durante esta pasada:** los triggers de protección de rol
(`protect_profile_role`/`protect_profile_account_rol`, desde v0.10/v1.1) usaban `auth.uid()` para saber
"¿quién pide este cambio?" — pero `auth.uid()` es `NULL` fuera de una sesión con JWT (una migración vía
`supabase db push`, o el SQL Editor), y `not exists (... where account_id = NULL ...)` es siempre
verdadero, así que esos triggers habrían bloqueado incluso la propia elevación de
`leoseb.co@gmail.com` a `super_admin` en esta misma migración. Verificado empíricamente
(`select auth.uid()` en ese contexto) antes de escribir la migración 0013, que corrige ambos triggers
para permitir el cambio cuando `auth.uid() is null` (un operador de confianza actuando fuera del
cliente) y, de paso, agrega el bloqueo explícito de "no puedes cambiar tu propio rol" que faltaba.

**No implementado (pedido explícito o fuera de alcance):**
- Implementación real de AniList/TMDB — quedan como *stubs*, tal como se pidió ("preparar la
  arquitectura", no proveedores funcionando).
- Importador/traductor automático de sinopsis desde Jikan — la tabla y el overlay están listos, el
  pipeline que la puebla no.
- Capturas reales del sistema en la Landing — estructura lista, sin imágenes todavía.
- Edición de rol de un perfil individual (solo `profiles_account`) desde la UI — el Panel de Gestión de
  Usuarios edita el rol de la CUENTA, que se propaga al perfil predeterminado vía el trigger ya
  existente (`sync_default_profile_rol`); no se construyó una segunda UI para perfiles secundarios de una
  misma cuenta.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; `/` sirve la Landing sin sesión y
con sesión, con el CTA llevando al destino correcto en cada caso; `/inicio` sirve el catálogo igual que
antes; Favoritos/Mi Lista/Historial visibles en el menú principal; ninguna página quedó importando de
`animeService.js` directamente salvo `JikanProvider.js`; sinopsis en español no rompe ningún fetch
existente (tabla vacía, no-op observable); `leoseb.co@gmail.com` con rol `super_admin` verificado por
SQL directo; ninguna funcionalidad existente (autenticación, Panel de Administración, Favoritos/Mi
Lista/Historial) se rompió.

---

## v1.0 — Experiencia completa: Landing, perfiles, temas, animaciones y primer CRUD real (completado, con exclusiones documentadas)

**Landing rediseñada — menos texto, más visual.** `pages/Landing.jsx` se reescribió para reducir el
texto y aumentar el contenido visual/de movimiento pedido explícitamente ("mucho contenido visual, poco
texto"): fondos animados con blobs en el Hero, componente `Reveal` compartido (fade+slide al entrar en
viewport, una sola vez) aplicado a cada sección, secciones largas de "Qué es"/"Misión"/"Objetivos"/
"Arquitectura" condensadas o eliminadas, Tecnologías simplificadas a píldoras planas, FAQ reducido a 4
preguntas cortas, nueva sección "Equipo", Estadísticas del catálogo ampliadas a 4 métricas (suma el
conteo de temas de color). Se mantienen (más cortas) Privacidad/Términos al final para no romper los
anclajes del Footer, y "Capturas del sistema" sigue como estructura lista sin imágenes reales (sin
cambios respecto a v1.3 — no se fabricaron capturas).

**Flujo de perfiles — ya no se repite en cada refresh.** Bug real corregido en `ProfileContext.jsx`: el
selector de perfiles (`/perfiles`) volvía a aparecer en cada recarga de página incluso con un perfil
activo válido, por una condición de carrera entre el fetch de perfiles y la restauración desde
`localStorage`. Se resolvió unificando ambos pasos en `fetchProfiles()` y agregando un umbral real de
inactividad (30 minutos, `ACTIVITY_TTL_MS`) con heartbeat (`setInterval` cada 60s + `visibilitychange`):
el selector ahora solo aparece al iniciar sesión, cambiar de cuenta, cerrar sesión, o volver tras una
inactividad prolongada — nunca en un refresh normal con sesión activa reciente. `clearActiveProfile()`
(ya existía en el contexto, pero nunca se invocaba) se conectó a los tres puntos reales de cierre de
sesión (`AccountMenu.jsx`, `Navbar.jsx` móvil, `Profile.jsx`).

**Selector de perfiles rediseñado.** `pages/ProfileSelect.jsx`: fondo con dos blobs de gradiente
animados, contenedor con efecto vidrio (`backdrop-blur-xl` + borde translúcido), entrada escalonada por
perfil (`gridVariants`/`tileVariants`), hover con elevación + brillo, y una transición de selección real
(dimming del resto de tiles + escala del elegido durante ~260ms antes de navegar) en vez de un salto
instantáneo a Inicio.

**Sistema de temas — 7 paletas, no solo modo oscuro.** Nueva columna `profiles_account.tema` (migración
0014, default `'original'`). Se aprovechó que todo el sitio ya consume tokens Tailwind (`bg-*`/`text-*`)
generados desde `@theme` en `src/styles/index.css` — cada tema es solo un bloque
`:root[data-theme="..."]` que redefine esas mismas variables (`--color-background/surface/card/hover/
primary/primary-hover/secondary`, y `--color-border` en Cyber Neon), sin tocar ningún componente:
AnimeCLZ Original, Purple Night, Ocean Blue, Sakura Pink, Emerald, Sunset Orange (única excepción
puntual, deliberada y documentada a "no naranja como color de marca" — solo aplica si el usuario elige
este tema, nunca al branding por defecto) y Cyber Neon. `ThemeContext`/`useTheme()` (nuevo) leen el tema
del perfil activo (o de `localStorage` para invitados) y lo aplican vía `document.documentElement.
dataset.theme`. Picker real e interactivo en `pages/Settings.jsx` (reemplaza la tarjeta placeholder que
existía desde v1.1), persistido en Supabase.

**Animaciones.** El pase de este sprint se concentró en Landing/ProfileSelect (ya detallado arriba); el
resto del sitio ya tenía Framer Motion consistente desde v0.8/Sprint 3.6 (transición de página, skeleton
con shimmer, microinteracciones de hover) y no se reescribió sin necesidad.

**Primer CRUD real del Panel: Noticias.** Nueva tabla `news` (migración 0015, propia de AnimeCLZ, no
depende de Jikan) + `services/newsService.js` (listar con búsqueda/paginación, crear, editar, eliminar) +
`components/admin/NewsFormModal.jsx` + `components/admin/ConfirmDialog.jsx` (nuevo, reutilizable para
cualquier acción destructiva del panel — sin `window.confirm()`, mismo criterio que el resto de la app).
`pages/admin/News.jsx` pasó de ser un `EmptyState` explicativo (v0.10) a una tabla completa con crear/
editar/eliminar/buscar/paginar.

**Moderación real: Usuarios y Comentarios.** `pages/admin/Users.jsx` suma activar/desactivar cuenta
(`profiles.activo`, migración 0016; acción de `super_admin`, no se puede aplicar a la propia cuenta).
`pages/admin/Comments.jsx` suma eliminar comentario (moderación real, no solo lectura como en v0.10).

**Bug real encontrado y corregido al conectar estas dos acciones.** Al probar `updateUserStatus` y
`deleteComment` contra la base viva se confirmó que las policies de RLS existentes ya eran insuficientes
para uso de staff sobre cuentas/comentarios ajenos: la única policy de `UPDATE` en `profiles` (desde la
migración 0001) es `auth.uid() = user_id`, así que RLS filtraba la fila *antes* de que corriera el
trigger `protect_profile_role` — lo que significa que `updateUserRole` (ya en producción desde v1.3)
llevaba desde entonces actualizando 0 filas en silencio al intentar cambiar el rol de otra cuenta, sin
ningún error visible. Mismo problema en `comments`: la única policy de `DELETE` (migración 0006) también
era `auth.uid() = user_id`. Corregido con dos migraciones nuevas, verificadas en vivo con `supabase db
query`: **0017** agrega una policy de `UPDATE` para `super_admin` en `profiles` + un trigger
`protect_profile_activo` (mismo patrón que `protect_profile_role`: no se puede desactivar la propia
cuenta, solo `super_admin` puede tocar la de otra); **0018** agrega una policy de `DELETE` para cuentas
de staff (`super_admin`/`admin`/`editor`/`moderador`) en `comments`.

**No implementado (pedido explícito o fuera de alcance, comunicado antes de empezar):**
- CRUD de Animes/Temporadas/Episodios/Personajes/Estudios — Jikan es de solo lectura y no existe un
  espejo local de esos datos; fabricar un CRUD ahí habría requerido diseñar un esquema local nuevo desde
  cero, fuera del alcance de este sprint. Ver v1.1 para la nota de "Estudios con `/producers`" pendiente
  desde antes, tampoco resuelta aquí.
- CRUD de Configuración (`/admin/configuracion`) — sigue sin tabla ni lógica, sin cambios respecto a v0.10.
- Favoritos/Mi Lista/Historial por perfil — decisión de alcance ya documentada en v1.1, no revisitada.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios (0 errores); refrescar la página con
sesión y perfil activo entra directo a Inicio sin volver a mostrar el selector; cerrar sesión sí vuelve a
mostrarlo; los 7 temas cambian visualmente toda la app y persisten en Supabase; Noticias tiene CRUD
completo funcionando contra la base real; activar/desactivar cuenta y eliminar comentario verificados
contra Supabase en vivo (incluyendo la corrección de RLS); ninguna pantalla existente se rompió.

---

## v1.4 — Sprint móvil: responsive, gestos táctiles y PWA (completado, sin funciones nuevas)

Sprint dedicado exclusivamente a que AnimeCLZ se sienta como una aplicación profesional en el navegador
del celular — sin agregar funciones de producto nuevas (la única excepción, pedida explícitamente como
infraestructura de este mismo sprint: soporte PWA instalable). Todo el trabajo es CSS-first (clases
Tailwind por breakpoint, reutilizando el patrón `hidden md:flex`/`flex-col sm:flex-row` que ya usaba el
resto del proyecto) salvo una única excepción justificada en `Modal.jsx` (ver más abajo).

**Bugs reales encontrados y corregidos (no eran suposiciones — se confirmaron leyendo el código):**
- **"En iPhone a veces no abre el anime":** `AnimeCard.jsx` tenía el único destino de navegación (los
  íconos Play/Info) dentro de un overlay `group-hover:opacity-100` — en iOS Safari el primer tap dispara
  `:hover` en vez del click, así que "revelaba" los íconos en vez de navegar, y el resto del póster no
  tenía ningún handler (una "zona muerta" real). Se rediseñó la card: ahora es un único `Link` de
  cobertura total (`absolute inset-0`), siempre activo, sin depender de hover — el fix real, no un parche
  de z-index. Play/Info pasan a ser decorativos (`pointer-events-none`); Favoritos es un botón siempre
  visible (ya no gateado por hover) en la esquina superior derecha, para ser alcanzable por touch, y se
  mantiene como hermano del Link (no anidado dentro de un `<a>`, que sería HTML inválido). Efecto
  secundario positivo: de 4 tab-stops redundantes (mismo destino) a 2, una mejora real de accesibilidad
  por teclado/lector de pantalla.
- **Desborde horizontal confirmado:** `NavbarSearch.jsx` expandía a un ancho fijo de 300px (Framer
  Motion) con un dropdown de resultados `w-80` (320px) — en un viewport de 320-375px el contenido real
  disponible (tras el `px-4` de `Container`) es de solo ~288px, así que esto desbordaba el header fijo.
  Corregido con un overlay de búsqueda a pantalla completa por debajo de `md`; el comportamiento a `md`+
  no cambió.
- **Auto-zoom de Safari iOS confirmado:** `FormField.jsx` no fijaba `font-size` en el `<input>` — heredaba
  `text-sm` (14px) del label padre, por debajo del umbral de 16px que dispara el zoom automático al
  enfocar un input en Safari iOS. Corregido de una sola vez para los 6 formularios que comparten este
  componente (Login/Registro/Recuperar/Restablecer/Perfil/Configuración).
- **Inconsistencia de breakpoint confirmada:** `Navbar.jsx` cambiaba a `md`, `AccountMenu.jsx` a `sm` —
  entre 640-768px convivían la hamburguesa y el texto completo de cuenta a la vez. Unificado a `md` en
  ambos archivos.

**Hero (`Hero.jsx`).** El poster, antes `hidden` por completo debajo de 640px, ahora es visible en todos
los tamaños — ya estaba primero en el orden del DOM, así que "poster arriba, información debajo" (pedido
explícito) no necesitó reordenar nada, solo dejar de ocultarlo. Título con `line-clamp-2`; sinopsis con
`line-clamp-4` en mobile (se mantiene el recorte a 280 caracteres existente como límite adicional).
Botones apilados a ancho completo en mobile.

**Panel de Administrador — tablas sin scroll horizontal.** `DataTable.jsx` por debajo de `md` (768px) deja
de forzar un `<table>` con `min-w-[560px]` y pasa a un listado de tarjetas — misma prop `columns` de
siempre (columna `actions` se separa a un pie de tarjeta a ancho completo; una columna con `label` vacío
se muestra sin etiqueta). Ninguna página de `pages/admin/*` necesitó tocarse. `Modal.jsx` por debajo de
`sm` pasa a comportarse como bottom sheet (desliza desde abajo, ancho completo, respeta el safe-area del
home indicator de iOS) — resuelve de una sola vez el editor de avatar, Noticias, Perfil y cualquier
confirmación. Única excepción de este sprint a "CSS-first": la dirección de la animación de Framer Motion
sí necesitó un `matchMedia` con listener, porque las props de animación no son responsive vía clases y
duplicar el `DialogPanel` en dos bloques hubiera arriesgado dos instancias de foco/ARIA de modal activas
a la vez.

**Touch targets ≥44×44px.** Auditoría dirigida (no un rediseño de `Button` completo): bump puntual en
hamburguesa/búsqueda del Navbar, avatar de `AccountMenu`, íconos sociales del Footer, drawer/header de
Admin, cierre de `Modal`, acciones por fila de Noticias/Usuarios/Comentarios, swatches/tabs de
`AvatarPicker`, flechas de `Pagination`, chips de relacionados en `AnimeDetail`. `Button.jsx` tamaño `md`
(el que usan los CTAs primarios de Login/Registro/Recuperar/Restablecer/Perfil) pasó de ~40px a 44px.

**Safe-area y red de seguridad.** `viewport-fit=cover` en el meta viewport; utilidades `.safe-top`/
`.safe-bottom` en `index.css` aplicadas al elemento exterior que ya tiene su propio padding visual (nunca
combinadas con un padding de Tailwind sobre la misma propiedad en el mismo elemento, para que se sumen en
vez de pisarse). `overflow-x: hidden` en `html, body` como red de seguridad contra scroll horizontal
accidental (no afecta el scroll horizontal intencional de `MovieRow`/`DataTable`).

**PWA.** `vite-plugin-pwa` + `@vite-pwa/assets-generator` (esta última usada una sola vez vía CLI para
generar `favicon.ico`/`apple-touch-icon-180x180.png`/íconos PWA/maskable a partir del `favicon.svg` real
existente — ningún ícono se fabricó a mano). Manifest con `theme_color`/`background_color: '#07111F'`
(Background, no Primary — confirmado con el usuario) y `display: 'standalone'`. Meta tags de Apple en
`index.html` (Safari no lee `manifest.display`). `vercel.json` con cache-control corto para
`sw.js`/`manifest.webmanifest`.

**No implementado (fuera de alcance a propósito):** ningún ícono/splash se ilustró a mano — todos salen
del `favicon.svg` real; no se rediseñó el logo para el "safe zone" de íconos maskable (aceptable por
ahora, no bloqueante). Auditoría de contraste de color no se rehizo desde cero.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios (0 errores); ninguna página produce
scroll horizontal; el tap en `AnimeCard` navega de inmediato sin necesitar un segundo toque; el buscador
del Navbar no desborda en 320-375px; las tablas del Panel de Administrador se ven como tarjetas por debajo
de 768px; los modales (incluido el editor de avatar) se comportan como bottom sheet en mobile; la PWA es
instalable desde Chrome Android y Safari iOS; ninguna funcionalidad existente se rompió.

---

## v1.5 — Sistema de perfiles definitivo (completado)

Sprint dedicado a terminar el sistema de perfiles múltiples (v1.1/v1.0 ya lo dejaron funcionando en lo
básico) — una auditoría de código previa a implementar confirmó qué ya estaba resuelto y qué faltaba de
verdad, para no reconstruir nada innecesariamente.

**Ya satisfecho de antes, sin cambios:** crear perfil no navega ni recarga la página; "Cambiar Perfil" ya
existe en el menú de cuenta; persistencia de 30 min + selector solo en login/cambio de cuenta/cerrar
sesión/"Cambiar Perfil" (v1.0). "Solo un perfil con permisos administrativos" ya era así
estructuralmente (`createProfile`/`updateProfile` nunca aceptan `rol` — perfiles nuevos siempre nacen
`usuario`) — este sprint lo refuerza con un trigger, no lo reconstruye.

**Máximo 4 perfiles por cuenta** (`MAX_PROFILES` en `constants/index.js`). Trigger
`enforce_max_profiles` (migración 0019) como validación real; `ProfileContext.createProfile` hace un
chequeo previo amable (sin round-trip) antes de llamar al servicio.

**Protección real de borrado (migración 0019).** Antes, `deactivateProfile` no bloqueaba nada —
solo la UI ocultaba el botón para "el perfil predeterminado" (fácil de saltear llamando al servicio
directamente), y ni siquiera existía una confirmación antes de borrar (`Profile.jsx` eliminaba al primer
click). Ahora: trigger `protect_profile_account_deletion` bloquea eliminar el único perfil activo
restante o el que tiene rol elevado (protege el acceso al Panel de Administración sin necesitar saber
cuál es "el predeterminado" — cualquier perfil con `rol <> 'usuario'` queda protegido), con mensajes ya
amables en español que `profilesAccountService` deja pasar tal cual (antes los reemplazaba por un
genérico, perdiendo la razón real del fallo). Ambas pantallas (`Profile.jsx`, `ProfileSelect.jsx`) piden
confirmación real vía `ConfirmDialog` antes de eliminar. Fix defensivo de paso: `sync_default_profile_rol`
no filtraba `activo = true` al buscar "el perfil más antiguo" — corregido, aunque no debería poder
dispararse hoy gracias a la protección nueva.

**Editar/Eliminar desde cualquier tarjeta del selector (`ProfileSelect.jsx`).** Antes solo existían para
el perfil activo, vía "Mi Perfil". Cada tarjeta ahora tiene su propia fila de acciones — **siempre
visible, no gateada por hover** (misma lección aprendida en el sprint móvil anterior con `AnimeCard`:
ocultar una acción real detrás de `:hover` la vuelve inalcanzable en touch). `tileVariants` suma una
animación de salida (antes solo tenía entrada) para que eliminar un perfil se anime en vez de desaparecer
de golpe.

**"Fondo" del perfil — nuevo (migración 0020, columna `profiles_account.fondo`).** Acento decorativo
detrás del avatar en el selector y en el encabezado de "Mi Perfil" — **deliberadamente NO reemplaza el
fondo de toda la app** (decisión confirmada con el usuario: eso sigue siendo exclusivo del sistema de
Temas). Gradientes CSS puros con nombres inspirados en anime (`PROFILE_BACKGROUNDS` en
`constants/index.js`: Sakura, Cyber Noche, Fuego Shonen, Océano Ghibli, Aurora Mágica, Bosque Encantado,
Medianoche Estelar) — nunca imágenes externas, para no fabricar o licenciar arte que no existe.

**Tema y Fondo editables desde el propio modal de perfil.** Antes, Tema solo se cambiaba desde
`Settings.jsx` (y solo para el perfil activo). `ProfileFormModal.jsx` suma dos componentes
presentacionales nuevos (`ThemePickerGrid.jsx`/`BackgroundPickerGrid.jsx`, mismo lenguaje visual que el
picker de Settings) como **estado de formulario local** — a diferencia de Settings, no aplican el
tema/fondo en vivo, porque el modal puede estar editando un perfil que no es el activo.

**Cambio de arquitectura real, confirmado con el usuario (revierte una decisión de v1.1):** Favoritos,
Mi Lista e Historial pasaron de ser por CUENTA a ser por PERFIL (migración 0021) — nueva columna
`profile_id` en `favorites`/`watch_later`/`watch_history` (con backfill al perfil más antiguo de cada
cuenta para filas existentes), nuevos unique constraints sobre `profile_id`, políticas de INSERT (y el
UPDATE de `watch_history`) reforzadas con una verificación de que el `profile_id` enviado pertenece de
verdad a la cuenta autenticada (antes solo se validaba `user_id`, lo que en teoría permitía escribir con
el `profile_id` de un perfil ajeno). `useUserCollection.js`, `FavoritesContext.jsx`,
`WatchLaterContext.jsx`, `historyService.js`, `History.jsx` reescritos para leer/escribir por
`profileId` en vez de `userId`. Al eliminar un perfil, un trigger (`cleanup_profile_data`, misma
migración) borra de verdad sus filas en las tres tablas — `on delete cascade` no alcanzaba porque
desactivar un perfil es un UPDATE, no un DELETE. Comentarios queda fuera a propósito: no hay concepto de
autoría por perfil (`comments.user_id` es de cuenta) ni interfaz pública para crearlos todavía.

**Limpieza menor:** `ConfirmDialog.jsx` se trasladó de `components/admin/` a `components/ui/` (es
agnóstico de dominio, y ahora lo necesitan `Profile.jsx`/`ProfileSelect.jsx` fuera del panel de
administración) — 3 imports de admin actualizados, ninguna otra pieza tocada.

**No implementado (fuera de alcance a propósito):** eliminar un perfil no borra nada de `comments` (ver
arriba); no se construyó un mecanismo para "transferir" el rol administrativo a otro perfil antes de
eliminar el que lo tiene — hoy el trigger simplemente bloquea ese borrado, sin ofrecer un flujo de
transferencia (no se pidió).

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; crear un 5º perfil se bloquea (UI y
base); eliminar el único perfil restante se bloquea; eliminar el perfil con rol admin se bloquea;
eliminar un perfil normal borra de verdad sus propios favoritos/historial/mi lista sin afectar a otros
perfiles de la misma cuenta; editar Tema/Fondo de un perfil que no es el activo no cambia el tema visual
de la sesión actual; refrescar la página con sesión activa sigue en el mismo perfil.

---

## v1.5.1 — Bug real corregido: crash al abrir el modal de perfil (completado)

"Crear Perfil"/"Editar" disparaba el `ErrorBoundary` con `A <Transition.Child /> is used but it is
missing a parent <Transition />`. Causa raíz confirmada leyendo el código fuente de `@headlessui/react`
(no adivinada): `Modal.jsx` pasaba un prop `transition={{ duration, ease }}` (pensado para Framer Motion)
directamente a `DialogPanel`/`DialogBackdrop` — Headless UI reserva ese mismo nombre de prop en esos
componentes para su propio sistema de transición interno (booleano), lo intercepta, lo ve truthy, y los
envuelve en su propio `Transition.Child` — que revienta porque `Dialog` tiene `static` (para que Framer
Motion controle la animación) y por lo tanto nunca crea el contexto `Transition` que `Transition.Child`
necesita. Corregido embebiendo el `transition` dentro de cada objeto `animate`/`exit` en vez de pasarlo
como prop de nivel superior — mismo fix aplicado por el mismo patrón latente (sin confirmar que llegara a
crashear ahí) en `Select.jsx`/`ListboxOptions` y `AccountMenu.jsx`/`MenuItems`. De paso, se corrigió un
warning real de Framer Motion sin relación: `Hero.jsx` tenía dos hijos directos (poster + info) dentro de
un `AnimatePresence mode="wait"` (que solo admite un hijo a la vez) — consolidados en un único wrapper.

---

## v1.6 — Buscador inteligente de avatares (personaje de anime) (completado)

La pestaña "Personaje de anime" de `AvatarPicker.jsx` no funcionaba de verdad. Investigación (no
supuestos) encontró dos causas reales:

**Bug 100% reproducible.** `getCharacterAnime` pedía `GET /characters/{id}` — confirmado pidiéndolo en
vivo, ese endpoint de Jikan nunca trae relación con anime (solo `mal_id/name/images/about`) — la función
devolvía `null` siempre, para cualquier personaje. Corregido: ahora pide el sub-recurso correcto,
`GET /characters/{id}/anime`, que sí trae `role`.

**Fragilidad real de Jikan, verificada en vivo durante esta misma sesión.** `/anime?q=` y
`/characters?q=` devolvieron `504` repetidas veces (backend de búsqueda de MAL degradado en ese momento).
Con el único manejo de error de antes (`.catch(() => setCharacters([]))`), esto era indistinguible en la
UI de "no hay resultados" — nunca se veía un error. Esto es, en los hechos, el mejor argumento posible
para la arquitectura pedida (AniList primero, Jikan de respaldo): quedó demostrado en vivo, no hipotético.

**Arquitectura nueva — `services/avatarSearchService.js`.** Único punto de entrada
`searchAvatarCandidates(query, signal)`:
- **AniList primero** (`api/anilist.js`, cliente GraphQL nuevo, `https://graphql.anilist.co`). Una sola
  consulta con dos ramas: `animeMatch` busca el término como título de anime y trae su elenco con rol;
  `characterMatch` busca el término como nombre de personaje directo. Se fusionan y deduplican por id.
  Verificado en vivo contra la API real (no solo con curl — corriendo el mismo código de merge/dedupe del
  servicio): "Naruto" → Naruto, Sasuke, Kakashi, Sakura...; "Gojo" (sin ningún anime con ese título) →
  "Satoru Gojou — Jujutsu Kaisen" igual, vía `characterMatch`; "Frieren" → Frieren, Fern, Stark, Himmel...
  — los tres ejemplos exactos del pedido, sin necesitar detectar "¿esto es un anime o un personaje?".
- **Jikan como respaldo**, solo si AniList lanza error o da 0 resultados combinados: busca anime por
  título (reusa `searchAnime`) → si hay match, trae su elenco con rol (`GET /anime/{id}/characters`, ya
  usado por `getAnimeCharacters` en otro contexto); además intenta `searchCharacters` (personaje directo)
  — estos últimos no traen anime/rol por la limitación ya documentada de ese endpoint de Jikan, se
  muestran igual sin esos dos campos (opcionales en la tarjeta) en vez de resolver cada uno con una
  llamada extra (lento para un respaldo-de-un-respaldo).
- Nunca lanza hacia la UI — cualquier falla de ambas fuentes se traduce en `[]` (EmptyState), nunca un
  throw que llegue a `ErrorBoundary`.

**"Avatares recientes" y "Favoritos" — tabla `avatar_history` nueva (migración 0022), por CUENTA** (pedido
explícito del usuario para "recientes"; mismo alcance aplicado a "favoritos" por consistencia).
`services/avatarHistoryService.js`. Se muestran en vez de la grilla de resultados cuando el buscador está
vacío, en vez de una pantalla en blanco invitando a escribir.

**"Seleccionar" es de un solo paso (confirmado con el usuario antes de construirlo).** Guarda el avatar en
Supabase y cierra el modal entero al instante — no hace falta pasar por el botón "Guardar" del modal.
`ProfileFormModal.jsx` extrajo `saveForm()` de su `handleSubmit` de siempre (para no duplicar
validación/error/cierre) y expone un nuevo prop `onSelectAndClose` que solo usa la pestaña "Personaje";
los otros dos modos de avatar (Inicial+color, Subir imagen) siguen usando `onChange` sin cambios.

**Tarjetas modernas y animadas.** Componente nuevo `AvatarCandidateCard.jsx` (imagen, nombre, anime, rol,
botón Seleccionar, estrella de favorito siempre visible — no gateada por hover, misma lección del sprint
móvil con `AnimeCard`, 44px de área táctil), grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Framer
Motion: entrada escalonada, hover/tap, transición entre la vista de "Recientes/Favoritos" y "Resultados de
búsqueda" (un solo hijo activo por `AnimatePresence`, aplicando la lección de v1.5.1).

**Búsqueda en tiempo real con caché.** Debounce de 300ms (antes 400ms); resultados vía `hooks/useFetch.js`
(mismo mecanismo de caché/TTL/abort ya usado en toda la app, no uno nuevo) — no vuelve a golpear la API
si ya se buscó el mismo término hace menos de 5 minutos.

**Corrección de alcance sobre el pedido literal:** el pedido decía `tipo_avatar = 'anime'`, pero la
columna real (`profiles_account.tipo_avatar`) solo acepta `'inicial'/'subida'/'personaje'` por CHECK
constraint — se siguió usando `'personaje'` (el valor ya establecido, consumido por `ProfileAvatar.jsx`)
en vez de introducir un valor nuevo que rompería el constraint sin ningún beneficio real.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios; buscar "Naruto"/"Gojo"/"Frieren"
en el navegador arma las tarjetas correctas (verificado corriendo el propio código de fusión contra la
API real de AniList); marcar/desmarcar favorito persiste; elegir un personaje cierra el modal solo y
actualiza el avatar del perfil sin recargar; el personaje elegido aparece en "Recientes" la próxima vez.

---

## v1.7 — Búsqueda global, Home móvil y scroll entre páginas (completado)

Sprint grande pedido por el usuario como "v1.6" (colisiona con el número ya usado por el buscador de
avatares de arriba — se documenta con el número real de secuencia). Auditoría de código + pruebas en vivo
contra las APIs reales antes de tocar nada, tal como pidió el usuario explícitamente ("no quiero
soluciones rápidas ni parches, quiero la causa raíz").

**Buscador global reconstruido — `services/searchService.js` (nuevo).** `Search.jsx` solo buscaba anime
(100% Jikan) — cero búsqueda de personajes en toda la pantalla, y el mensaje "servidor ocupado" era un
string estático sin relación con el error real. `searchAll(query, filters, signal)` es el único punto de
entrada: devuelve `{ anime, characters, degraded }`, dos grupos separados (a diferencia del buscador de
avatares de v1.6, que fusiona todo en una sola lista para elegir un único avatar). Anime usa AniList
primero (`Page.media(search, sort: SEARCH_MATCH)`) con Jikan de respaldo solo si AniList falla o da 0 —
reduce presión real sobre el endpoint de búsqueda de Jikan, el más frágil de la API (documentado desde
Sprint 3.5). **Hallazgo de arquitectura verificado en vivo:** AniList expone `idMal` — el mismo id de
MyAnimeList que usa `AnimeDetail.jsx` — así que un resultado encontrado por AniList navega a la MISMA
ficha de detalle (100% Jikan, sin tocarla) sin duplicar esa página; un resultado sin `idMal` se descarta
(no tiene a dónde navegar). Personajes reutiliza la cascada AniList/Jikan ya construida y verificada en
v1.6, extraída a `services/characterSearchService.js` para que avatar picker y buscador general compartan
la misma lógica en vez de duplicarla — `avatarSearchService.js` quedó como un simple re-export.
`degraded` (booleano) solo se enciende si AMBAS fuentes fallan a la vez — así `Search.jsx` distingue "cero
resultados reales" de "las dos fuentes están caídas" sin mostrar nunca un código de error técnico.
`src/utils/apiCascade.js` (nuevo) centraliza el patrón "intentar primario, si falla o da vacío intentar
respaldo, nunca lanzar salvo abort real" (`withFallback`) que antes solo vivía dentro de
`avatarSearchService.js` — ahora lo comparten los dos servicios de búsqueda.

**`Search.jsx` — rediseño completo.** Antes mostraba todos los filtros a la vez (saturado). Ahora: barra
de búsqueda → botón "Filtros" (abre `Filters.jsx` dentro del `Modal.jsx` ya existente, sin drawer nuevo)
→ sin una búsqueda activa: "Búsquedas recientes" (nuevas, `localStorage`, `utils/recentSearches.js` — la
pantalla es pública, sin sesión, así que no tiene sentido atarlas a Supabase) + "Tendencias" (`getTrending`,
datos reales) → con búsqueda activa: secciones "Anime" y "Personajes" agrupadas. Paginación eliminada — una
búsqueda de texto combinando dos fuentes ya trae un conjunto acotado y ordenado por relevancia (mismo
criterio que AniList/Crunchyroll); Explorar sigue siendo la pantalla para hojear el catálogo completo con
paginación real. `Filters.jsx` muestra los 8 géneros principales por defecto + botón "Ver todos" para el
resto. `NavbarSearch.jsx` pasa a usar `searchAll` también, agrupando su dropdown/overlay en Anime/
Personajes. `components/profile/AvatarCandidateCard.jsx` se reutiliza (sin duplicar) para las tarjetas de
personaje del buscador general — sus props de acción (favorito/seleccionar) se hicieron opcionales para
un uso de solo lectura.

**Home móvil — causas reales, no ajustes a ciegas.** `Hero.jsx` seguía en `h-[92vh] min-h-[620px]` fijos y
todavía tenía `drag="x"` de Framer Motion envolviendo TODO el contenido (poster+título+sinopsis+3
botones) — en touch, ese reconocedor de gestos competía con el scroll vertical nativo sobre un área que
incluía botones interactivos: causa real de "cuesta seguir bajando"/"captura el dedo". Corregido: el
`drag` ahora solo existe en desktop (nuevo hook compartido `hooks/useIsDesktop.js`, generalizado del que
vivía inline en `Modal.jsx` — única excepción del proyecto a "CSS-first" porque Framer Motion anima
valores en JS); en mobile la navegación entre slides sigue funcionando igual vía autoplay + tap en los
puntos. La altura en mobile pasa de fija a dependiente del contenido (bastante más chica); los puntos de
navegación pasan a flujo normal (debajo de los botones) en vez de `position: absolute` sobre contenido
centrado verticalmente — eliminaba de raíz el solape reportado como "líneas del slider entre los
botones" en viewports bajos, en vez de ajustar paddings a ciegas. Desktop (`sm`+) queda visualmente sin
cambios.

**Carruseles estilo Netflix real.** `MovieRow.jsx` no tenía ningún handler de touch — solo un listener de
`wheel` para mouse/trackpad (correcto, no se tocó) — pero el contenedor `overflow-x-auto` tampoco definía
`touch-action`/`overscroll-behavior`. Sin esa pista CSS, el navegador no puede comprometerse de inmediato
con el eje horizontal y cede terreno al scroll vertical de forma inconsistente entre navegadores — causa
real de "bloquea el scroll vertical", no un bug de JS. Corregido agregando `touch-action: pan-x` y
`overscroll-behavior-x: contain` al scroller (clases Tailwind arbitrarias).

**Scroll siempre arriba al cambiar de página.** Confirmado por grep que no existía ningún mecanismo de
scroll-restauración en todo el proyecto — React Router v7 no lo hace solo. Nuevo
`components/ScrollToTop.jsx`, montado una sola vez dentro de `AppRouter.jsx` (no de `Layout.jsx`, para
cubrir también el árbol separado de `AdminLayout`). Usa `behavior: 'instant'` explícito — `html` ya tiene
`scroll-behavior: smooth` global (del sprint móvil anterior), así que sin ese override cada cambio de
ruta se hubiera visto como un scroll animado hacia arriba en vez de arrancar ya arriba.

**Footer y auditoría ligera.** `Footer.jsx` suma `.safe-bottom` (utilidad ya existente desde el sprint
móvil, sin uso hasta ahora — es el último elemento antes del borde real de pantalla). Auditoría dirigida
(no un segundo pase completo — v1.4 ya lo hizo exhaustivamente): confirmado por grep que el único
candidato real a overflow horizontal de página era el `drag`/`dragElastic` del Hero (ya resuelto arriba);
no se encontró otro uso de `drag` de Framer Motion en el resto del código.

**No implementado (fuera de alcance a propósito):** traducir el vocabulario completo de filtros de Jikan
(género/tipo/estado/puntuación) a los enums de AniList — cuando hay filtros restrictivos activos, Jikan
sigue siendo la fuente primaria de esa búsqueda (AniList queda de respaldo igual, así que no depende
únicamente de Jikan); no se re-auditó responsive desde cero en páginas que v1.4 ya cubrió a fondo sin
reportes nuevos.

**Criterio de aceptación:** `npm run build` y `npm run lint` limpios (0 errores; los 6 warnings de
`react-hooks/set-state-in-effect` son de una clase ya presente desde antes de este sprint en `useFetch.js`/
`useUserCollection.js`, no errores nuevos); buscar "Naruto"/"Gojo"/"Frieren" en `/buscar` y en el buscador
del Navbar arma anime + personajes agrupados; "Filtros" abre en modal/bottom-sheet; un carrusel de Home
permite seguir el scroll vertical inmediatamente después de un intento de swipe horizontal en touch; el
Hero ya no se puede arrastrar en mobile; cambiar de página (Home→Explorar→Favoritos→Admin) siempre
arranca arriba; sin scroll horizontal de página en 320-768px.

---

## v1.8 — Explorar simplificado: filtros compactos + Drawer de filtros avanzados (completado)

`Explore.jsx` mostraba `Filters.jsx` completo y siempre visible (género/formato/estado/puntuación/año/
orden de una sola vez) — pedido explícito de reducirlo a un vistazo compacto, con el resto detrás de un
botón "Filtros". No se tocó `Filters.jsx` ni `Search.jsx` (que lo usa dentro de su propio `Modal` desde
v1.7) — se construyeron piezas nuevas específicas de Explorar para no arriesgar esa pantalla ya aprobada.

**`QuickFilters.jsx` (nuevo)** — fila compacta, solo desktop: 6 géneros populares (Acción/Aventura/
Fantasía/Romance/Comedia/Drama) + toggle "Ver más/Ver menos" que revela el resto (`motion.div layout`
anima el reflow); mismo patrón para Formato (TV/Película/OVA + "Más formatos"); Estado fijo a 3 chips
("Próximamente" solo vive en el Drawer); Orden reusa el `Select` compacto. Sin puntuación ni año. Se
auto-expande si el valor activo (llegado desde el Drawer o la URL) no está en el subconjunto popular.

**`AdvancedFiltersPanel.jsx` (nuevo)** — contenido del Drawer: set completo de cada filtro, sin "ver más"
interno ni botones propios.

**`Modal.jsx` — nueva prop `variant`** (`'center'` por defecto; `'drawer'` nuevo desliza un panel fijo
desde el borde derecho en desktop, mismo bottom-sheet en mobile) — mismo componente reutilizado, sin
diálogo ad hoc nuevo.

**`Explore.jsx`** — borrador (`draftFilters`) con Limpiar/Aplicar en el Drawer; la fila compacta sigue
mutando `filters` en vivo. En mobile, `QuickFilters` desaparece del todo — solo título y botón "Filtros"
(sin agregar una caja de búsqueda por texto a Explorar, a propósito: eso ya lo hace `/buscar`).

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios; 6 géneros + Ver más/Ver menos animado
en desktop; el Drawer abre desde la derecha con el set completo + Limpiar/Aplicar; mobile solo muestra
título + botón Filtros; elegir un filtro fuera del subconjunto popular desde el Drawer se refleja
(auto-expandido) en la fila compacta.

---

## v1.9 — Provider Engine: arquitectura multi-proveedor de datos (completado, sin conectar a páginas)

Pedido por el usuario como "v1.7" (colisiona con el sprint de búsqueda global/Home móvil ya documentado
arriba) — documentado con el número real de secuencia. Objetivo explícito del usuario: construir la
arquitectura de datos multi-proveedor (AniList + Jikan + futuros) — **no el reproductor todavía**, solo la
base sobre la que se construirá más adelante.

**Hallazgo de la investigación previa:** la arquitectura de proveedores ya existía dos veces, con dos
propósitos distintos — la fachada pasiva de v1.3 (`AnimeProvider.js`→`JikanProvider.js`→`animeService.js`,
un solo proveedor activo, la que usan las 9 páginas de catálogo) y el cascade real AniList→Jikan de v1.7
(`searchService.js`/`characterSearchService.js`/`apiCascade.js`), acotado a búsqueda de texto. Ninguna de
las dos cubría ficha de detalle/episodios/relaciones/recomendaciones con múltiples fuentes.

**Decisión confirmada con el usuario** (pregunta aclaratoria antes de empezar): este sprint construye el
motor nuevo como arquitectura aislada y aditiva, verificada por sí sola — **sin reconectar las 9 páginas
existentes**, que siguen 100% Jikan sin ningún cambio de comportamiento. Reconectarlas queda para un
sprint futuro.

**`providers/ProviderManager.js` (nuevo).** Orquestador único con 6 métodos: `search`, `getAnime`,
`getEpisodes`, `getCharacters`, `getRelations`, `getRecommendations`. Un array `PROVIDERS` (AniList
primero, Jikan de respaldo) es el único punto de extensión — un proveedor real nuevo se agrega ahí, en una
línea. Semántica de cascada distinta por método, tal como se pidió explícitamente: `search()`/
`getCharacters()` fusionan todas las fuentes y deduplican (no se detienen en la primera que responde);
`getAnime()` completa campo por campo sin nunca reemplazar un dato bueno de AniList por uno peor de Jikan;
`getEpisodes()`/`getRelations()`/`getRecommendations()` son primero-no-vacío-gana. Caché propia (reusa
`utils/cache.js`, sin mecanismo nuevo) con TTL configurable por método, y un TTL corto aparte para
resultados vacíos (para no dejar "sin datos" pegado si ambas fuentes fallaron de forma transitoria — Jikan
en particular, ver sección API en CLAUDE.md). Nunca lanza salvo un abort real — cualquier falla total
resuelve a un valor vacío seguro.

**`providers/anilist/AniListProvider.js` — de stub a implementación real** (5 de 6 métodos) sobre
`api/anilist.js` (sin tocarlo), con queries GraphQL propias contra el schema público de AniList (sin
scraping). `getEpisodes()` es un no-op permanente y deliberado: AniList no tiene listado de episodios
individuales en su API pública, solo un conteo agregado. `getAnime()` deja a propósito `rank`/
`popularity`/`producers`/`licensors`/`themes`/`demographics` en blanco — AniList no tiene un equivalente
real de esos campos de MAL, y el merge los completa siempre desde Jikan.

**`providers/jikan/JikanProvider.js` (reescrito)** — pasa de re-exportar los 21 métodos de
`animeService.js` (que era lo que usaba `AnimeProvider.js`) a ser el adaptador de los 6 métodos nuevos
sobre ese mismo `animeService.js` (sin tocarlo).

**`providers/AnimeProvider.js` — cambio de una línea, cero riesgo:** pasa a re-exportar
`services/animeService.js` directamente (antes pasaba por `JikanProvider.js`, que ahora es otra cosa) —
mismos 21 nombres, mismo comportamiento byte-idéntico. Verificado por grep que ninguna de las 9 páginas
depende de `JikanProvider.js` por nombre o ruta.

**`providers/models.js` (nuevo)** — `createEpisode()` normaliza cualquier episodio al shape preparado
para el futuro reproductor (`sources`/`subtitleLanguages`/`audioLanguages` vacíos hoy, sin inventar
datos); un JSDoc `@typedef VideoSource` documenta el shape futuro (servidor/calidad/subtítulos/audio/
preview) sin fábrica ni código que lo instancie. `mergeAnimeFields()` es el único algoritmo de "completar
sin reemplazar bueno por peor", reusado por `getAnime()` y por la deduplicación de `search()`.

**`utils/apiCascade.js`** suma `firstSuccessful()` (generalización a N proveedores de `withFallback`) sin
tocar los exports existentes — `searchService.js`/`characterSearchService.js` siguen dependiendo de su
forma exacta.

**Verificado contra las APIs reales**, no solo build/lint: `getAnime(20)` (Naruto) trae campos combinados
de ambas fuentes (`source: 'anilist+jikan'`); `search('frieren')` fusiona y dedupea; `getCharacters(20)`
combina AniList+Jikan sin duplicados; `getRelations`/`getRecommendations` traen datos reales agrupados; un
id inválido resuelve `null` sin lanzar (incluso con Jikan devolviendo un 504 real durante la prueba —
degradación funcionando tal como se diseñó); abortar a mitad de una llamada sí rechaza la promesa.

**No implementado (fuera de alcance a propósito, pedido explícito del usuario):** el reproductor de video
en sí — ningún `VideoSource` real, ningún servidor de streaming. Reconectar `AnimeProvider.js`/las 9
páginas al `ProviderManager.js` nuevo — decisión de alcance para un sprint futuro, no un olvido. TMDB
sigue siendo un stub sin implementar (solo su contrato de 6 métodos se actualizó).

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios; los 6 métodos de `ProviderManager`
verificados contra las APIs reales (no solo el build) con resultados de merge/cascada correctos; ninguna
de las 9 páginas existentes cambió de comportamiento (siguen 100% Jikan vía `AnimeProvider.js`).

---

## v2.0 — Estabilización: causa raíz real de los errores + AnimeDetail sobre el Provider Engine (completado)

Pedido explícito del usuario: antes de cualquier funcionalidad nueva, dejar AnimeCLZ estable — encontrar
la causa REAL de los "servidor ocupado" intermitentes (no reformular el mensaje) e integrar
`ProviderManager`. Investigación por lectura directa de código (no supuestos) — tres causas raíz reales,
no una sola.

**Causa raíz 1 — condición de carrera en `api/jikan.js`.** La cola de concurrencia chequeaba el cupo al
encolar pero lo reservaba recién dentro de un `setTimeout` que corría después, sin volver a chequear.
Bajo una ráfaga de peticiones simultáneas — exactamente lo que hacen `Home.jsx`/`AnimeDetail.jsx` al
montarse (6 `useFetch` cada uno) — el límite de `MAX_CONCURRENT=2` quedaba completamente anulado: la
ráfaga entera llegaba a Jikan casi junta, disparando los 429/504 que el retry después tenía que absorber.
Episodios/Galería, 5º y 6º hook de `AnimeDetail.jsx`, eran estructuralmente los últimos contra un backend
ya saturado — coincide exactamente con el síntoma reportado. Corregido con reserva de cupo síncrona
(dentro del mismo `while` que despacha, no de un timer futuro — JS de un solo hilo cierra la condición de
carrera de verdad). De paso: las peticiones abortadas mientras esperan turno se remueven de verdad de la
cola (antes seguían "gastando" un cupo), y el backoff de reintento respeta un abort en vez de reintentar
a ciegas para una página que el usuario ya abandonó.

**Causa raíz 2 — timeouts de cliente nunca se reintentaban, hallazgo confirmado en vivo durante la propia
verificación de este sprint.** `curl` directo (fuera de la app) mostró `/anime/20/episodes` tardando 11
segundos y devolviendo 500 — más que el `timeout: 10000` de axios, así que el cliente lo veía como
`ECONNABORTED`, no como un status 5xx. El chequeo de reintento solo miraba `error.response?.status`
(`undefined` para un timeout), así que un backend lento-y-después-caído se rendía al primer intento.
Corregido: un timeout de cliente ahora es tan "reintentable" como un 429/5xx.

**Causa raíz 3 — bug de código real y separado en `AnimeDetail.jsx`, sin relación con Jikan.** La sección
Episodios leía `episodes.data?.length`/`.map(...)`, pero `getAnimeEpisodes`/`ProviderManager.getEpisodes`
devuelven `{data:[...], pagination}` — `episodes.data` (el campo del propio `useFetch`) era ese objeto
completo, no el array. La condición era siempre verdadera: Episodios mostraba "Sin episodios listados"
para TODOS los animes, sin importar los datos reales de Jikan. La sección hermana "Recomendados" sí hacía
el doble acceso correcto para la misma forma — a Episodios le faltaba ese segundo `.data`. Corregido.

**Decisión de alcance confirmada con el usuario.** `ProviderManager` cubría, antes de este sprint, solo 5
de los ~21 métodos que usan las páginas — falta la familia Trending/TopRated/MásPopular/MejorValorado/
Temporada (Home/Explorar/Buscar/Temporada, con paginación real y un choque de nombre en
`getRecommendations`). Este sprint se concentró en arreglar la causa raíz (beneficia a toda la app,
migrada o no) + migrar `AnimeDetail.jsx` completo (ya casi 1:1) + agregar el método que le faltaba.
Home/Explorar/Buscar/Temporada quedan documentadas como el siguiente paso, no como pendiente por
descuido.

**Caché "usar último resultado válido"** (pedido explícito): `utils/cache.js` deja de borrar entradas
vencidas al leerlas; nuevo `getStaleCached()` las devuelve igual. `ProviderManager.withCache`: si la
consulta fresca vuelve vacía y existe una entrada vieja no vacía, se sirve esa (TTL corto, reintenta
pronto) — nunca un vacío mientras exista algo mejor en caché. Recién sin nada guardado se devuelve el
vacío real, que en la UI termina en `EmptyState`.

**`getGallery` (7º método del Provider Engine).** No existía ningún método de galería. `JikanProvider`
envuelve `getAnimePictures` sin tocarlo; `AniListProvider.getGallery` es un no-op permanente (AniList no
tiene concepto de galería, solo `coverImage`/`bannerImage` únicos); TTL de 6h.

**`AnimeDetail.jsx` migrado por completo** a `ProviderManager` — ya no importa `animeService.js`/
`AnimeProvider.js` en absoluto.

**Riesgo documentado, no silenciado:** como `ProviderManager` nunca lanza salvo abort real, una falla
total ahora aparece como `EmptyState`, no `ErrorState`; y "Reintentar" no limpia la caché propia de
`ProviderManager`, así que dentro de una ventana corta (60s) puede devolver el mismo vacío. Acotado y
autocorregible — una solución genérica queda para el sprint de la familia Trending/Top.

**Confirmado sin cambios:** Favoritos/Mi Lista/Historial ya guardan el anime completo en Supabase al
agregarlo, nunca llaman a Jikan/AniList en vivo. `services/searchService.js` (motor de `/buscar`) es su
propia cascada ya afinada en dos sprints anteriores con capacidades que `ProviderManager.search()` no
tiene — reemplazarla habría sido una regresión, no una migración.

**Verificación real, no solo build/lint:** script aislado confirmando el comportamiento de
`getStaleCached`; arnés con adaptador de axios mockeado confirmando determinísticamente que la ráfaga
respeta el cupo y el espaciado, que abortar una petición en cola la remueve de verdad, y que un abort a
mitad de backoff no reintenta (7 aserciones, todas pasaron); script contra las APIs reales replicando la
ráfaga exacta de `AnimeDetail.jsx`, que en su primera corrida encontró `/anime/20/episodes` genuinamente
caído (confirmado también por `curl` directo) — exponiendo la causa raíz 2 en vivo — y que tras el fix
devolvió 100 episodios reales de Naruto contra ese mismo backend degradado.

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios; las 7 aserciones del arnés de cola
pasan; `AnimeDetail.jsx` (ficha/personajes/episodios/relaciones/galería/recomendados) devuelve datos
reales verificado contra las APIs reales, incluso con Jikan parcialmente degradado; Home/Explore/Search/
Season/Top/Landing/admin sin cambios de comportamiento (siguen en `AnimeProvider.js`).

---

## v2.1 — Sistema de reproducción: PlaybackProviderManager + reproductor real (completado, con exclusión
deliberada de piratería)

Primer sistema de reproducción real de AnimeCLZ, pedido con un spec detallado: un `PlaybackProviderManager`
desacoplado (misma filosofía que `ProviderManager`), un reproductor de video completo hecho a mano,
episodios clickeables, "Continuar viendo", autoplay con cuenta regresiva, y todo optimizado para mobile —
sin tocar diseño ni romper nada existente.

**Decisión de piratería — resuelta con el usuario antes de escribir código, no se reabre.** El pedido
original nombraba Consumet/AnimeKai/AnimePahe/HiAnime como proveedores. Los cuatro son agregadores de
scraping sobre sitios de streaming no autorizado, no APIs con licencia — implementarlos de verdad habría
significado construir la cañería para transmitir contenido con copyright sin autorización, contradiciendo
además la propia regla de "sin scraping" que ya regía `ProviderManager` desde v1.9. Se le planteó la
disyuntiva al usuario vía pregunta aclaratoria; confirmó construir el 100% de la arquitectura con esos 4 +
YouTube como stubs inertes (mismo patrón que `TMDBProvider`), y usar **AnimeThemes** (base abierta y de
licencia permisiva de openings/endings, `api.animethemes.moe`) como el único proveedor real.

**Límite de alcance real, verificado con `curl` en vivo antes de diseñar nada, no un descubrimiento a
mitad de sprint.** AnimeThemes solo tiene clips de OP/ED (~90s), nunca episodios completos — no existe
hoy ninguna fuente legal y pública de episodios completos para conectar. Este sprint entrega arquitectura
completa + reproducción real de contenido real (los OP/ED de cada anime), con la pieza de episodios
completos preparada (interfaz, modelo de datos, UI) para cuando exista un proveedor con licencia.

**`PlaybackProviderManager.js`** — dos métodos (`getEpisodes`/`getSources`), ambos fusionando todos los
proveedores activos (hoy, uno). `getEpisodes()` responde "¿qué tiene este proveedor para reproducir?" —
distinto de `ProviderManager.getEpisodes()` ("¿qué episodios existen, según Jikan/AniList?"); ambos se
usan lado a lado en `AnimeDetail.jsx`. `getSources(animeId, episodeNumber)` filtra en memoria (vía
`rangeUtils.js`, puro) el catálogo ya cacheado — una sola llamada de red por anime, sin importar cuántos
episodios distintos se abran.

**`AnimeThemesProvider.js`** — implementación real sobre `api/animethemes.js` (mismo patrón que
`api/anilist.js`). Cachea su propio catálogo completo por anime (6h TTL, independiente de la caché del
orquestador). Parseo de rangos (`"1-25"`/`"78-103"`/`null`) verificado con datos reales de Naruto: una
entrada `null` se excluye del match si una hermana del mismo tema tiene rango real (es un recorte
alternativo, no "aplica a todo"); si TODAS son `null` (película/OVA), se acepta como "cubre toda la
serie" solo por ausencia de mejor información. Mapeo a `VideoSource` (`createVideoSource()`, nuevo en
`models.js`): `audioLanguage: 'ja'` (dato real, clips originales), `subtitleLanguages: []` siempre
(AnimeThemes no tiene pistas de idioma seleccionables), sin preview inventada.

**Migraciones 0023/0024** — `watch_history.duration_seconds` (nullable, escrita por el cliente desde
`<video>.duration`) y `profiles_account.autoplay` (default `true`). Aplicadas y verificadas en vivo
(`supabase db push` + `supabase db query --linked`). Limitación aceptada: la clave única de
`watch_history` sigue sin distinguir OP vs. ED del mismo episodio — documentada, no resuelta este sprint.

**El reproductor — `<video>` nativo, controles a mano, no una librería.** Cada fuente de AnimeThemes es un
`.webm` estático de una resolución fija, sin manifiesto adaptativo que justifique video.js/plyr — lo que
queda (play/seek/volumen/velocidad/fullscreen/PiP) es API nativa del navegador, coherente con el resto de
la app y sin pelear contra el chrome de una librería para los 7 temas de color. `pages/Watch.jsx`
(`/anime/:id/ver/:episodeNumber`, fuera de `Layout`, protegida por sesión+perfil, mismo patrón de ruta
hermana que `PROFILE_SELECT`) + `components/player/*` (controles, selector de fuente, overlay de
siguiente episodio, panel de info, hooks de estado/teclado/progreso). Progreso guardado cada ~15s +
inmediato en pausa/backgrounding (`sendBeacon` descartado: no puede autenticar contra Supabase);
resume-desde-posición-guardada; autoplay con cuenta regresiva 5→0 gateado por la preferencia del perfil;
6 atajos de teclado (Espacio/←→/↑↓/F/M/Esc); bloqueo de controles y safe areas en mobile.

**`AnimeDetail.jsx`** — Episodios pasa de lista estática a grilla clickeable (`EpisodeCard.jsx`), con
badges de Filler/Visto/progreso/"sin fuente disponible" reales, sin inventar miniaturas ni duraciones por
clip.

**Verificación real, no solo build/lint:** script Vite-SSR con 24 aserciones — fixtures puros de
`rangeUtils` (10), `AnimeThemesProvider` contra la API real de AnimeThemes con Naruto (catálogo de 25
temas, URLs `.webm` reproducibles, fuentes resueltas para el episodio 10, `mal_id` inexistente resuelve
vacío sin lanzar), los 5 stubs lanzando el error esperado, `PlaybackProviderManager` fusionando y
etiquetando correctamente — las 24 pasaron. Migraciones verificadas con `supabase db query --linked`
(columna/tipo/default). El round-trip autenticado de `upsertProgress`/`getProgress` requiere una sesión
real de usuario (no disponible fuera del navegador en este entorno) y queda para la verificación manual —
las policies de RLS de `watch_history` no cambiaron en 0023/0024, solo se agregó una columna nullable.

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios; migraciones aplicadas y verificadas;
24/24 aserciones del script de verificación pasan contra la API real de AnimeThemes; reproducción real de
un clip funcionando de punta a punta (episodios clickeables → fuentes reales → controles → progreso
guardado) para cualquier anime con cobertura en AnimeThemes; verificación manual en navegador pendiente
del usuario (scrubbing, volumen/velocidad, PiP, fullscreen, los 6 atajos, gestos táctiles + bloqueo en
mobile, safe areas, cuenta regresiva de autoplay y su cancelación, resume tras recargar, aspecto visual
contra los 7 temas).

---

## Nota de proceso: v2.2–v2.7 no documentadas aquí

Cinco sprints reales (v2.2 Reproducción Multi Provider, v2.3 AnimeDetail Premium, v2.4 Smart Search
Engine, v2.5 Landing Premium + Login, v2.6 Recommendation Engine, v2.7 Media Hub) se ejecutaron entre
v2.1 y v2.8 de abajo, pero sus entradas de ROADMAP/CLAUDE.md se perdieron en un corte de contexto de
sesión — ver la misma nota en `CLAUDE.md` → "Notas técnicas actuales" para el detalle y qué código real
existe de cada uno. No se reconstruyeron de memoria acá para no arriesgar una descripción inexacta.

---

## v2.8 — Quality, Performance & Stabilization (completado, auditoría + correcciones — sin funciones nuevas)

Sprint de auditoría pura: sin páginas nuevas, sin funcionalidad nueva, sin cambios de arquitectura —
"Corregir únicamente problemas encontrados" (pedido explícito). Ver la entrada completa en `CLAUDE.md` →
"Notas técnicas actuales" para el detalle técnico de cada hallazgo/corrección; en corto:

- **Hallazgo más importante (accesibilidad, verificado matemáticamente, no a ojo):** el texto blanco del
  botón primario (`bg-primary text-white`) no cumplía contraste WCAG AA (4.5:1) en NINGÚN tema de los 7 —
  fallaba severamente en 5 (hasta 1.54:1 en Cyber Neon, casi ilegible). Afectaba 11 usos en 10 archivos
  distintos (no solo `Button.jsx`). Corregido con un token nuevo `--color-on-primary` por tema (reutiliza
  el propio `--color-background` de cada tema como texto — sin inventar un color nuevo, sin tocar los
  hues de marca ya confirmados), pasa AA con margen amplio (5.68–13.22:1) en los 7 temas. Confirmado con
  el usuario antes de aplicarlo, dado el alcance visual (el CTA primario es el elemento más repetido de
  toda la app).
- **Performance — bundle:** el chunk principal pesaba 598KB (Vite lo marcaba como advertencia). Se
  agregaron `manualChunks` para `framer-motion`/`@headlessui/react` (junto al `supabase` ya existente) —
  el chunk principal bajó a 364KB, sin advertencia de Vite; mismo total de bytes, mejor cacheo entre
  despliegues y descarga en paralelo.
- **Race condition real (4 archivos):** `Login.jsx`/`Register.jsx`/`ResetPassword.jsx`/`ProfileSelect.jsx`
  disparaban `setTimeout(...)` antes de `navigate()`/actualizar estado sin limpiar al desmontar — si el
  usuario navegaba a otro lado dentro de la ventana de 260-2000ms, la navegación retrasada disparaba
  igual, sorpresa. Corregido con un `ref` + cleanup en `useEffect` en los 4 archivos.
- **Duplicación real:** `components/admin/StatCard.jsx` y `components/anime/StatCard.jsx` eran casi
  idénticos (icono+label+value en tarjeta). Consolidados en `components/ui/StatCard.jsx` (agnóstico de
  dominio, prop `variant="dashboard"|"compact"`), los dos originales eliminados.
- **Auditoría exhaustiva sin cambios necesarios** (verificado, no solo asumido): cobertura de
  `AbortController`/guardas de carrera en efectos async (patrón `active` ya consistente en todo el
  proyecto), memoización de `value` en los 5 Context principales (ya hecha), limpieza de event
  listeners/timers (ya completa salvo los 4 de arriba), CLS de imágenes (ya mitigado vía `aspect-ratio`
  de Tailwind, no requiere atributos `width`/`height` literales), `aria-label` en botones solo-ícono (ya
  cubierto), sin imports/código muerto (`no-unused-vars` de ESLint ya en 0), sin llamadas directas a
  axios/fetch fuera de la capa de servicios.
- **Diferido a otro sprint (documentado, no un descuido):** warning `react-hooks/set-state-in-effect` en
  `useFetch.js`/`useUserCollection.js`/`Search.jsx` (ya documentado desde v0.8 como downgrade deliberado,
  necesita una reescritura mayor "derive state during render" — fuera de alcance de "no modificar
  arquitectura"); reconstrucción de las entradas v2.2–v2.7 (ver nota de proceso arriba); auditoría de
  contraste del resto de la paleta (texto secundario/bordes) — ya pasa AA en los pares revisados, no se
  encontró otro fallo real.

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios (0 errores, mismos 14 warnings
preexistentes); contraste del botón primario verificado matemáticamente (fórmula de luminancia relativa
WCAG) en los 7 temas antes y después del fix; bundle principal por debajo del umbral de advertencia de
Vite (500KB).

---

## v3.1 — Sync Engine (completado, cola de mutaciones offline)

Ver la entrada completa en `CLAUDE.md` → "Notas técnicas actuales" para el detalle técnico; en corto:

- **Auditoría (FASE 1) primero, antes de escribir código**: Favoritos/Mi Lista/Historial/Continuar
  viendo/Tema/Perfil/Autoplay ya estaban sincronizados entre dispositivos hoy — Supabase ya es la única
  fuente de verdad, cada dispositivo lee/escribe las mismas filas directamente. "Recomendaciones" no
  persiste nada (100% derivado del lado cliente). La única divergencia real posible es un dispositivo
  offline en el momento de escribir — por eso "SyncManager" se diseñó como una cola de mutaciones
  offline, no como un sistema de sincronización paralelo redundante.
- **Nuevo**: `src/services/sync/offlineQueue.js` (persistencia pura, dedup/merge por `key`) +
  `src/services/sync/SyncManager.js` (orquestador plain JS — nunca dentro de React, nunca importa un
  servicio; cada servicio registra su propio handler de "repetir esta operación").
- **Integrado** (wrap mínimo, cero cambio de comportamiento con conexión): `collectionService.js`
  (Favoritos + Mi Lista), `historyService.js` (Historial + Continuar viendo), `profilesAccountService.js`
  (Tema + Autoplay + Perfil).
- **2 bugs reales encontrados y corregidos durante la implementación** (no en el diseño aprobado): un
  payload anidado rompía el merge superficial de dos ediciones de perfil offline (corregido aplanándolo);
  `ProfileContext.updateProfileById` reemplazaba el perfil entero en vez de fusionar, lo que habría
  vaciado el perfil local al resolver `undefined` en el camino offline (corregido con `optimisticResult`
  + fusión en vez de reemplazo).
- **Fuera de alcance, documentado**: `createProfile`/`deactivateProfile` sin envolver (dependen de
  triggers de validación del estado actual del servidor, riesgoso repetir a ciegas); indicador visual de
  "pendiente de sincronizar" (no se pidió una funcionalidad de UI nueva).

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios; script de verificación con 17
aserciones (offline/dedup/reconexión/2 dispositivos/conflicto real/persistencia/error real vs. fallo de
red) — las 17 pasaron.

---

## v3.2 — Backend Gateway & Observability (completado, solo infraestructura, sin servidor ni UI)

Ver la entrada completa en `CLAUDE.md` → "Notas técnicas actuales" para el detalle técnico; en corto:

- **Auditoría (FASE 1)**: mapeadas todas las llamadas reales a AniList/Jikan/AnimeThemes — sin
  duplicación accidental (la que existe, AniList+Jikan en paralelo en `search()`/`getAnime()`, ya es a
  propósito desde v1.9/v2.0). Críticas: `getAnime()` y `search()` (este último contra el endpoint más
  frágil de Jikan, ya documentado).
- **Decisión de alcance**: AnimeThemes/Playback quedan fuera del Gateway y la observabilidad nueva (está
  en la lista de restricciones) — el shape de Health Monitor/Dashboard igual incluye una entrada
  `animethemes` marcada `tracked: false`, no omitida en silencio.
- **Nuevo** `src/services/gateway/`: `Gateway.js` (fachada, pass-through a `ProviderManager` hoy, sin que
  ninguna página se haya migrado a usarla todavía), `metrics.js` (registro solo-en-desarrollo, no-op
  total en producción), `healthMonitor.js`, `cacheMetrics.js`, `dashboard.js` (objeto serializable, sin
  pantalla — pedido explícito).
- **Instrumentado, comportamiento sin cambios**: `ProviderManager.js` (`withCache`, único choque de los
  7 métodos), `api/jikan.js`/`api/anilist.js` (interceptor de reintento ya existente).
- **Verificado en vivo**: 24 aserciones — pass-through fiel, cache hit/miss reales, un fallback real (no
  simulado) capturado correctamente como métrica, Dashboard serializable, y — sin buscarlo a propósito —
  la corrida capturó 4 reintentos reales de Jikan durante la prueba.

**Criterio de aceptación:** `npm run build`/`npm run lint` limpios; bundle de producción byte-idéntico
antes/después (instrumentación eliminada por dead-code elimination vía `import.meta.env.DEV`); 24/24
aserciones del script de verificación.

---

## Sprint 4 — Firebase y cuentas de usuario (superado por v0.9 — se hizo con Supabase)

- ~~**Firebase**~~ — se implementó con **Supabase** en su lugar (ver v0.9 arriba); mismo objetivo (auth +
  base de datos para lo que no cubre Jikan), proveedor distinto.
- ~~**Login**~~ ✅ v0.9
- ~~**Registro**~~ ✅ v0.9
- ~~**Perfil**~~ ✅ v0.9
- **Configuración** — preferencias de cuenta/app; no cubierto por v0.9, sigue pendiente.

**Nota:** esto formalizó la capa de persistencia que Favoritos/Mi Lista/Historial ya dejaron preparada
desde el Sprint 3, pero con Supabase (no Firebase) — ver v0.9 para el detalle completo.

**Criterio de aceptación:** cumplido por v0.9, salvo "Configuración" (pendiente).

---

## Sprint 5 — Producto pulido y despliegue

- **PWA** — app instalable, soporte offline básico.
- **SEO** — metadata dinámica por página, Open Graph.
- **Optimización** — performance (bundle, lazy loading de rutas, imágenes).
- **Dark Mode** — sistema de tema (dado que hoy la app es oscura por defecto, definir si esto es un
  segundo tema claro o variantes dentro del tema oscuro).
- **Deploy** — publicación en producción.

**Criterio de aceptación:** `npm run build` limpio, app instalable, indexable y desplegada en producción.

---

## Sprint 6 — Administración y monetización

- ~~**Panel Administrador**~~ — arquitectura, navegación y layout ✅ v0.10; **CRUD real pendiente**.
- ~~**Dashboard**~~ — vista resumen con métricas reales ✅ v0.10.
- **Analytics** — métricas de uso de la plataforma (distinto de las métricas de contenido del Dashboard).
- **Sistema Premium** — planes/suscripciones, contenido o funciones exclusivas.

**Criterio de aceptación:** CRUD completo de contenido/usuarios desde el panel (v0.10 dejó la
arquitectura lista, no el CRUD), Analytics y un modelo de planes premium funcionando de punta a punta
(alta, cobro o simulación, acceso diferenciado).

---

## Cómo usar este roadmap

- Cada sprint es unidad de aprobación: antes de empezar uno, se analiza y se explica el plan concreto
  (archivos a tocar, componentes nuevos) siguiendo el flujo de trabajo de CLAUDE.md.
- El orden refleja dependencias reales (p. ej. Sprint 3 prepara la persistencia que Sprint 4 formaliza
  con Firebase) y no debería alterarse sin ajustar también esas dependencias.
