# TODO - AnimeCLZ

## Prioridad Alta

- [x] Cambiar completamente la identidad visual de StreamFlix a AnimeCLZ.
- [x] Crear el nuevo Hero conectado a datos reales.
- [x] Cambiar favicon. (color corregido en Sprint 3.6 — seguía en rojo desde el Sprint 2)
- [ ] Crear logo oficial AnimeCLZ. (favicon es una marca mínima en SVG; falta un logo completo)
- [x] Eliminar todos los datos mock.
- [x] Unificar el modelo de datos de Anime.
- [x] Mejorar Home.

---

## Sprint 2

- [x] Buscador.
- [x] Explorar.
- [x] Temporada Actual.
- [x] Géneros.
- [x] Skeleton Loading.
- [x] Estados Vacíos.
- [x] Manejo de errores.
- [x] Responsive.

---

## Sprint 3

- [x] Página Detalle Anime. (reconstruida por completo: banner, título japonés, ranking, popularidad, estado, temporada, clasificación, géneros/temas/demografía)
- [x] Trailer. (embed real o estado "sin trailer disponible")
- [x] Episodios. (listado con número/título/fecha/score, agregado en v0.8; Jikan sigue sin dar streaming — reproductor real se retoma en la fase "Streaming")
- [x] Recomendados. (carrusel por anime, reutilizando MovieRow/AnimeCard)
- [x] Relacionados. (precuelas/secuelas/spin-off/OVA/películas/especiales, agrupados)
- [x] Personajes. (principales + actor de voz japonés)
- [x] Estudios. (dentro de la sección Información, junto a productores y licenciantes)

---

## Sprint 3.5

- [x] Arreglar el buscador. (causa real: `order_by`/`sort` forzado en toda búsqueda por texto — quitado; retry con backoff exponencial; mensaje de error amable)
- [x] Rediseño completo — nueva paleta sin rojo (azul suave), Navbar/Hero/Cards/Carruseles/Botones/Formularios.

---

## Sprint 3.6

- [x] Arreglar el buscador (segunda pasada). Causa real: endpoint de búsqueda de Jikan es más frágil que el resto de la API (confirmado con `curl` fuera de la app, varias veces). Mitigado con cola de concurrencia global + más reintentos; no es 100% eliminable (limitación externa).
- [x] Reemplazar todos los `<select>` nativos por un componente `Select` propio (Headless UI Listbox).
- [x] Quitar "MyAnimeList" de todo texto visible al usuario.
- [x] Favicon/logo sin rojo.
- [x] Quitar el botón "Ver detalles" de la card; hover con solo íconos, sin cajas.
- [x] Microanimaciones (transición de página, aparición/desaparición de resultados, duración 180-300ms en todo el sitio).
- [x] Skeleton con shimmer.
- [x] Ajuste de espaciado (menos vacío que el Sprint 3.5).
- [x] Revisión general de consistencia (radios, duraciones).
- [x] `eslint.config.js` (no existía desde el inicio del proyecto) + limpieza de lo que encontró.

---

## v0.8 — Renovación mayor UI/UX

- [x] Nueva paleta (navy profundo `#07111F`/`#0F172A`, Secondary violeta `#7C5CFF` como excepción documentada solo para acentos).
- [x] Hero rediseñado como carrusel real (autoplay, pausa en hover, swipe/drag, dots, thumbnails, `prefers-reduced-motion`).
- [x] Corrección de calidad de imagen (nunca estirar pósters; fondo ambiental blureado + póster nítido en su relación de aspecto real; `srcSet`).
- [x] Reordenamiento de Home (Top Anime → Temporada Actual → Recomendados → Más Populares → Mejor Valorados).
- [x] Carruseles estilo Netflix (scroll con rueda del mouse redirigido a horizontal).
- [x] Cards: se reincorporó el Formato (tipo) visible.
- [x] Buscador: autocomplete en Navbar (`NavbarSearch`) + caché de resultados (3 min) + barra animada en `/buscar`.
- [x] Explorar: filtros como chips modernos (`ChipGroup`) para Género/Formato/Estado/Puntuación; `Select` para Orden/Año.
- [x] AnimeDetail: sección Episodios agregada (ver nota arriba).
- [x] Navbar con glassmorphism (blur + cambio de fondo al hacer scroll) e indicador de link activo animado.
- [x] Favicon actualizado a la nueva paleta.
- [x] `EmptyState` con `onRetry` opcional (Jikan puede responder 200 con datos vacíos bajo carga; no solo errores).
- [x] `CharacterCard` memoizado; code-splitting por ruta ya existente revisado.
- [x] Nota de arquitectura para futura migración a Supabase (solo documentación, sin cliente instalado).
- [x] Nota de arquitectura para futuro Panel de Administrador (solo documentación, sin rutas creadas).
- [ ] "Continuar viendo", "Nuevos episodios", "Noticias" en Home — NO implementados (requieren datos reales que hoy no existen: historial de usuario, feed de episodios, feed de noticias). Ver ROADMAP.md.
- [ ] Corrección definitiva del warning `react-hooks/set-state-in-effect` en `useFetch.js` (downgradeado a `warn` con justificación documentada, no arreglado de raíz).
- [ ] Prefetch de rutas/datos.
- [ ] Auditoría de accesibilidad dedicada para los componentes nuevos de v0.8.

---

## v0.9 — Módulo completo de autenticación + Supabase

- [x] `@supabase/supabase-js` instalado; `src/lib/supabase.js` + `.env.example`.
- [x] Login con correo/contraseña y con Google.
- [x] Registro (con confirmación por correo).
- [x] Recuperar y restablecer contraseña.
- [x] Cerrar sesión, persistencia y refresh de sesión automáticos.
- [x] `AuthContext`/`useAuth` global.
- [x] Navbar: Iniciar sesión/Crear cuenta sin sesión; avatar + menú (Perfil/Mi Lista/Favoritos/Cerrar sesión) con sesión.
- [x] Rutas protegidas: `/mi-lista`, `/favoritos`, `/historial`, `/perfil` (`ProtectedRoute`).
- [x] Perfil real editable (username/bio), ya no placeholder.
- [x] Favoritos y Mi Lista separados en dos listas/tablas reales (`favorites`/`watch_later`), ambas persistidas en Supabase y gated por sesión.
- [x] Migraciones SQL con RLS: `profiles`, `favorites`, `watch_later`, `watch_history`, `ratings`, `comments`, `notifications` (no ejecutadas contra ningún proyecto real).
- [x] `services/historyService.js` + página `/historial` preparados (sin escritor real — no hay reproductor todavía).
- [ ] Interfaz de Calificaciones (`ratings`) — tabla lista, sin UI (a propósito).
- [ ] Interfaz de Comentarios (`comments`) — tabla lista, sin UI (a propósito).
- [ ] Interfaz de Notificaciones (`notifications`) — tabla lista, sin UI (a propósito).
- [ ] Configuración de cuenta/app (más allá de username/bio) — no cubierto.

