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

Jacaré files (`.jcr`) are plain JavaScript modules. Write your logic, then export a view block. Add scoped styles last.

Full reference: [docs/syntax.md](docs/syntax.md) · [docs/api.md](docs/api.md)

### Simple module

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

function increment() {
  count.update((n) => n + 1)
}

export <view>
  <div class="counter">
    <p>${count}</p>
    <button on-click=${increment}>+1</button>
  </div>
</view>

export <style>
.counter { display: grid; gap: 0.5rem; padding: 1rem; }
</style>
```

| Block | Purpose |
|-------|---------|
| `import` / `const` / `function` | JavaScript logic |
| `export <view>...</view>` | HTML template (required) |
| `export <style>...</style>` | Scoped CSS (optional, last) |

`export <style lang="scss">` is supported for preprocessor attributes. Tagged templates (`view\`...\`` / `style\`...\``) still work.

### Template bindings

| Syntax | Meaning |
|--------|---------|
| `${expr}` | Reactive text (signals update the DOM directly) |
| `on-click=${fn}` | DOM event (`@click` alias) |
| `bind-href=${url}` | Reactive attribute (`:href` alias) |
| `bind-value=${field}` | Two-way input binding on a signal |
| `bind-checked=${on}` | Two-way checkbox binding on a signal |
| `class-active=${on}` | Toggle a CSS class (`class:active` alias) |
| `#if cond` … `#elif` … `#else` … `#end` | Conditional blocks |
| `#for items() as item (item.id)` … `#end` | Keyed list reconciliation |

### Reactivity

| API | Role |
|-----|------|
| `signal(initial)` | Mutable reactive value — read with `count()`, write with `count.set()` / `count.update()` |
| `computed(() => …)` | Derived read-only value |
| `effect(fn)` | Side effect when tracked signals change |

Aliases: `pulse`, `derive`, `watch`.

### Components and props

Import a `.jcr` file and use it as a **PascalCase** tag. Props use `:name=${expr}`.

**Child component** (`Badge.jcr`) — `text` is inferred as a mount prop:

```javascript
export <view>
  <span class="badge">${text}</span>
</view>

export <style>
.badge { padding: 0.25rem 0.65rem; border-radius: 999px; font-weight: 700; }
</style>
```

**Parent page** — pass a signal or a string:

```javascript
import Badge from './components/Badge.jcr'
import { signal } from '@jacare/core'

const mood = signal('focused')

export <view>
  <Badge :text=${mood} />
  <Badge :text=${'static label'} />
</view>
```

| Prop style | Example | Compiled as |
|------------|---------|-------------|
| Reactive expression | `:text=${mood}` | `text: mood` |
| String literal | `:title=${'Hello'}` | `title: 'Hello'` |
| Static attribute | `type="email"` | `type: "email"` |

**Component with slots** (`Card.jcr`):

```javascript
export <view>
  <div class="card">
    <h3 class="card-title">${title}</h3>
    #if subtitle
      <p class="card-subtitle">${subtitle}</p>
    #end
    <div class="card-body">
      <slot />
    </div>
  </div>
</view>
```

**Usage with children and props:**

```javascript
import Card from './components/Card.jcr'

export <view>
  <Card :title=${'Hello'} :subtitle=${'A reusable card'}>
    <p>This content is projected into the default slot.</p>
  </Card>
</view>
```

Props used in the child template (`title`, `subtitle`) but not declared in the child script are automatically treated as mount props. Signal props stay reactive via `bindPropText`.

### Nav

```javascript
import { createNav, lazy } from '@jacare/core'
import Shell from './shell.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': () => import('./pages/home.jcr'),
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  missing: () => import('./pages/not-found.jcr'),
})

nav.attach(document.getElementById('app'))
```

```html
<a jacare-go="/about" href="/about">About</a>
<main jacare-frame></main>
```

Path params, query strings, lazy screens, and guards — see [docs/api.md](docs/api.md#9-navigation).

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

### DevTools

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

connectJacareDevtools()
```

Opens the Pulse Graph and Scope panels in development.

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
