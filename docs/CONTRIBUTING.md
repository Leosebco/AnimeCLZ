# Contribuir a AnimeCLZ

Esta guía es para cualquier colaborador humano **y para Claude**. Antes de tocar código, léela.

## Cómo leer la documentación

- Empieza siempre por [README.md](README.md) si es tu primera vez en el proyecto.
- Si ya conoces el proyecto y vas a una tarea puntual, ve directo a [CLAUDE.md](CLAUDE.md) — indica qué
  documento(s) consultar según el área que vas a tocar.
- [INDEX.md](INDEX.md) es la tabla completa si necesitas ubicar un tema específico rápido.
- Cada uno de los 16 documentos numerados (`00`–`15`) termina con una sección **Navegación** (anterior /
  índice / siguiente / relacionados) — úsala para moverte entre temas conectados sin buscar manualmente.
- La mayoría de los documentos (`04` en adelante) terminan con una sección `Claude Rules` (o `Reglas para
  Claude` en el `04`) — son las reglas no negociables de ese dominio. Si tu tarea toca esa área, son de
  lectura obligatoria, no opcional.

## Qué documentos consultar antes de modificar una parte del proyecto

| Vas a tocar... | Consulta primero |
|---|---|
| Estructura de carpetas, dónde va un archivo nuevo | [02 Project Structure](02_PROJECT_STRUCTURE.md) |
| Cualquier llamada a una API externa de anime | [01 Architecture](01_ARCHITECTURE.md), [06 Provider Manager](06_PROVIDER_MANAGER.md), [15 API Guidelines](15_API_GUIDELINES.md) |
| Tablas, columnas, migraciones, RLS | [03 Database](03_DATABASE.md), [12 Security](12_SECURITY.md) |
| Login, registro, sesión, OAuth, roles | [04 Authentication](04_AUTHENTICATION.md), [12 Security](12_SECURITY.md) |
| Perfiles, selector de perfiles, avatar, tema por perfil | [05 Profile System](05_PROFILE_SYSTEM.md), [04 Authentication](04_AUTHENTICATION.md) |
| El reproductor de video, calidad, subtítulos, continuar viendo | [07 Player System](07_PLAYER_SYSTEM.md), [06 Provider Manager](06_PROVIDER_MANAGER.md) |
| El panel de administración o cualquier CRUD | [08 Admin Panel](08_ADMIN_PANEL.md), [12 Security](12_SECURITY.md) |
| Componentes visuales, colores, tipografía, animaciones | [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) |
| La página pública de entrada | [10 Landing Page](10_LANDING_PAGE.md), [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) |
| El buscador o autocompletado | [11 Search Engine](11_SEARCH_ENGINE.md), [06 Provider Manager](06_PROVIDER_MANAGER.md) |
| Cualquier cosa relacionada con permisos, tokens, RLS, XSS/CSRF | [12 Security](12_SECURITY.md) |
| Cache, lazy loading, bundle size, Core Web Vitals | [13 Performance](13_PERFORMANCE.md) |
| Manifest, Service Worker, instalación, modo offline | [14 PWA](14_PWA.md) |
| Agregar o modificar un Provider de datos | [06 Provider Manager](06_PROVIDER_MANAGER.md), [15 API Guidelines](15_API_GUIDELINES.md) |

Si una tarea cruza varias áreas (por ejemplo, un nuevo campo de perfil que también se muestra en el
Panel), consulta **todos** los documentos involucrados antes de escribir código — no solo el primero que
parezca relevante.

## Buenas prácticas

- Verifica siempre el código/esquema real antes de asumir que la documentación sigue describiéndolo con
  exactitud — la documentación puede quedar desactualizada; si encuentras una discrepancia, anótala (ver
  "Qué NO hacer" abajo) en vez de asumir que la documentación tiene la última palabra.
- Sigue el orden de prioridad de datos ya definido en
  [06 Provider Manager](06_PROVIDER_MANAGER.md)/[15 API Guidelines](15_API_GUIDELINES.md) — no lo
  reinventes por conveniencia.
- Toda regla de seguridad debe existir también en el backend (RLS), nunca solo en el frontend — ver
  [12 Security](12_SECURITY.md).
- Antes de crear un componente, servicio o hook nuevo, revisa si ya existe uno reutilizable — ver
  [02 Project Structure](02_PROJECT_STRUCTURE.md) y [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md).
- Si tu cambio de código contradice una regla ya documentada, la conversación es con el dueño del
  proyecto, no una decisión unilateral — documenta la propuesta, no la apliques en silencio.

## Qué NO hacer

- **No** llamar a una API externa (Jikan, AniList, TMDB, etc.) directamente desde un componente, página,
  hook o contexto — siempre a través de `ProviderManager` (ver
  [06 Provider Manager](06_PROVIDER_MANAGER.md)).
- **No** deshabilitar ni omitir Row Level Security en una tabla nueva o existente (ver
  [03 Database](03_DATABASE.md), [12 Security](12_SECURITY.md)).
- **No** mezclar responsabilidades entre capas (componentes con lógica de negocio, servicios que
  renderizan JSX, contextos con fetch repetitivo) — ver [01 Architecture](01_ARCHITECTURE.md).
- **No** resumir, reescribir ni reordenar el contenido técnico de los 16 documentos numerados al
  editarlos — solo se corrige cuando el contenido documentado ya no es cierto, y ese cambio se registra en
  [CHANGELOG.md](CHANGELOG.md).
- **No** inventar decisiones arquitectónicas nuevas en [DECISIONS.md](DECISIONS.md) — ese archivo solo
  registra decisiones que ya están descritas en la documentación existente.
- **No** modificar código de producto durante un sprint declarado exclusivamente de documentación — si
  detectas algo que debería corregirse en el código mientras documentas, anótalo como recomendación para
  un sprint futuro, no lo implementes de inmediato.

## Para Claude específicamente

Antes de proponer o aplicar un cambio de arquitectura, revisa como mínimo:

- [01 Architecture](01_ARCHITECTURE.md)
- [06 Provider Manager](06_PROVIDER_MANAGER.md)
- [12 Security](12_SECURITY.md)

Ver [CLAUDE.md](CLAUDE.md) para el mapa completo de lectura obligatoria por tipo de tarea.