---

## v0.10 — Panel de Administración (arquitectura, sin CRUD)

- [x] Sistema de roles: columna `role` en `profiles` (`admin`/`editor`/`moderador`/`usuario`) + trigger que impide autoasignarse un rol superior.
- [x] `ProtectedRoute` con prop `roles` — `/admin/*` requiere `STAFF_ROLES` (admin/editor/moderador); sin ese rol, redirige a Inicio.
- [x] Layout separado (`layout/admin/AdminLayout.jsx` + `AdminSidebar` + `AdminHeader`), sin Navbar/Footer públicos.
- [x] Sidebar responsive: fija en desktop, drawer con overlay en mobile.
- [x] Sidebar filtrada por rol (Usuarios/Configuración solo para `admin`).
- [x] Acceso desde `AccountMenu` ("Panel de Administración", solo visible para staff).
- [x] Componentes reutilizables: `StatCard`, `DataTable`, `TableToolbar`, `AdminPageHeader`.
- [x] Dashboard con métricas reales (usuarios/equipo/comentarios/calificaciones — conteos de Supabase, no inventados).
- [x] 10 vistas creadas: Dashboard, Animes, Temporadas, Episodios, Personajes, Estudios, Noticias, Usuarios, Comentarios, Configuración.
- [x] Animes/Temporadas/Usuarios/Comentarios con datos reales, búsqueda, filtros y paginación funcionando.
- [x] Episodios/Personajes/Estudios/Noticias: tabla armada + `EmptyState` explicando por qué no hay datos todavía (sin fabricar contenido).
- [x] Corregida una condición de carrera real en `AuthContext` (profileLoading) descubierta al implementar el gate por rol — ver ROADMAP.md.
- [ ] CRUD completo (crear/editar/eliminar) de cualquier sección — a propósito, pedido explícitamente para otra pasada.
- [ ] Integración de Estudios con `/producers` de Jikan.
- [ ] Tabla y CRUD de Noticias.
- [ ] Tabla y CRUD de Configuración.
- [ ] Edición de rol de usuario desde el panel (hoy solo lectura en Usuarios).

---

## v1.1 — Sistema de perfiles + página institucional

- [x] Tabla `profiles_account` (migración 0009): perfiles múltiples por cuenta, no cuentas múltiples.
- [x] Selector de perfiles estilo Netflix (`/perfiles`) tras login/registro.
- [x] Crear/editar/eliminar perfil (nombre, color, avatar) — `ProfileFormModal`.
- [x] "Cambiar Perfil" disponible en todo momento desde el menú de cuenta.
- [x] Primer perfil autogenerado al registrarse; no se puede eliminar.
- [x] Avatar en 3 modos: inicial+color, imagen propia (Supabase Storage, migración 0010), personaje de Jikan (`/characters`).
- [x] El rol que controla `/admin/*` pasó de la cuenta (`profiles.role`) al perfil activo (`profiles_account.rol`) — `ProtectedRoute` actualizado.
- [x] Trigger `sync_default_profile_rol`: al elevar una cuenta a admin, el perfil por defecto queda sincronizado automáticamente.
- [x] Trigger `protect_profile_account_rol`: mismo tipo de protección que ya tenía `profiles.role` en v0.10, ahora también en `profiles_account.rol`.
- [x] Corregida una condición de carrera real en `ProfileContext` (mismo tipo de bug que ya se había corregido en `AuthContext` durante v0.10) antes de integrarla.
- [x] `AccountMenu` rediseñado: avatar + nombre + rol del perfil activo en el propio botón (antes solo un círculo); menú con Mi Perfil/Cambiar Perfil/Mi Lista/Favoritos/Historial/Configuración/Panel de Administración (staff)/Cerrar sesión.
- [x] Página `/acerca` con 10 secciones reales (qué es, misión, objetivos, tecnologías, arquitectura, desarrollador, FAQ, contacto, privacidad, términos).
- [x] Footer actualizado: ya no enlaza a rutas de relleno en inglés que nunca existieron — ahora apunta a anclas reales de `/acerca`.
- [x] Página `/configuracion` (usuario) — misma arquitectura "estructura lista, sin lógica" que `/admin/configuracion`.
- [ ] Favoritos/Mi Lista/Historial por perfil (hoy siguen por cuenta — decisión de alcance documentada, no pedida en esta pasada).
- [x] Edición de rol desde una UI real. (v1.3 — Panel de Gestión de Usuarios, solo para `super_admin`)
- [ ] Lógica real de Configuración (tema/idioma/notificaciones/privacidad) — sigue sin implementarse, solo estructura.
- [ ] Integración de Estudios con `/producers` de Jikan (seguía pendiente desde v0.10, no se tocó en esta pasada).

---

## v1.3 — Landing Page, navegación y sistema de permisos

