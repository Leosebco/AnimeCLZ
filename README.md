# AnimeCLZ — Foundation

Architectural scaffold only. No Home page, no auth, no content cards yet —
see "Next phase" below.

## Setup

```bash
npm install
npm run dev
```

## Folder structure

```
AnimeCLZ/
├── public/                  # Static assets served as-is (favicon, robots.txt)
├── src/
│   ├── assets/               # Images, illustrations, static media imported by components
│   │   └── images/
│   ├── components/
│   │   └── ui/                # Generic, domain-agnostic primitives (Button, Container...)
│   │                           # If a component doesn't know what "movie" means, it goes here.
│   ├── layout/                # App shell: Layout.jsx, Navbar.jsx, Footer.jsx
│   │                           # Persistent chrome that wraps every page via <Outlet />
│   ├── pages/                  # Route-level views (one file per route). Currently placeholders.
│   ├── router/                 # AppRouter.jsx — the single source of truth for route paths
│   ├── hooks/                  # Custom hooks (useAuth, useFetch, useDebounce...) — empty, ready
│   ├── context/                 # React Context providers for cross-cutting state (auth, theme) — empty, ready
│   ├── services/                # API layer — functions that talk to a backend/TMDB/etc — empty, ready
│   ├── utils/                   # Pure helper functions (cn.js className merger lives here)
│   ├── constants/                # Route paths, nav config — the rest of the app imports from here,
│   │                              # never hardcodes a path or link list
│   └── styles/
│       └── index.css             # Tailwind v4 entry point + design tokens (@theme block)
├── index.html
├── vite.config.js               # Vite + React + Tailwind v4 plugin + "@" path alias
├── jsconfig.json                # Editor support for the "@" alias
└── package.json
```

### Why this shape

- **`components/ui` vs `layout` vs `pages`** — three different lifetimes. `ui/` primitives
  are reused everywhere and know nothing about AnimeCLZ's domain. `layout/` is the fixed
  shell rendered once. `pages/` are swapped in and out by the router.
- **`constants/`** exists so a route path or nav label is never duplicated across the Navbar,
  Footer, and router — change it once, it propagates everywhere.
- **`services/`, `context/`, `hooks/`** are created empty on purpose: this is where the data
  layer (TMDB/your API), global state (auth/session), and reusable logic will live as the app
  grows, without needing to restructure later.

## Design system

Tailwind v4 is configured entirely in CSS (`src/styles/index.css`) via the `@theme` block —
there is no separate `tailwind.config.js`. Tokens:

| Token | Value | Use |
|---|---|---|
| `background` | `#0B0F1A` | App base (midnight, not pure black) |
| `surface` / `surface-alt` | `#131A2B` / `#1B2436` | Navbar, footer, raised panels |
| `accent` | `#F5A623` | Primary CTA, "marquee gold" |
| `accent-secondary` | `#7C5CFC` | Gradient pairing, focus states |
| `text` / `text-muted` | `#F4F5F7` / `#8A93A6` | Body copy / secondary copy |

Type: `font-display` (Space Grotesk — headings, wordmark), `font-body` (Inter — everything
else), `font-mono` (JetBrains Mono — timestamps, captions, footer meta).

Signature element: the gradient wordmark (`.brand-gradient`) and the animated glow that slides
under the active Navbar link (Framer Motion `layoutId="nav-glow"`).

## Next phase (not built yet)

- Home page (hero, rows)
- Auth pages (Login/Register)
- Content cards + detail pages
- Data layer inside `services/`
