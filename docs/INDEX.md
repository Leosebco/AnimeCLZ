# AnimeCLZ Bible — Índice

Índice completo de `docs/`. Ver también [README.md](README.md) para la guía de lectura y
[CLAUDE.md](CLAUDE.md) para qué consultar según la tarea.

## Documentos técnicos (Bible)

| Documento | Descripción |
|------------|-------------|
| [00 Project Vision](00_PROJECT_VISION.md) | Visión, filosofía, objetivos y principios generales del proyecto. |
| [01 Architecture](01_ARCHITECTURE.md) | Arquitectura por capas, principios y flujo de datos oficial de AnimeCLZ. |
| [02 Project Structure](02_PROJECT_STRUCTURE.md) | Estructura de carpetas, convenciones y organización del código fuente. |
| [03 Database](03_DATABASE.md) | Esquema de base de datos, tablas, relaciones, RLS y migraciones en Supabase. |
| [04 Authentication](04_AUTHENTICATION.md) | Sistema de autenticación, sesiones, OAuth, roles y rutas protegidas. |
| [05 Profile System](05_PROFILE_SYSTEM.md) | Sistema de perfiles múltiples por cuenta (estilo Netflix). |
| [06 Provider Manager](06_PROVIDER_MANAGER.md) | Arquitectura multi-proveedor de datos de anime (AniList, Jikan, Kitsu, TMDB...). |
| [07 Player System](07_PLAYER_SYSTEM.md) | Sistema de reproducción de video: calidad, subtítulos, servidores y continuar viendo. |
| [08 Admin Panel](08_ADMIN_PANEL.md) | Panel de administración y control de todo el contenido del sitio. |
| [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) | Sistema de diseño visual, identidad, temas y componentes de interfaz. |
| [10 Landing Page](10_LANDING_PAGE.md) | Estructura y contenido de la página de aterrizaje pública. |
| [11 Search Engine](11_SEARCH_ENGINE.md) | Motor de búsqueda inteligente de anime, personajes y estudios. |
| [12 Security](12_SECURITY.md) | Reglas de seguridad, RLS y buenas prácticas en frontend/backend. |
| [13 Performance](13_PERFORMANCE.md) | Estrategias de rendimiento, cache y optimización de la aplicación. |
| [14 PWA](14_PWA.md) | Configuración de Progressive Web App: instalación, offline, manifest. |
| [15 API Guidelines](15_API_GUIDELINES.md) | Lineamientos oficiales para el uso y reemplazo de APIs externas. |

## Documentos de gobierno

| Documento | Descripción |
|------------|-------------|
| [README.md](README.md) | Puerta de entrada: qué es AnimeCLZ, arquitectura general y orden de lectura. |
| [INDEX.md](INDEX.md) | Este archivo — índice completo de la documentación. |
| [CLAUDE.md](CLAUDE.md) | Orden de lectura obligatorio y qué documentos consultar antes de tocar código. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guía para colaboradores humanos y para Claude: buenas prácticas y qué NO hacer. |
| [CHANGELOG.md](CHANGELOG.md) | Historial de versiones de la documentación (no del código fuente). |
| [DECISIONS.md](DECISIONS.md) | Registro de decisiones arquitectónicas (ADR) ya adoptadas por el proyecto. |

## Carpetas

| Carpeta | Contenido |
|------------|-------------|
| `assets/` | Recursos estáticos de la documentación (hoy vacía). |
| `images/` | Capturas de pantalla y diagramas exportados como imagen (hoy vacía). |
| `diagrams/` | Diagramas fuente editables — p. ej. `.mmd` de Mermaid o `.excalidraw` (hoy vacía). |
| `adr/` | Reservada para futuros ADR individuales, uno por archivo (hoy vacía — el registro actual vive en [DECISIONS.md](DECISIONS.md)). |
