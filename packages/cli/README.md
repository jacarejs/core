# @jacare/cli

Command-line tool to **create**, **develop**, **build**, and **check** Jacaré applications.

Jacaré is a fine-grained reactive UI framework with no Virtual DOM. This CLI wraps Vite and the Jacaré compiler so you can start a project in seconds.

---

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Commands](#commands)
- [Create a project](#create-a-project)
- [Development server](#development-server)
- [Production build](#production-build)
- [Compile a single file](#compile-a-single-file)
- [Check all files](#check-all-files)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Templates](#templates)
- [TypeScript support](#typescript-support)
- [Troubleshooting](#troubleshooting)
- [Links](#links)

---

## Install

### Global install

```bash
npm install -g @jacare/cli
```

Then use the `jacare` command anywhere:

```bash
jacare new my-app
jacare dev
```

### Local install (recommended for projects)

```bash
npm install -D @jacare/cli
```

```json
{
  "scripts": {
    "dev": "jacare dev",
    "build": "jacare build",
    "check": "jacare check"
  }
}
```

### Without installing

```bash
npx @jacare/cli new my-app
npx @jacare/cli dev
```

---

## Quick start

```bash
jacare new my-shop --template=todo
cd my-shop
npm install
jacare dev
```

Open `http://localhost:3000` — the dev server starts with hot reload for `.jcr` files.

---

## Commands

| Command | Description |
|---------|-------------|
| `jacare new <name>` | Scaffold a new project |
| `jacare dev` | Start the Vite dev server |
| `jacare build` | Production build to `dist/` |
| `jacare compile <file>` | Compile one `.jcr` file to JS |
| `jacare check` | Compile-check all `.jcr` files |
| `jacare help` | Show help |

### Vite-based templates

These use `vite`, `vite build`, and `vite preview` instead of `jacare dev`:

| Template | Description |
|----------|-------------|
| `vite-minimal` | Single-page counter |
| `vite-nav` | Multi-page with routing |
| `vite-todo` | Todo app with devtools |

```bash
jacare new my-app --template=vite-minimal
npm create jacare@latest my-app -- --template vite-nav
```

---

## Create a project

```bash
jacare new <name> [--template=minimal|nav|todo|vite-minimal|vite-nav|vite-todo]
```

### Examples

```bash
jacare new hello-world
jacare new my-blog --template=nav
jacare new my-shop --template=todo
```

### What gets created

```
my-app/
  src/
    app.jcr          # or shell.jcr + pages/ for nav/todo
    boot.js          # entry point
  index.html
  public/
  package.json
  jacare.config.js
  jacare.d.ts
```

After creation:

```bash
cd my-app
npm install    # or yarn install
jacare dev
```

---

## Development server

```bash
jacare dev [--port=3000] [--open=false]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--port` | `3000` (or `jacare.config.js`) | Dev server port |
| `--open` | `true` | Open browser on start |

### Examples

```bash
jacare dev
jacare dev --port=4000
jacare dev --open=false
```

The dev server uses Vite with `@jacare/vite-plugin`. Changes to `.jcr` files hot-reload instantly.

---

## Production build

```bash
jacare build
```

Output goes to `dist/`:

```
dist/
  index.html
  assets/
    index-abc123.js
    index-def456.css
```

Serve `dist/` with any static host (Netlify, Vercel, GitHub Pages, nginx, etc.).

### GitHub Pages

Set the base path in `jacare.config.js`:

```javascript
export default {
  title: 'My App',
  base: '/my-repo/',
}
```

---

## Compile a single file

Compile one `.jcr` file without Vite:

```bash
jacare compile src/app.jcr
jacare compile src/app.jcr dist/app.js
jacare compile src/app.jcr --watch
```

| Argument | Description |
|----------|-------------|
| `<file.jcr>` | Input file (required) |
| `[output.js]` | Output path (optional — defaults to same name with `.js`) |
| `--watch` | Recompile on file changes |

Useful for inspecting compiler output or integrating with custom pipelines.

---

## Check all files

Validate every `.jcr` file in the project without building:

```bash
jacare check
```

```
ok src/app.jcr
ok src/pages/about.jcr
ok src/pages/home.jcr

3 file(s) ok
```

Exits with code `1` if any file fails to compile. Ideal for CI:

```yaml
- run: npm install
- run: npx jacare check
```

---

## Project structure

### Minimal app (single page)

```
src/
  app.jcr       # UI + state
  boot.js       # mounts app.jcr
index.html
public/
jacare.config.js
```

### App with navigation

```
src/
  shell.jcr     # layout with <main jacare-frame>
  pages/
    home.jcr
    about.jcr
    not-found.jcr
  nav.js        # createNav() screen map
  boot.js       # nav.attach()
index.html
```

### boot.js example

```javascript
import App from './app.jcr'

const root = document.getElementById('app')
App(root)
```

### boot.js with navigation

```javascript
import { nav } from './nav.js'

nav.attach(document.getElementById('app'))
```

---

## Configuration

`jacare.config.js` in the project root:

```javascript
export default {
  title: 'My App',   // page title (injected into index.html)
  port: 3000,        // default dev server port
  base: '/',         // Vite base path for deployment
}
```

The CLI reads this file for `dev` and `build`. You can override the port with `--port`.

---

## Templates

| Template | Dev command | Description |
|----------|-------------|-------------|
| `minimal` | `jacare dev` | Single-page counter app |
| `nav` | `jacare dev` | Multi-page app with routing, lazy loading, and shell layout |
| `todo` | `jacare dev` | Full todo app with forms, filters, devtools, and nav |
| `vite-minimal` | `vite` | Same as minimal, standard Vite scripts |
| `vite-nav` | `vite` | Same as nav, standard Vite scripts |
| `vite-todo` | `vite` | Same as todo, standard Vite scripts |

### minimal

A simple counter to understand pulses and templates.

### nav

Includes:
- `shell.jcr` with `jacare-frame`
- `nav.js` with `createNav()` and lazy screens
- `jacare-go` / `jacare-here` link helpers
- 404 page

### todo

Everything in `nav`, plus:
- Form handling with `createForm()`
- Filtered lists with `#for`
- `@jacare/devtools` integration
- Logo asset in `public/`

---

## TypeScript support

Scaffolded projects include `jacare.d.ts` for `.jcr` module imports:

```typescript
declare module '*.jcr' {
  export function mount(
    target: HTMLElement,
    props?: Record<string, unknown>,
  ): () => void
  export function render(
    props?: Record<string, unknown>,
  ): { html: string; state: unknown }
  export function resume(
    target: HTMLElement,
    state: unknown,
  ): () => void
  const _default: typeof mount
  export default _default
}
```

Add `"checkJs": true` in `jsconfig.json` for type checking in `.js` files.

---

## Troubleshooting

### Port already in use

```bash
jacare dev --port=4000
```

Or change `port` in `jacare.config.js`.

### Directory already exists

`jacare new` refuses to overwrite. Choose a different name or remove the existing folder.

### Compile errors

Run `jacare check` to see all errors at once. Each error shows file, line, and a source snippet.

### Module not found: @jacare/core

Run `npm install` in the project directory after `jacare new`.

---

## Links

- [Repository](https://github.com/jacarejs/core)
- [Live demo](https://jacarejs.github.io/core/todo/)
- [Syntax guide](https://github.com/jacarejs/core/blob/main/docs/syntax.md)
- [Example todo app](https://github.com/jacarejs/core/tree/main/examples/jacare-todo)

## License

MIT