- [x] Landing Page real (`pages/Landing.jsx`, ruta `/`) — reemplaza a la antigua `/acerca`.
- [x] Home (catálogo) movido a `/inicio`; `/` ahora es la Landing.
- [x] `/acerca` convertida en redirect a `/` (preserva el hash) — archivo conservado, no borrado.
- [x] Hero + CTA "Explorar Anime" (condicional: login sin sesión, `/inicio` con sesión).
- [x] Secciones nuevas: Características, Estadísticas del catálogo (datos reales), Capturas del sistema (estructura, sin imágenes reales todavía).
- [x] Logo del Navbar condicional (`/` sin sesión, `/inicio` con sesión); redirects post-logout a la Landing.
- [x] Navbar: Favoritos, Mi Lista e Historial movidos al menú principal (antes solo en el menú de cuenta).
- [x] "Top" fuera de `NAV_LINKS` a propósito — su ruta sigue funcionando, solo sin enlace en el menú.
- [x] Arquitectura de proveedores: `providers/AnimeProvider.js` (único punto de entrada), `providers/jikan/JikanProvider.js` (activo), `providers/anilist/AniListProvider.js` y `providers/tmdb/TMDBProvider.js` (stubs).
- [x] 10 archivos migrados para importar de `AnimeProvider` en vez de `services/animeService.js` directamente.
- [x] Arquitectura de sinopsis en español: tabla `anime_synopsis_es` (migración 0012) + overlay en `animeService.js` — no traduce en tiempo real.
- [x] Rol `SUPER_ADMIN` (migración 0013) + `leoseb.co@gmail.com` elevado automáticamente.
- [x] Panel de Gestión de Usuarios: cambiar el rol de cualquier cuenta (solo `super_admin`), bloqueado cambiar el propio rol.
- [x] Bug real corregido: los triggers de protección de rol usaban `auth.uid()`, que es `NULL` fuera de una sesión con JWT — habría bloqueado incluso la propia migración de elevación a `super_admin`. Corregido antes de aplicar.
- [x] Implementación real de AniList/TMDB — **superado en v1.9**: AniList ya tiene una implementación
  real (5/6 métodos, `providers/anilist/AniListProvider.js`, Provider Engine); TMDB sigue como stub, a
  propósito.
- [ ] Importador/traductor automático de sinopsis desde Jikan — tabla y overlay listos, pipeline no.
- [ ] Capturas reales del sistema en la Landing.
- [ ] Edición de rol de un perfil individual (solo cuenta) — se edita el rol de cuenta, que se propaga.

---

## v1.0 — Experiencia completa: Landing, perfiles, temas, animaciones y primer CRUD real

- [x] Landing rediseñada: menos texto, más contenido visual/animado (`Reveal`, blobs animados en Hero, secciones condensadas).
- [x] Bug real corregido: el selector de perfiles ya no reaparece en cada refresh (condición de carrera en `ProfileContext` + restauración desde `localStorage` unificadas).
- [x] Umbral de inactividad real (30 min) con heartbeat — el selector solo vuelve a aparecer tras inactividad prolongada, login, cambio de cuenta o cierre de sesión.
- [x] `clearActiveProfile()` conectado a los tres puntos reales de cierre de sesión (antes existía en el contexto pero nunca se invocaba).
- [x] Selector de perfiles rediseñado: fondo animado, efecto vidrio, entrada escalonada, transición real al seleccionar.
- [x] Sistema de temas: 7 paletas (`profiles_account.tema`, migración 0014) vía `data-theme` + `ThemeContext`/`useTheme()`; picker real en Configuración, persistido en Supabase.
- [x] Primer CRUD real del Panel: Noticias (tabla `news`, migración 0015; `newsService.js`; `NewsFormModal`; `ConfirmDialog` nuevo y reutilizable; crear/editar/eliminar/buscar/paginar).
- [x] Usuarios: activar/desactivar cuenta (`profiles.activo`, migración 0016; solo `super_admin`; no aplicable a la propia cuenta).
- [x] Comentarios: eliminar (moderación real, ya no solo lectura).
- [x] Bug real corregido: la policy de `UPDATE` de `profiles` y la de `DELETE` de `comments` solo permitían filas propias — RLS bloqueaba en silencio (0 filas afectadas, sin error) cualquier acción de staff sobre cuentas/comentarios ajenos, incluyendo `updateUserRole` que ya estaba en producción desde v1.3. Corregido con migraciones 0017/0018, verificado en vivo.
- [ ] CRUD de Animes/Temporadas/Episodios/Personajes/Estudios — fuera de alcance a propósito (Jikan es de solo lectura, no hay espejo local de esos datos).
- [ ] CRUD de Configuración del panel (`/admin/configuracion`) — sigue sin tabla ni lógica.
- [ ] Integración de Estudios con `/producers` de Jikan — seguía pendiente desde v0.10, no se tocó en esta pasada.
- [x] Favoritos/Mi Lista/Historial por perfil — decisión de alcance de v1.1 revertida en v1.5 (ver esa sección).

---

## v1.4 — Sprint móvil: responsive, gestos táctiles y PWA

- [x] Bug real corregido: `AnimeCard` no abría el detalle de forma confiable en iPhone (destino de navegación gateado por `:hover`, que en iOS Safari requiere un primer tap solo para "revelar"). Ahora es un único `Link` de cobertura total, siempre activo.
- [x] Bug real corregido: `NavbarSearch` desbordaba horizontalmente en 320-375px (ancho fijo de 300px + dropdown de 320px). Overlay de búsqueda a pantalla completa por debajo de `md`.
- [x] Bug real corregido: auto-zoom de Safari iOS al enfocar inputs (`FormField` heredaba `text-sm`, por debajo del umbral de 16px) — corregido para los 6 formularios que comparten el componente.
- [x] Bug real corregido: inconsistencia de breakpoint entre `Navbar` (`md`) y `AccountMenu` (`sm`) — unificado a `md`.
- [x] Hero: poster visible en mobile (antes `hidden` por completo), título/sinopsis con `line-clamp`, botones apilados a ancho completo.
- [x] Panel de Administrador: `DataTable` se convierte en tarjetas por debajo de 768px (sin scroll horizontal); ninguna página necesitó cambios.
- [x] `Modal` se comporta como bottom sheet en mobile (editor de avatar, Noticias, Perfil, confirmaciones) — respeta el safe-area del home indicator de iOS.
- [x] Touch targets ≥44×44px: Navbar, AccountMenu, Footer, Admin (sidebar/header/acciones de fila), Modal, AvatarPicker, Pagination, chips de relacionados en AnimeDetail, tamaño `md` de `Button`.
- [x] Safe-area completo: `viewport-fit=cover`, utilidades `.safe-top`/`.safe-bottom`, compatibilidad con notch/Dynamic Island.
- [x] Red de seguridad `overflow-x: hidden` en `html, body` contra scroll horizontal accidental.
- [x] PWA completa: `vite-plugin-pwa`, manifest, `favicon.ico`/apple-touch-icon/íconos PWA/maskable generados desde el favicon real (`@vite-pwa/assets-generator`), meta tags de Apple, service worker con precache, instalable en Android e iPhone.
- [ ] Rediseño del logo para el "safe zone" de íconos maskable — el actual puede recortarse un poco en launchers con máscara circular; no bloqueante.
- [ ] Auditoría de contraste de color dedicada — no se rehizo desde cero en esta pasada.

