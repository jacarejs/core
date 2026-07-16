# @jacare/vite-plugin

[![npm](https://img.shields.io/npm/v/@jacare/vite-plugin.svg?color=189030)](https://www.npmjs.com/package/@jacare/vite-plugin)
[![downloads](https://img.shields.io/npm/dm/@jacare/vite-plugin.svg)](https://www.npmjs.com/package/@jacare/vite-plugin)
[![license](https://img.shields.io/npm/l/@jacare/vite-plugin.svg)](https://github.com/jacarejs/core/blob/main/LICENSE)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![peer](https://img.shields.io/badge/vite-%5E5%20%7C%20%5E6-189030.svg)](https://vitejs.dev)

Vite plugin that compiles `.jcr` files during development and production builds.

When you import a `.jcr` module, this plugin runs `@jacare/compiler` and returns optimized JavaScript with source maps. It also validates **template contracts** against imported children so misuse fails at transform time. No extra build step is required — Vite handles everything.

---

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Project setup](#project-setup)
- [Configuration](#configuration)
- [Plugin options](#plugin-options)
- [How it works](#how-it-works)
- [SSR](#ssr)
- [Inspect mode](#inspect-mode)
- [TypeScript](#typescript)
- [Troubleshooting](#troubleshooting)
- [Links](#links)

---

## Install

```bash
npm install @jacare/vite-plugin @jacare/compiler @jacare/core
npm install -D vite
```

For the Jacaré CLI (scaffold / `jacare dev` / `jacare build`):

```bash
npm install -g @jacare/cli
```

Peer dependency: **Vite** `^5` or `^6`.

npm: [https://www.npmjs.com/package/@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin)

---

## Quick start

### Option A — manual config

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import jacare from '@jacare/vite-plugin'

export default defineConfig({
  plugins: [jacare()],
})
```

### Option B — helper config

```javascript
import { createJacareViteConfig } from '@jacare/vite-plugin'

export default createJacareViteConfig({
  title: 'My App',
  port: 3000,
  base: '/',
})
```

The helper pre-configures the Jacaré plugin, default port, and `optimizeDeps` exclusions.

---

## Project setup

A typical Jacaré + Vite project looks like this:

```
my-app/
  src/
    app.jcr          # UI component
    boot.js          # entry — mounts the app
  index.html         # HTML shell
  public/            # static assets
  jacare.config.js   # app config (optional)
  jacare.d.ts        # TypeScript types for .jcr
  vite.config.js     # Vite config (optional if using @jacare/cli)
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/boot.js"></script>
  </body>
</html>
```

### boot.js

```javascript
import App from './app.jcr'

const root = document.getElementById('app')
App(root)
```

### app.jcr

```javascript
import { pulse, view } from '@jacare/core'

const count = pulse(0)

export default view`
  <button on-click=${() => count.update((n) => n + 1)}>
    Count: ${count}
  </button>
`
```

Run with `npx vite` or `jacare dev` (from `@jacare/cli`).

---

## Configuration

### jacare.config.js

Place this file in the project root. The plugin reads it automatically:

```javascript
export default {
  title: 'My App',   // injected into <title> in index.html
  port: 3000,        // dev server port (used by @jacare/cli)
  base: '/',         // Vite base path (e.g. '/my-app/' for GitHub Pages)
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import jacare from '@jacare/vite-plugin'

export default defineConfig({
  base: '/my-app/',
  plugins: [
    jacare({
      inspect: true,        // write compiled output to .jacare/compiled/
      emit: 'client',       // client | server | full | auto
      runtimeImport: '@jacare/core',
      configFile: 'jacare.config.js',
    }),
  ],
})
```

---

## Plugin options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `emit` | `'auto' \| 'client' \| 'server' \| 'full'` | `'auto'` | Which functions to emit from each `.jcr` file |
| `inspect` | `boolean` | `false` | Write compiled JS to `.jacare/compiled/` for debugging |
| `runtimeImport` | `string` | `'@jacare/core'` | Import path for runtime helpers |
| `configFile` | `string` | `'jacare.config.js'` | Path to app config file |

### Emit modes

| Mode | Behavior |
|------|----------|
| `auto` | `client` for browser builds, `server` for SSR transforms |
| `client` | Emits `mount()` and `resume()` only |
| `server` | Emits `render()` only |
| `full` | Emits all three functions |

---

## How it works

1. Vite encounters an import like `import App from './app.jcr'`
2. The plugin's `transform` hook runs `@jacare/compiler` on the source
3. Compiled JavaScript is returned with a source map pointing back to `.jcr`
4. Vite bundles the result like any other module

The plugin runs with `enforce: 'pre'` so `.jcr` files are compiled before other transforms.

### optimizeDeps

`@jacare/core` is excluded from Vite's dependency pre-bundling because it uses fine-grained reactivity that must not be duplicated across chunks.

### HTML title injection

If `jacare.config.js` sets `title`, the plugin updates `<title>` in `index.html` during dev and build.

---

## SSR

When Vite runs in SSR mode (`transformOptions.ssr === true`), the plugin automatically compiles `.jcr` files with `mode: 'server'` (when `emit` is `'auto'`).

```javascript
// server entry
import { renderToString } from '@jacare/core'
import { render } from './app.jcr'

const { html, state } = render()
const page = renderToString(() => html)
```

On the client, call `resume(root, state)` to hydrate.

---

## Inspect mode

Enable compiled output inspection:

```javascript
jacare({ inspect: true })
```

Compiled files are written to:

```
.jacare/compiled/
  app.js
  Field.js
  ...
```

Useful when debugging what the compiler emits for a specific `.jcr` file.

---

## TypeScript

Add `jacare.d.ts` to your project:

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
    props?: Record<string, unknown>,
  ): () => void
  const _default: typeof mount
  export default _default
}
```

---

## Troubleshooting

### "Failed to resolve import .jcr"

Make sure `@jacare/vite-plugin` is in your Vite `plugins` array and runs before other plugins that might intercept unknown extensions.

### Stale compiled output in dev

Clear Vite's cache:

```bash
rm -rf node_modules/.vite
```

### Compile errors in the browser overlay

The plugin maps `JacareCompileError` to Vite's error overlay with file, line, column, and a source snippet. Fix the `.jcr` source — the overlay points to the original file, not generated JS.

### GitHub Pages / subpath deployment

Set `base` in `jacare.config.js` or `vite.config.js`:

```javascript
export default { base: '/my-repo/' }
```

---

## Links

- [npm — @jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin)
- [Repository](https://github.com/jacarejs/core)
- [Example app](https://github.com/jacarejs/core/tree/main/examples/jacare-todo)
- [Jacaré Lab](https://jacarejs.github.io/core/lab/)
- Related: [@jacare/compiler](https://www.npmjs.com/package/@jacare/compiler) · [@jacare/core](https://www.npmjs.com/package/@jacare/core) · [@jacare/cli](https://www.npmjs.com/package/@jacare/cli)
- Related: [@jacare/compiler](https://www.npmjs.com/package/@jacare/compiler) · [@jacare/core](https://www.npmjs.com/package/@jacare/core) · [@jacare/cli](https://www.npmjs.com/package/@jacare/cli)

## License

MIT
