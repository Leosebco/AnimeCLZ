# Lectura obligatoria para Claude

Este archivo se lee **antes** de trabajar en AnimeCLZ. No reemplaza al `CLAUDE.md` de la raíz del
repositorio (ese cubre flujo de trabajo, comandos y el estado actual del código) — este es específico de
cómo navegar la documentación en `docs/`.

## Orden obligatorio de lectura

1. Si es la primera vez que trabajas en este proyecto: [README.md](README.md) completo.
2. Si ya conoces el proyecto y vas a una tarea puntual: la tabla de abajo, "Qué documentos consultar
   según la tarea" — lee **todos** los documentos que aplican a tu tarea antes de escribir código.
3. Antes de cualquier cambio de **arquitectura** (nueva capa, nuevo patrón, romper una regla existente),
   revisa como mínimo:
   - [01 Architecture](01_ARCHITECTURE.md)
   - [06 Provider Manager](06_PROVIDER_MANAGER.md)
   - [12 Security](12_SECURITY.md)

   Sin excepciones — aunque la tarea parezca no tocar seguridad ni el Provider Manager directamente.

## Qué documentos consultar según la tarea

| Tarea | Documento(s) obligatorio(s) |
|---|---|
| Cualquier cambio de arquitectura o de capas | [01 Architecture](01_ARCHITECTURE.md) → [06 Provider Manager](06_PROVIDER_MANAGER.md) → [12 Security](12_SECURITY.md) |
| Dónde colocar un archivo/carpeta nueva | [02 Project Structure](02_PROJECT_STRUCTURE.md) |
| Tocar cualquier tabla, columna o política de Supabase | [03 Database](03_DATABASE.md) → [12 Security](12_SECURITY.md) |
| Login, sesión, OAuth, roles, rutas protegidas | [04 Authentication](04_AUTHENTICATION.md) → [12 Security](12_SECURITY.md) |
| Perfiles, selector de perfiles, avatar, tema/fondo por perfil | [05 Profile System](05_PROFILE_SYSTEM.md) → [04 Authentication](04_AUTHENTICATION.md) |
| Consultar o agregar una fuente de datos de anime | [06 Provider Manager](06_PROVIDER_MANAGER.md) → [15 API Guidelines](15_API_GUIDELINES.md) |
| El reproductor (calidad, subtítulos, servidores, continuar viendo) | [07 Player System](07_PLAYER_SYSTEM.md) → [06 Provider Manager](06_PROVIDER_MANAGER.md) |
| Panel de administración / cualquier CRUD | [08 Admin Panel](08_ADMIN_PANEL.md) → [12 Security](12_SECURITY.md) |
| Componentes visuales, colores, tipografía, animaciones | [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) |
| Landing page pública | [10 Landing Page](10_LANDING_PAGE.md) → [09 UI / UX Design System](09_UI_UX_DESIGN_SYSTEM.md) |
| Buscador / autocompletado | [11 Search Engine](11_SEARCH_ENGINE.md) → [06 Provider Manager](06_PROVIDER_MANAGER.md) |
| Cualquier cosa de permisos, tokens, RLS, XSS/CSRF | [12 Security](12_SECURITY.md) |
| Cache, lazy loading, bundle size, Core Web Vitals | [13 Performance](13_PERFORMANCE.md) |
| Manifest, Service Worker, offline, instalación | [14 PWA](14_PWA.md) → [13 Performance](13_PERFORMANCE.md) |
| Documentación en sí (`docs/`) | [CONTRIBUTING.md](CONTRIBUTING.md) → [CHANGELOG.md](CHANGELOG.md) |
| Entender por qué algo se hizo así (no cómo) | [DECISIONS.md](DECISIONS.md) |

## Reglas generales

- **Nunca modificar arquitectura sin revisar** [01 Architecture](01_ARCHITECTURE.md),
  [06 Provider Manager](06_PROVIDER_MANAGER.md) y [12 Security](12_SECURITY.md) — sin importar qué tan
  pequeño parezca el cambio.
- **Nunca** tratar la documentación como algo que se pueda resumir o parafrasear al citarla — si necesitas
  mostrarle al usuario una regla existente, cita el documento y la sección exacta.
- **Nunca** inventar una decisión arquitectónica y presentarla como si ya existiera — si no está en
  [DECISIONS.md](DECISIONS.md) ni en los documentos `00`–`15`, es una propuesta nueva, no un hecho.
- Cada documento numerado (`04` en adelante) termina con una sección `Claude Rules` (`Reglas para Claude`
  en el `04`) — son las reglas no negociables de ese dominio. Léelas siempre antes de tocar esa área.
- Si detectas que el código real ya no coincide con lo documentado, o que algo debería corregirse en el
  código durante un sprint de documentación, **anótalo como recomendación** — no lo implementes en el
  mismo sprint, salvo que el usuario lo pida explícitamente.
- Un sprint declarado "solo documentación" nunca toca archivos fuera de `docs/` — ni un componente, ni un
  servicio, ni una migración, ni configuración de build.

## Navegación

Cada uno de los 16 documentos técnicos (`00`–`15`) tiene, al final, una sección de Navegación con enlaces
al documento anterior, al [INDEX.md](INDEX.md) y al documento siguiente, más los documentos relacionados
por tema. Úsala para moverte sin perder contexto.