---

## v1.5 — Sistema de perfiles definitivo

- [x] Máximo 4 perfiles por cuenta (`MAX_PROFILES`) — validado en frontend y con trigger real en Supabase (`enforce_max_profiles`, migración 0019).
- [x] Protección real de borrado: no se puede eliminar el único perfil restante ni el que tiene rol elevado (`protect_profile_account_deletion`, migración 0019) — antes solo la UI lo evitaba.
- [x] Confirmación real antes de eliminar un perfil (`ConfirmDialog`) — antes `Profile.jsx` borraba al primer click, sin ningún aviso.
- [x] Editar/Eliminar disponibles desde cualquier tarjeta del selector (`ProfileSelect.jsx`), no solo desde "Mi Perfil" para el activo — siempre visibles, no gateados por hover (lección del sprint móvil).
- [x] "Fondo" del perfil — nuevo campo (migración 0020), acento decorativo (no reemplaza el sistema de Temas), gradientes CSS con nombres inspirados en anime.
- [x] Tema y Fondo editables desde el propio modal de crear/editar perfil (`ThemePickerGrid.jsx`/`BackgroundPickerGrid.jsx`, nuevos) — antes Tema solo se cambiaba desde Configuración para el perfil activo.
- [x] Bug real corregido: `sync_default_profile_rol` no filtraba perfiles desactivados al buscar "el perfil más antiguo" — corregido defensivamente.
- [x] Cambio de arquitectura confirmado con el usuario: Favoritos/Mi Lista/Historial pasan de ser por cuenta a ser por perfil (migración 0021, `profile_id` en las 3 tablas) — revierte la decisión de v1.1. Se borran de verdad al eliminar el perfil dueño (`cleanup_profile_data`, misma migración).
- [x] Políticas de INSERT/UPDATE de `favorites`/`watch_later`/`watch_history` reforzadas para verificar que el `profile_id` enviado pertenece de verdad a la cuenta autenticada (antes solo se validaba `user_id`).
- [x] `ConfirmDialog.jsx` reubicado de `components/admin/` a `components/ui/` (agnóstico de dominio, ya lo necesitan páginas públicas).
- [ ] Eliminar un perfil no borra nada de `comments` — fuera de alcance a propósito (sin autoría por perfil, sin interfaz pública para crear comentarios todavía).
- [ ] Transferir el rol administrativo a otro perfil antes de eliminar el que lo tiene — no existe ese flujo, el trigger solo bloquea el borrado.

---

## v1.5.1 — Bug real corregido: crash al abrir el modal de perfil

- [x] `A <Transition.Child /> is used but it is missing a parent <Transition />` al abrir "Crear Perfil"/"Editar" — causa raíz: `Modal.jsx` pasaba un prop `transition` (Framer Motion) que Headless UI intercepta como su propio flag interno en `DialogPanel`/`DialogBackdrop`. Corregido embebiendo `transition` dentro de cada objeto `animate`/`exit` en vez de como prop de nivel superior.
- [x] Mismo patrón corregido preventivamente en `Select.jsx`/`ListboxOptions` y `AccountMenu.jsx`/`MenuItems`.
- [x] Warning real de Framer Motion corregido de paso: `Hero.jsx` tenía dos hijos directos dentro de `AnimatePresence mode="wait"` (solo admite uno) — consolidados en un único wrapper por slide.

---

## v1.6 — Buscador inteligente de avatares (personaje de anime)

- [x] Bug real corregido: `getCharacterAnime` pedía el endpoint equivocado de Jikan (`/characters/{id}`, sin relación de anime) — siempre devolvía `null`. Corregido a `/characters/{id}/anime`.
- [x] Arquitectura `AvatarSearchService`: AniList (GraphQL) primero, Jikan como respaldo si falla o da 0 resultados — verificado en vivo con los 3 ejemplos del pedido (Naruto/Gojo/Frieren).
- [x] Un solo buscador detecta anime o personaje sin pedirle al usuario que elija — una consulta GraphQL con dos ramas fusionadas, sin heurística.
- [x] Búsqueda en tiempo real con debounce de 300ms; caché de 5 min reutilizando `hooks/useFetch.js`.
- [x] Tarjetas modernas (`AvatarCandidateCard.jsx`): imagen, nombre, anime, rol, botón Seleccionar, estrella de favorito siempre visible; grid 2/3/5 columnas (mobile/tablet/desktop).
- [x] Skeletons mientras carga; `EmptyState` si no hay resultados o ambas fuentes fallan — nunca `ErrorBoundary`.
- [x] "Avatares recientes" y "Favoritos" (tabla `avatar_history`, migración 0022, por cuenta) — se muestran cuando el buscador está vacío.
- [x] "Seleccionar" guarda y cierra el modal en un solo paso (confirmado con el usuario) — `ProfileFormModal.jsx` extrajo `saveForm()` reutilizable; los otros dos modos de avatar no cambiaron.
- [x] Animaciones con Framer Motion: entrada escalonada, hover/tap, transición Recientes↔Resultados (un solo hijo por `AnimatePresence`).
- [ ] Corrección de alcance: el pedido decía `tipo_avatar = 'anime'`; se mantuvo `'personaje'` (el valor real de la columna, protegido por CHECK constraint) — ver ROADMAP.md.

---

## v1.7 — Búsqueda global, Home móvil y scroll entre páginas

- [x] Bug real corregido: `Search.jsx` solo buscaba anime (100% Jikan) — cero búsqueda de personajes en
  toda la pantalla, y el mensaje de error era un string estático sin relación con la falla real.
