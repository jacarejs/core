# Phase 5 — Nav

## Problem

Single-page apps need URL-driven views without full page reloads. Jacaré pages export `mount()` functions — navigation must pick the right screen, pass params, and clean up on change.

**Core question:** How do you move between `.jcr` screens while keeping Jacaré's direct-DOM model?

## Analysis

### Requirements

1. **URL sync** — `pushState` / `popstate` integration
2. **Layout frame** — optional shell with a content slot
3. **Params** — `/tasks/:id` captures `id`
4. **Guards** — `beforeGo` checks before navigation
5. **Warm** — preload lazy screens before navigation

### Layout + frame

An optional `layout` wraps every screen. Screen content mounts inside an element marked with the `jacare-frame` attribute.

### Declarative links

Use `jacare-go` on anchors — the nav intercepts clicks and syncs the `jacare-here` class:

```html
<a jacare-go="/about" href="/about">About</a>
```

Nav intercepts clicks and syncs the `jacare-here` class on the current link.

## Alternatives

### A. Full page reload per screen
- **Pros:** Simple
- **Cons:** Loses state, slow
- **Verdict:** Rejected

### B. Nested route trees (Vue-style)
- **Pros:** Familiar
- **Cons:** Verbose config, nested `children` arrays
- **Verdict:** Rejected — Jacaré uses flat screen maps

### C. `createNav` with flat screens (chosen)
- **Pros:** Flat config, Jacaré naming, pulse `where()`
- **Cons:** Single layout level
- **Verdict:** Selected

## API

```javascript
import { createNav, lazy } from '@jacare/core'
import Shell from './shell.jcr'
import Tasks from './pages/tasks.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': Tasks,
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  beforeGo: (to, from) => {
    if (to.path === '/admin' && !signedIn()) return '/login'
  },
})

nav.attach(document.getElementById('app'))
nav.go('/about')
nav.warm('/about')
```

### Screen map

| Key | Role |
|-----|------|
| `'/'`, `'/about'` | URL pattern (`:id` for params) |
| `mount` function | Eager screen |
| `lazy(() => import(...))` | Lazy screen (preferred) |
| `() => import(...)` | Lazy screen (zero-arg arrow) |
| `missing` | 404 screen when no match |

```javascript
missing: () => import('./pages/not-found.jcr')
```

### Nav pulse

```javascript
nav.where() // { path, params, search, hash }
```

| Method | Role |
|--------|------|
| `attach(target)` | Mount layout once + active screen in `jacare-frame` |
| `go(path)` | Navigate forward (queued if busy) |
| `swap(path)` | Replace history entry |
| `undo()` | `history.back()` |
| `warm(path)` | Preload lazy screen |

## Project layout

```
src/
  shell.jcr          layout + nav + jacare-frame
  pages/tasks.jcr    screen content
  pages/about.jcr    lazy screen
  pages/not-found.jcr  404 screen
  nav.js              screen map
  boot.js             nav.attach()
index.html
public/
```

## Tests

- Path matching with params
- `beforeGo` redirects
- Lazy `warm` + single load
- Layout frame mounting (layout persists across navigations)
- Navigation queue for rapid `go` calls

## Not yet implemented

| Area | Detail |
|------|--------|
| Compiler `jacare-go` | Wire clicks at compile time |
| Screen transitions | Enter/leave hooks |
| Scroll restoration | Per-screen scroll position |

---

**Next:** [06-devtools.md](06-devtools.md) — Pulse Graph inspector
