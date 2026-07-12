# Jacaré

<p align="center">
  <img src="packages/cli/assets/jacare-logo.png" width="96" alt="Jacaré logo" />
</p>

Next-generation front-end framework. Zero Virtual DOM. Fine-grained reactivity. JavaScript-first modules.

Repository: [github.com/jacarejs/core](https://github.com/jacarejs/core)

## Status

| Phase | Status |
|-------|--------|
| 1 — Reactivity | ✓ |
| 2 — Compiler | ✓ |
| 3 — Incremental DOM | ✓ |
| 4 — SSR | ✓ |
| 5 — Nav | ✓ |
| 6 — DevTools | ✓ |
| 7 — Forms | ✓ |

## Packages

| Package | Description |
|---------|-------------|
| `@jacare/core` | Pulse graph, DOM bindings, SSR |
| `@jacare/compiler` | Compiles `export <view>` / `export <style>` and `view\`...\`` templates |
| `@jacare/vite-plugin` | Vite integration |
| `@jacare/cli` | `jacare` command — create, dev, build |
| `create-jacare` | `npm create jacare` — Vite-based scaffolds |
| `@jacare/devtools` | Pulse Graph inspector panel |

Nav (`createNav`) ships inside `@jacare/core`.

## Commands

```bash
jacare new my-app     # scaffold a project
jacare dev            # start dev server
jacare build          # production build
jacare compile file   # compile one .jcr file
jacare check          # compile all .jcr files in project
```

### Vite templates

Use standard Vite scripts (`vite dev`, `vite build`):

```bash
npm create jacare@latest my-app
npm create jacare@latest my-app -- --template vite-nav

jacare new my-app --template=vite-minimal
jacare new my-app --template=vite-nav
jacare new my-app --template=vite-todo
```

Or with degit:

```bash
npx degit jacarejs/core/templates/vite-minimal my-app
```

## Project layout

```
my-app/
  src/
    app.jcr          # UI + logic
    boot.js           # entry — calls mount()
  index.html          # page shell
  public/             # static assets
  jacare.config.js      # title, port
  jacare.d.ts           # TypeScript module types
```

**With nav** (see `examples/jacare-todo`):

```
my-app/
  src/
    shell.jcr        # layout + nav + jacare-frame
    pages/            # screens
    nav.js            # screen map
    boot.js
  index.html
  public/
  jacare.config.js
  jacare.d.ts
```

## Syntax

### Module

Use `export <view>` blocks (recommended) or tagged templates — both compile to the same output.

**View block (recommended)**

```javascript
import { signal, computed } from '@jacare/core'

const count = signal(0)
const label = computed(() => `Count: ${count()}`)

function increment() {
  count.update((n) => n + 1)
}

export <view>
  <button on-click=${increment}>
    ${label}
  </button>
</view>
```

**Tagged template (legacy)**

```javascript
import { signal, computed, view } from '@jacare/core'

const count = signal(0)
const label = computed(() => `Count: ${count()}`)

export default view`
  <button on-click=${() => count.update((n) => n + 1)}>
    ${label}
  </button>
`
```

**Scoped styles** — place `export <style>` last in the file:

```javascript
export <style>
.counter { padding: 1rem; }
</style>
```

### Template

| Syntax | Meaning |
|--------|---------|
| `${expr}` | Reactive text |
| `on-click=${fn}` | DOM event |
| `bind-href=${url}` | Attribute binding |
| `bind-value=${text}` | Two-way input binding (signal) |
| `bind-checked=${on}` | Two-way checkbox binding (signal) |
| `class-active=${on}` | Toggle class |
| `#if cond` / `#elif` / `#else` / `#end` | Conditional |
| `#for items() as item (id)` / `#end` | Keyed list |
| `<Field :prop=${value} />` | Component (self-closing) |

### Reactivity

| API | Role |
|-----|------|
| `signal(initial)` | Reactive value |
| `computed(() => …)` | Derived value |
| `effect(fn)` | Side effect |

`pulse`, `derive`, and `watch` remain available as aliases.

### Nav

```javascript
import { createNav } from '@jacare/core'
import Shell from './shell.jcr'
import Tasks from './pages/tasks.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': Tasks,
    '/about': () => import('./pages/about.jcr'),
  },
  missing: NotFound,
})

nav.attach(document.getElementById('app'))
```

```html
<a jacare-go="/about" href="/about">About</a>
<a jacare-go="/about?tab=feedback" href="/about?tab=feedback">Feedback</a>
<main jacare-frame></main>
```

**Friendly URLs** — path params (`/tutorial/:topic`), query (`?tab=feedback`), and `routeHref()`:

```javascript
import { createNav, lazy, routeHref, screen } from '@jacare/core'

export const nav = createNav({
  screens: {
    '/tutorial/:topic': lazy(() => import('./pages/tutorial.jcr').then(screen)),
  },
})

nav.go('/tutorial/reactivity')
nav.go('/about?tab=feedback')
routeHref('/tutorial/:topic', { topic: 'forms' }) // → /tutorial/forms
```

**Lifecycle** — per-screen hooks and live Scope debug:

```javascript
import { createLifecycle, registerScope } from '@jacare/core'

export const lifecycle = createLifecycle({
  onActivate(ctx) {
    return registerScope('form.name', 'Name', () => name())
  },
})

// nav.where is Signal<NavPlace>
nav.where()       // reactive read
nav.where.peek    // untracked read
```

`connectJacareDevtools()` also opens the **Scope** panel (bottom-left) for live values registered with `registerScope()`.

See `examples/jacare-todo` — **Tutorial**, **Playground**, and **About → Feedback** (`?tab=feedback`).

### DevTools

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

connectJacareDevtools()
```

### Forms

```javascript
import { createForm } from '@jacare/core'

const form = createForm({
  email: {
    value: '',
    validate: (value) => (value.includes('@') ? undefined : 'Invalid email'),
  },
})

export <view>
  <form on-submit=${form.handleSubmit((values) => console.log(values))}>
    <input bind-value=${form.fields.email} on-blur=${() => form.fields.email.blur()} />
    #if form.fields.email.error()
      <span>${form.fields.email.error()}</span>
    #end
    <button type="submit">Send</button>
  </form>
</view>
```

`bind-value` and `bind-checked` on signals compile to two-way `bindModel` — no manual `on-input` required.

## Quick start

```bash
yarn install
yarn build
yarn jacare new demo
cd demo && yarn install && yarn dev
```

Or run the todo example:

```bash
yarn example:dev
```

## Development

Requires Node.js 20+.

```bash
yarn install
yarn build
yarn test
yarn typecheck
yarn example:dev
yarn example:build
```

## Architecture

- [**API reference**](docs/api.md) — step-by-step guide with examples
- [Syntax reference](docs/syntax.md)
- [Phase 1 — Reactivity](docs/phases/01-reactivity.md)
- [Phase 2 — Compiler](docs/phases/02-compiler.md)
- [Phase 3 — Incremental DOM](docs/phases/03-incremental-dom.md)
- [Phase 4 — SSR](docs/phases/04-ssr.md)
- [Phase 5 — Nav](docs/phases/05-nav.md)
- [Phase 6 — DevTools](docs/phases/06-devtools.md)
- [Phase 7 — Forms](docs/phases/07-forms.md)
- [Contributing & local development](docs/CONTRIBUTING.md)

## Roadmap

1. ~~Reactivity~~
2. ~~Compiler~~
3. ~~Incremental DOM~~
4. ~~SSR~~
5. ~~Nav~~
6. ~~DevTools~~
7. ~~Forms — validation, two-way bindings, field components~~
8. ~~Publish — npm packages (`@jacare/*`, `create-jacare`) and starter templates~~

## Install

```bash
npm install @jacare/core
npm install -D @jacare/cli @jacare/vite-plugin vite
```

Or scaffold a new project:

```bash
npm create jacare@latest my-app
jacare new my-app --template=todo
```

Live demos:

| Demo | URL | Description |
|------|-----|-------------|
| **Todo app** | [jacarejs.github.io/core](https://jacarejs.github.io/core/) | Full task manager with forms, keyed lists, and tutorial routes |
| **Showcase** | [jacarejs.github.io/core/showcase](https://jacarejs.github.io/core/showcase/) | Polished walkthrough of reactivity, components, slots, and scoped CSS |

Run locally:

```bash
yarn showcase:dev   # http://localhost:3001
yarn example:dev    # jacare-todo dev server
```