- [x] `services/searchService.js` (nuevo): `searchAll(query, filters, signal)` → `{ anime, characters,
  degraded }`, AniList primero para anime (con `idMal` para linkear al detalle real de Jikan sin
  duplicarlo) y Jikan de respaldo; personajes reutiliza la cascada de v1.6 vía `characterSearchService.js`
  (extraída, no duplicada) — `avatarSearchService.js` queda como re-export.
- [x] `src/utils/apiCascade.js` (nuevo): centraliza el patrón `withFallback` (primario → respaldo → nunca
  lanza salvo abort real) que antes solo vivía dentro de `avatarSearchService.js`.
- [x] `degraded` distingue "cero resultados reales" de "las dos fuentes cayeron a la vez" — nunca se
  muestra un código de error técnico al usuario.
- [x] `Search.jsx` rediseñada: barra + botón "Filtros" (abre `Filters.jsx` en el `Modal.jsx` existente) →
  sin búsqueda activa, Búsquedas recientes (`localStorage`, nuevo `utils/recentSearches.js`) + Tendencias;
  con búsqueda, secciones Anime/Personajes agrupadas. Paginación eliminada (Explorar sigue siendo la
  pantalla de catálogo paginado).
- [x] `Filters.jsx`: 8 géneros principales por defecto + botón "Ver todos".
- [x] `NavbarSearch.jsx` usa `searchAll` — dropdown/overlay agrupado en Anime/Personajes.
- [x] `AvatarCandidateCard.jsx` reutilizada (props de acción opcionales) para las tarjetas de personaje
  del buscador general, sin duplicar el componente.
- [x] Bug real corregido: `Hero.jsx` tenía `drag="x"` de Framer Motion envolviendo todo el contenido
  (poster+título+sinopsis+botones) — en touch competía con el scroll vertical nativo. Ahora el drag solo
  existe en desktop (nuevo `hooks/useIsDesktop.js`, generalizado del que vivía inline en `Modal.jsx`).
- [x] `Hero.jsx` en mobile: altura pasa de fija (`92vh`/`620px`) a dependiente del contenido; puntos de
  navegación pasan a flujo normal (debajo de los botones) en vez de `position: absolute` sobre contenido
  centrado — resolvía el solape real reportado en viewports bajos. Desktop sin cambios visuales.
- [x] Bug real corregido: `MovieRow.jsx` no definía `touch-action`/`overscroll-behavior` en el scroller —
  el navegador no podía comprometerse con el eje horizontal y cedía terreno al scroll vertical de forma
  inconsistente. Agregado `touch-action: pan-x` + `overscroll-behavior-x: contain`.
- [x] Bug real corregido: no existía ningún mecanismo de scroll-restauración en todo el proyecto — nuevo
  `components/ScrollToTop.jsx`, montado una vez en `AppRouter.jsx` (cubre también `AdminLayout`), con
  `behavior: 'instant'` explícito (el `scroll-behavior: smooth` global del sprint móvil lo hubiera animado).
- [x] `Footer.jsx` suma `.safe-bottom` (utilidad existente desde el sprint móvil, sin uso hasta ahora).
- [x] Auditoría dirigida confirmó (por grep, no suposición) que el único candidato real a overflow
  horizontal de página era el `drag` del Hero, ya resuelto — no se encontró otro uso de `drag` en el resto
  del código.
- [ ] Traducir el vocabulario completo de filtros de Jikan a enums de AniList — fuera de alcance; con
  filtros restrictivos activos, Jikan sigue siendo la fuente primaria (AniList queda de respaldo igual).

---

## v1.8 — Explorar simplificado: filtros compactos + Drawer de filtros avanzados

- [x] `QuickFilters.jsx` (nuevo): fila compacta solo desktop — 6 géneros populares + "Ver más/Ver menos"
  animado, 3 formatos + "Más formatos", 3 estados fijos, Orden compacto. Sin puntuación ni año.
- [x] `AdvancedFiltersPanel.jsx` (nuevo): set completo de cada filtro, contenido puro del Drawer.
- [x] `Modal.jsx` — nueva prop `variant` (`'center'`/`'drawer'`); en desktop `'drawer'` desliza desde la
  derecha, mismo bottom-sheet en mobile para ambas variantes.
- [x] `Explore.jsx`: borrador (`draftFilters`) con Limpiar/Aplicar en el Drawer; mobile solo muestra título
  + botón Filtros (sin agregar búsqueda por texto a Explorar, a propósito).
- [x] `constants/index.js`: `getYearOptions()` extraído de `Filters.jsx` para reusar en el Drawer sin
  duplicar el cálculo.
- [ ] `Filters.jsx`/`Search.jsx` no se tocaron (alcance deliberado, no pendiente real).

---

## v1.9 — Provider Engine: arquitectura multi-proveedor de datos (sin reproductor, sin conectar páginas)

- [x] `providers/ProviderManager.js` (nuevo): orquestador con 6 métodos (`search/getAnime/getEpisodes/
  getCharacters/getRelations/getRecommendations`); array `PROVIDERS` como único punto de extensión.
- [x] `search()`/`getCharacters()`: fusionan todas las fuentes en paralelo y deduplican (no se detienen en
  la primera que responde) — pedido explícito.
- [x] `getAnime()`: completa campo por campo (`mergeAnimeFields`), nunca reemplaza un dato bueno de AniList
  por uno peor de Jikan.
- [x] `getEpisodes()`/`getRelations()`/`getRecommendations()`: primero-no-vacío-gana (AniList primero,
  Jikan de respaldo), vía `firstSuccessful()` (nuevo export de `utils/apiCascade.js`, sin tocar los
  existentes).
- [x] `providers/anilist/AniListProvider.js`: de stub a implementación real (5/6 métodos) sobre
  `api/anilist.js`. `getEpisodes()` es un no-op deliberado (AniList no tiene listado de episodios en su
  API pública).
- [x] `providers/jikan/JikanProvider.js` (reescrito): adaptador de los 6 métodos nuevos sobre
  `animeService.js` (sin tocar ese archivo).
- [x] `providers/AnimeProvider.js`: repuntado a `services/animeService.js` directo (antes pasaba por
  `JikanProvider.js`) — mismos 21 métodos, cero cambio de comportamiento para las 9 páginas existentes.
