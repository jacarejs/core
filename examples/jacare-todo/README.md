# Jacaré Todo — Example App

Full-featured demo for the Jacaré framework: tasks, tutorial, playground, forms, and DevTools.

Live demo: [jacarejs.github.io/core/todo](https://jacarejs.github.io/core/todo/)

## Run locally

From the monorepo root:

```bash
yarn install
yarn build
yarn example:dev
```

Open `http://localhost:3000`

## Build

```bash
yarn example:build
```

For GitHub Pages (subpath `/core/todo/`):

```bash
JACARE_BASE=/core/todo/ yarn build
```

## Project structure

```
src/
  shell.jcr          layout + navigation
  pages/             screens (tasks, about, tutorial, playground)
  components/        Field, LessonNav
  nav.js             route map + createRoute()
  boot.js            entry + DevTools
  app-base.js        appHref() / appRoute() for GH Pages base
index.html           global styles
public/              jacare-logo.png
jacare.config.js
```

## Navigation pattern

Use **route-relative** paths for `jacare-go` and **base-aware** URLs for `href`:

```javascript
<a jacare-go="/tutorial" href=${appHref('/tutorial')}>Tutorial</a>
```

- `jacare-go` — internal route (no deploy base prefix)
- `href` — browser fallback with Vite `base` (`/core/todo/` on GitHub Pages)

## Features demonstrated

| Route | Features |
|-------|----------|
| `/` | Keyed lists, search, two-way bindings, stats |
| `/tutorial/*` | Lesson pages, lazy loading, code samples |
| `/playground` | Live Scope panel |
| `/about` | Tabs via query string, `createForm`, lifecycle |
| 404 | `missing` screen |

## Check

```bash
node ../../packages/cli/dist/index.js check
```