- [x] `providers/tmdb/TMDBProvider.js`: contrato actualizado a los 6 métodos nuevos (sigue sin
  implementar, a propósito).
- [x] `providers/models.js` (nuevo): `createEpisode()` (shape preparado para el futuro reproductor,
  `sources`/`subtitleLanguages`/`audioLanguages` vacíos hoy) + `mergeAnimeFields()` + JSDoc `VideoSource`
  (solo documentación del shape futuro, sin fábrica).
- [x] Caché propia en `ProviderManager.js` (reusa `utils/cache.js`), TTL configurable por método, TTL
  corto aparte para resultados vacíos.
- [x] Verificado contra las APIs reales (no solo build/lint): merge/cascada correctos en los 6 métodos,
  id inválido resuelve `null` sin lanzar, abort real rechaza la promesa.
- [x] Corrección de alcance sobre el pedido literal: el usuario pidió "v1.7" — colisiona con el sprint de
  búsqueda global ya documentado con ese número; se siguió la secuencia real (v1.9).
- [ ] Implementación real de AniList/TMDB — **superado**: AniList ya no es un stub desde v1.9 (5/6
  métodos reales); TMDB sigue sin implementar. Reemplaza la línea de v1.3 más abajo.
- [x] Reconectar `AnimeProvider.js`/las 9 páginas de catálogo al `ProviderManager.js` nuevo —
  **empezado en v2.0**: `AnimeDetail.jsx` migrado por completo. Home/Explore/Search/Top/Season/Landing/
  admin (8 páginas) siguen pendientes, ver v2.0 más abajo para la razón concreta.
- [ ] Reproductor de video real (`VideoSource`, servidores, calidad, subtítulos, audio) — fuera de
  alcance a propósito, ver sección "Streaming" más abajo.

---

## v2.0 — Estabilización: causa raíz real de los errores + AnimeDetail sobre el Provider Engine

- [x] Bug real corregido: condición de carrera en la cola de `api/jikan.js` — reservaba el cupo dentro de
  un `setTimeout` futuro sin volver a chequear, así que una ráfaga de peticiones simultáneas (6
  `useFetch` de `AnimeDetail.jsx`/`Home.jsx` al montarse) anulaba por completo `MAX_CONCURRENT=2`. Ahora
  la reserva es síncrona.
- [x] Bug real corregido: peticiones abortadas mientras esperaban turno seguían "gastando" un cupo de la
  cola — ahora se remueven de verdad.
- [x] Bug real corregido: el backoff de reintento no era abort-aware — reintentos "zombie" después de
  navegar a otra página. Ahora chequea abort antes/después de esperar.
- [x] Bug real corregido (hallazgo en vivo, confirmado con `curl` directo): un timeout de cliente
  (`ECONNABORTED`) nunca se reintentaba — el chequeo solo miraba `error.response?.status`. Ahora un
  timeout cuenta como transitorio igual que 429/5xx.
- [x] Bug real corregido en `AnimeDetail.jsx`: la sección Episodios leía `episodes.data?.length` en vez
  de `episodes.data?.data?.length` (`getAnimeEpisodes` devuelve `{data,pagination}`) — mostraba "Sin
  episodios listados" para TODOS los animes, sin relación con el uptime de Jikan.
- [x] `utils/cache.js`: nuevo `getStaleCached()` — un valor vencido ya no se borra al leerlo, queda
  disponible como "último resultado válido".
- [x] `ProviderManager.withCache`: si la consulta fresca vuelve vacía, sirve el último valor válido en
  caché (aunque esté vencido) antes de resolver a un vacío real — nunca un vacío mientras exista algo
  mejor guardado.
- [x] `getGallery` (7º método del Provider Engine, no existía ninguno para Galería) — `JikanProvider`
  envuelve `getAnimePictures`; `AniListProvider.getGallery` es un no-op permanente (sin concepto de
  galería en su schema público); TMDB stub actualizado.
- [x] `AnimeDetail.jsx` migrado por completo a `ProviderManager` — ya no importa `animeService.js`/
  `AnimeProvider.js`. Variable `pictures`→`gallery` renombrada.
- [x] Verificación real: script aislado para `getStaleCached`; arnés con adaptador de axios mockeado (7
  aserciones: cupo, pacing, abort-en-cola, abort-en-backoff — todas pasaron); script contra las APIs
  reales replicando la ráfaga exacta de `AnimeDetail.jsx` — primera corrida expuso `/anime/20/episodes`
  genuinamente caído (confirmado con `curl`), segunda corrida (con el fix de timeout) devolvió 100
  episodios reales de Naruto contra el mismo backend degradado.
- [ ] Riesgo documentado, no resuelto todavía: "Reintentar" en una sección de `AnimeDetail.jsx` no limpia
  la caché propia de `ProviderManager`, solo la externa de `useFetch` — dentro de una ventana corta (60s)
  puede devolver el mismo vacío cacheado. Acotado y autocorregible; una solución genérica (`skipCache`)
  queda para el sprint de la familia Trending/Top.
- [ ] Home/Explorar/Buscar/Temporada/Top/Landing/admin — fuera de alcance a propósito (decisión
  confirmada con el usuario): necesitan una familia nueva de métodos en `ProviderManager`
  (Trending/TopRated/MásPopular/MejorValorado/Temporada, con paginación real) y resolver un choque de
  nombre en `getRecommendations` (global vs. por-anime) — alcance mayor, sprint propio.
- [x] Confirmado sin cambios necesarios: Favoritos/Mi Lista/Historial ya guardan el anime completo en
  Supabase al agregarlo, nunca llamaron a Jikan/AniList en vivo. `services/searchService.js` (motor de
  `/buscar`) se dejó sin tocar a propósito — reemplazarlo por `ProviderManager.search()` habría sido una
  regresión real (pierde búsqueda de personajes por nombre y el estado `degraded`).

---

## v2.1 — Sistema de reproducción: PlaybackProviderManager + reproductor real

- [x] Decisión confirmada con el usuario: Consumet/AnimeKai/AnimePahe/HiAnime (scrapers de streaming no
  autorizado) quedan como stubs inertes — no se implementan como scrapers funcionales bajo ningún
  framing. AnimeThemes (openings/endings, base abierta y legal) es el único proveedor real este sprint.
- [x] `src/api/animethemes.js` — transporte (patrón `api/anilist.js`).
- [x] `createVideoSource()` en `providers/models.js` — el `@typedef VideoSource` ya estaba documentado
  desde v1.9, le faltaba la fábrica.
- [x] `providers/playback/rangeUtils.js` — parseo de rangos de episodios, puro, testeado con fixtures.
- [x] `providers/playback/animethemes/AnimeThemesProvider.js` — implementación real, caché propia de
  catálogo por anime (una sola llamada de red por anime, sin importar cuántos episodios se abran).
- [x] 5 proveedores stub (Consumet/AnimeKai/AnimePahe/HiAnime/YouTube), `createStubProvider` de siempre.
- [x] `providers/playback/PlaybackProviderManager.js` — orquestador, `getEpisodes`/`getSources` fusionando
  proveedores activos.
- [x] Migración 0023 (`watch_history.duration_seconds`, nullable, escrita por el cliente) y 0024
  (`profiles_account.autoplay`, default `true`) — aplicadas y verificadas con `supabase db query
  --linked`.
- [x] `historyService.js`: nueva `getProgress(profileId, malId, episodeNumber)`; `upsertProgress`/
  `listHistory` extendidos con `durationSeconds`.
- [x] `profilesAccountService.js`: `autoplay` agregado a `COLUMNS`/`fromRow`/`updateProfile`.
- [x] `ROUTES.WATCH`/`watchPath()` en `constants/index.js`; nueva ruta `/anime/:id/ver/:episodeNumber`
  montada en `AppRouter.jsx` como hermana de `Layout` (mismo patrón que `PROFILE_SELECT`), protegida por
  sesión+perfil.
- [x] `AnimeDetail.jsx` — Episodios pasa de lista estática a grilla clickeable (`EpisodeCard.jsx`), con
  badges de Filler/Visto/progreso/"sin fuente disponible".
- [x] Reproductor completo: `pages/Watch.jsx` + `components/player/*` (`VideoPlayer`/`PlayerControls`/
  `SourceSelector`/`NextEpisodeOverlay`/`EpisodeInfoPanel` + hooks de estado/teclado/progreso). `<video>`
  nativo, no una librería (cada fuente de AnimeThemes es un `.webm` estático de resolución fija).
- [x] Play/pausa, volumen/mute, velocidad, fullscreen, PiP, barra de progreso con buffer real, loader de
  buffering (única excepción documentada a "nunca spinner, siempre skeleton" — solo para buffering EN
  VIVO sobre video ya visible, no para carga de página).
- [x] Botón de subtítulos condicional (`subtitleLanguages?.length > 0`) — con AnimeThemes nunca se
  renderiza, ya que esa API no reporta idiomas.
- [x] 6 atajos de teclado (Espacio/←→/↑↓/F/M/Esc), ignorando foco en inputs.
- [x] "Continuar viendo" real: `upsertProgress` cada ~15s + inmediato en pausa/backgrounding; resume desde
  posición guardada al recargar (últimos ~10s tratados como terminado).
- [x] Autoplay siguiente episodio con cuenta regresiva 5→0, gateado por `profiles_account.autoplay`
  (toggle real en `Settings.jsx`).
- [x] Mobile: bloqueo de controles, `[touch-action:none]` acotado al reproductor, safe areas en la barra
  de controles.
- [x] Verificación real: script Vite-SSR con 24 aserciones (fixtures de `rangeUtils`, `AnimeThemesProvider`
  contra Naruto real vía `api.animethemes.moe`, los 5 stubs, `PlaybackProviderManager`) — 24/24 pasaron.
  Migraciones verificadas con `supabase db query --linked`.
- [ ] Round-trip autenticado real de `upsertProgress`/`getProgress` contra Supabase — requiere una sesión
  de usuario real (JWT), no disponible fuera del navegador en este entorno; queda para la verificación
  manual del usuario (las policies de RLS de `watch_history` no cambiaron en 0023/0024).
- [ ] Verificación manual en navegador (pendiente del usuario, primera función real de audio/video de la
  app): scrubbing, volumen/velocidad, PiP, fullscreen, los 6 atajos, gestos táctiles + bloqueo en mobile,
  safe areas en dispositivo con notch, cuenta regresiva de autoplay y su cancelación, resume tras
  recargar, aspecto visual contra los 7 temas.
- [ ] Episodios completos — fuera de alcance a propósito: no existe hoy una fuente legal y pública de
  episodios completos para conectar (AnimeThemes solo tiene OP/ED). Arquitectura (interfaz, modelo de
  datos, UI) queda lista para cuando exista un proveedor real con licencia.

---

## Sprint 4 (superado por v0.9 — hecho con Supabase, no Firebase)

- [x] ~~Firebase~~ → Supabase. Ver v0.9.
- [x] Login. Ver v0.9.
- [x] Registro. Ver v0.9.
- [x] Perfil. Ver v0.9.
- [ ] Configuración. (no cubierto por v0.9)

---

## Sprint 5

- [x] Favoritos. (v0.9 — ahora tabla propia en Supabase, `favorites`, distinta de Mi Lista)
- [x] Mi Lista. (v0.9 — ahora tabla propia en Supabase, `watch_later`, distinta de Favoritos)
- [x] Historial. (v0.9 — página y tabla `watch_history` listas; escrita de verdad desde v2.1)
- [x] Continuar Viendo. (v2.1 — `historyService.upsertProgress`/`getProgress`, resume real desde el
  reproductor; `History.jsx` en sí no fue rediseñada este sprint, sigue mostrando la lista tal cual)

---

## Sprint 6

- [x] Panel Administrador. (arquitectura v0.10 — ver arriba; CRUD pendiente)
- [ ] CRUD Anime.
- [ ] CRUD Episodios.
- [x] Dashboard. (v0.10 — métricas reales)
- [ ] Comentarios. (moderación real — hoy solo lectura en el panel)
- [ ] Reportes.

---

## AnimeCLZ Studio

- [ ] Crear Anime Original.
- [ ] Subir portada.
- [ ] Subir banner.
- [ ] Subir episodios.
- [ ] Editor de sinopsis.
- [ ] Editor de géneros.
- [ ] Publicar.
- [ ] Borrador.

---

## Streaming

- [x] Reproductor. (v2.1 — `<video>` nativo + controles a mano; contenido real limitado a openings/
  endings vía AnimeThemes, no episodios completos — no existe hoy una fuente legal pública de episodios
  completos, ver v2.1 arriba)
- [x] Pantalla completa. (v2.1)
- [ ] Subtítulos. (arquitectura lista — `subtitleLanguages`/botón condicional — pero AnimeThemes no
  reporta idiomas; sin contenido real que subtitular todavía)
- [x] Calidad. (v2.1 — selector de fuente/calidad por clip; AnimeThemes suele exponer una sola resolución
  por video, el selector igual queda listo para proveedores con más de una)
- [x] Autoplay. (v2.1 — siguiente episodio con cuenta regresiva, toggle real por perfil)
- [ ] Episodios completos. (fuera de alcance a propósito — ver v2.1 en ROADMAP.md/CLAUDE.md)
- [ ] Siguiente episodio.

---

## v2.8 — Quality, Performance & Stabilization

- [x] Bug real corregido (accesibilidad): texto blanco sobre `--color-primary` no cumplía WCAG AA en
  ningún tema (hasta 1.54:1 en Cyber Neon) — 11 usos en 10 archivos. Nuevo token `--color-on-primary` por
  tema (reutiliza el propio `--color-background`), confirmado con el usuario antes de aplicar.
- [x] Bundle principal 598KB→364KB: `manualChunks` para `framer-motion`/`@headlessui/react`.
- [x] Bug real corregido (race condition): `setTimeout` antes de `navigate()` sin limpiar al desmontar en
  `Login.jsx`/`Register.jsx`/`ResetPassword.jsx`/`ProfileSelect.jsx`.
- [x] `components/admin/StatCard.jsx` + `components/anime/StatCard.jsx` (duplicados) consolidados en
  `components/ui/StatCard.jsx`.
- [x] Auditoría completa sin hallazgos adicionales: AbortController/race-guards, memoización de Context,
  cleanup de listeners/timers, CLS de imágenes, aria-label de botones ícono, código/imports muertos,
  llamadas directas a API fuera de servicios.
- [ ] Reescritura de `useFetch.js` para eliminar el warning `react-hooks/set-state-in-effect` de raíz —
  ya documentado desde v0.8 como diferido (necesita "derive state during render", cambio de arquitectura
  fuera de alcance de este sprint).
- [ ] Reconstruir las entradas de ROADMAP.md/CLAUDE.md para v2.2–v2.7 (perdidas en un corte de contexto
  anterior) — ver nota de proceso en ambos archivos.

---

## v3.1 — Sync Engine

- [x] Auditoría (FASE 1): Favoritos/Mi Lista/Historial/Continuar viendo/Tema/Perfil/Autoplay ya estaban
  sincronizados entre dispositivos (Supabase como única fuente de verdad) — la única divergencia real
  posible es un dispositivo offline al momento de escribir.
- [x] `src/services/sync/offlineQueue.js` + `src/services/sync/SyncManager.js` (nuevo) — cola de
  mutaciones offline, plain JS, nunca dentro de React, nunca importa un servicio.
- [x] Integrado en `collectionService.js` (Favoritos + Mi Lista), `historyService.js` (Historial +
  Continuar viendo), `profilesAccountService.js` (Tema + Autoplay + Perfil) — wrap mínimo, cero cambio de
  comportamiento con conexión.
- [x] Bug real corregido durante la implementación: payload anidado rompía el merge superficial de dos
  ediciones de perfil offline — aplanado.
- [x] Bug real corregido durante la implementación: `ProfileContext.updateProfileById` reemplazaba el
  perfil entero en vez de fusionar — habría vaciado el perfil local en el camino offline.
- [x] Script de verificación con 17 aserciones (offline/dedup/reconexión/2 dispositivos/conflicto real/
  persistencia/error real vs. fallo de red) — 17/17 pasaron.
- [ ] `createProfile`/`deactivateProfile` sin envolver en la cola offline — fuera de alcance a propósito
  (dependen de triggers de validación del estado actual del servidor).
- [ ] Indicador visual de "cambios pendientes de sincronizar" en la UI — no se pidió, queda como mejora
  futura.

---

## v3.2 — Backend Gateway & Observability

- [x] Auditoría (FASE 1): todas las llamadas reales a AniList/Jikan/AnimeThemes mapeadas — sin
  duplicación accidental, solo la fusión ya deliberada de AniList+Jikan en `search()`/`getAnime()`.
- [x] `src/services/gateway/Gateway.js` (nuevo) — fachada de alto nivel, pass-through a `ProviderManager`
  hoy, ninguna página migrada todavía (no se pidió).
- [x] `src/services/gateway/metrics.js` (nuevo) — sistema de métricas solo-en-desarrollo, no-op total en
  producción (verificado: bundle byte-idéntico antes/después).
- [x] `src/services/gateway/healthMonitor.js` (nuevo) — disponibilidad/latencia media/último error/último
  éxito por proveedor.
- [x] `src/services/gateway/cacheMetrics.js` (nuevo) + `utils/cache.js`'s `getCacheSnapshot()` — hit/miss
  ratio + TTL restante.
- [x] `src/services/gateway/dashboard.js` (nuevo) — objeto serializable para un futuro panel, sin
  pantalla (pedido explícito).
- [x] Instrumentados (comportamiento sin cambios): `ProviderManager.js` (`withCache`), `api/jikan.js`/
  `api/anilist.js` (interceptor de reintento).
- [x] Script de verificación con 24 aserciones — incluyó un fallback real (no simulado) y capturó 4
  reintentos reales de Jikan durante la corrida — 24/24 pasaron.
- [ ] AnimeThemes/Playback sin instrumentar — fuera de alcance a propósito (restricción explícita del
  sprint), marcado `tracked: false` en vez de omitido.
- [ ] Migrar las 8 páginas de catálogo (+ las que usan `ProviderManager` directo) a importar desde
  `Gateway.js` — no se pidió este sprint, es el paso siguiente hacia el backend propio.
- [ ] Servidor Backend Gateway real — explícitamente fuera de alcance ("No crear todavía un servidor
  independiente").
