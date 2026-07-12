# Jacaré

<p align="center">
  <img src="packages/cli/assets/jacare-logo.png" width="140" alt="Jacaré logo" />
</p>

**Jacaré** is a front-end framework for building fast, reactive web apps with plain JavaScript — no Virtual DOM, no component re-renders, no proprietary file format.

Repository: [github.com/jacarejs/core](https://github.com/jacarejs/core)

## Quick start

```bash
npm create jacare@latest my-app
cd my-app && npm install && npm run dev
```

Open `http://localhost:5173` — a reactive counter is already running.

**How small is it?**

| | |
|---|---|
| First screen | **~15 lines** in `src/app.jcr` |
| Scaffold | **8 files** — `app.jcr`, `boot.js`, `index.html`, Vite config |
| Runtime | **~1.2 KB gzip** (core reactivity; DOM helpers added per use) |

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

export <view>
  <main>
    <p>Count: ${count}</p>
    <button on-click=${() => count.update((n) => n + 1)}>+1</button>
  </main>
</view>
```

Templates: `minimal` (counter), `nav` (multi-page), `todo` (forms + devtools).

```bash
npm create jacare@latest my-app -- --template vite-nav
```

## What is Jacaré?

Jacaré is a **compile-time UI framework**. You write `.jcr` files — normal JavaScript modules with an HTML-like template — and a compiler turns them into direct DOM operations. When state changes, only the nodes that depend on that state update. The rest of the page is untouched.

```
Your .jcr file          Compiler                 Browser
─────────────          ────────                 ───────
signal + logic    →    mount() function    →    real DOM nodes
export <view>          bindText, branch,        updated one-by-one
export <style>         reconcileKeyedList       when signals change
```

**What it is not:** a React/Vue clone, a runtime template parser, or a resumability-first meta-framework. Jacaré optimizes for **predictable incremental DOM updates** with a small runtime and zero reconciliation tree.

## Why use Jacaré?

### The problem with re-rendering

Most frameworks treat UI as `UI = f(state)` and re-run `f` on every change — often diffing a virtual tree across a whole component subtree. That works, but it means:

- Updating one counter re-executes every hook and child in that component
- Lists re-diff even when only one row changed
- Memory is allocated for virtual nodes on every pass
- Performance depends on memoization (`useMemo`, `React.memo`, `v-memo`) to stay acceptable

Jacaré asks a different question: **why re-render anything when only one text node changed?**

### What Jacaré does instead

| Concern | Typical VDOM framework | Jacaré |
|---------|------------------------|--------|
| State → UI | Re-run component, diff tree | Signal notifies bound nodes only |
| List updates | Reconcile by key in virtual tree | `reconcileKeyedList` patches real DOM |
| Templates | Runtime parser or JSX transform | Compile-time → static `createElement` calls |
| Styles | Global CSS or CSS-in-JS runtime | Co-located `export <style>`, scoped at compile time |
| Bundle | Framework + reconciler | Small runtime; imports only what each file uses |

### When Jacaré is a good fit

- **Interactive dashboards** — many independent values updating without cascading re-renders
- **Forms and live data** — two-way `bind-value` on signals, field-level validation
- **Lists and tables** — keyed `#for` reconciles rows by id, not by re-mounting the list
- **Multi-page apps** — built-in `createNav` with lazy screens, no router library required
- **Teams that want JavaScript first** — no new language, no JSX pragma, no SFC magic; just modules + templates

### When to consider something else

- You need the largest ecosystem of third-party components (React/Vue win today)
- Your team is standardized on JSX or Single-File Components and migration cost is high
- You rely heavily on a specific meta-framework (Next, Nuxt, etc.) — Jacaré ships its own nav and SSR primitives instead

## What you get out of the box

| Layer | Package | Purpose |
|-------|---------|---------|
| Runtime | `@jacare/core` | Signals, DOM bindings, nav, forms, SSR |
| Compiler | `@jacare/compiler` | `.jcr` → `mount` / `render` / `resume` |
| Tooling | `@jacare/cli`, `@jacare/vite-plugin` | `jacare dev`, `jacare build`, HMR |
| DevTools | `@jacare/devtools` | Pulse Graph — visualize signal dependencies live |
| Scaffolding | `create-jacare` | `npm create jacare@latest` |

Live demos: [Todo app](https://jacarejs.github.io/core/) · [Showcase](https://jacarejs.github.io/core/showcase/)

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

Jacaré files (`.jcr`) are **plain JavaScript modules**. You keep all business logic in normal JS — `import`, `const`, `function` — and describe the UI in an `export <view>` block. Styles live in `export <style>` at the end of the file.

**Why this shape?** One file = one feature. The compiler reads the template at build time, infers props and signals, and emits optimized DOM code. You never parse HTML strings at runtime.

Full reference: [docs/syntax.md](docs/syntax.md) · [docs/api.md](docs/api.md)

### Simple module

A minimal app: a signal holds state, the template binds to it, a click handler mutates it. Only the `<p>` text node re-runs when `count` changes — not the button, not the wrapper.

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
| `import` / `const` / `function` | JavaScript logic — runs once at module load |
| `export <view>...</view>` | Declarative UI — compiled to `mount()` |
| `export <style>...</style>` | Scoped CSS — selectors rewritten with `[data-jacare-s]` |

`export <style lang="scss">` accepts a `lang` attribute for preprocessors. Legacy tagged templates (`view\`...\`` / `style\`...\``) still compile to the same output.

### Template bindings

Bindings are **compile-time**. The compiler picks the thinnest runtime helper for each pattern — `bindText` for signals, `bindModel` for two-way inputs, `branch` for `#if`, etc.

| Syntax | What it does | Why use it |
|--------|--------------|------------|
| `${expr}` | Reactive text | Display live values without manual `textContent` updates |
| `on-click=${fn}` | DOM event | Declarative handlers with automatic cleanup on unmount |
| `bind-href=${url}` | Reactive attribute | Keep `href`, `src`, `disabled` in sync with state |
| `bind-value=${field}` | Two-way input | Signal ↔ input stay synced — no `on-input` boilerplate |
| `bind-checked=${on}` | Two-way checkbox | Same for checkboxes |
| `class-active=${on}` | Toggle class | Conditional styling without string concatenation |
| `#if` / `#elif` / `#else` / `#end` | Show/hide branches | Compiler emits `branch()` — only active DOM exists |
| `#for … as item (key)` / `#end` | Keyed lists | Move/add/remove rows by key — no full list re-render |

### Reactivity

Signals are **functions you call** — `count()` reads, `count.set(5)` writes. The compiler wires reads to DOM nodes; you never call `render()` yourself.

| API | Role | When to use |
|-----|------|-------------|
| `signal(initial)` | Mutable reactive cell | User input, toggles, fetched data |
| `computed(() => …)` | Cached derived value | Totals, filters, formatted labels |
| `effect(fn)` | Side effect on change | `document.title`, logging, integrations |

Aliases `pulse`, `derive`, `watch` exist for brevity. Prefer `signal`, `computed`, `effect` in new code.

### Components and props

Split UI into reusable `.jcr` files. Import them as **PascalCase tags** — the compiler calls their `mount()` function and passes props.

**Why components?** Encapsulate markup, scoped styles, and slot content. Parent state flows in via props; children stay independent — updating a signal in the parent only re-runs bound nodes in the affected component.

**Child** (`Badge.jcr`) — identifiers in the template that are not declared in the script become **mount props**:

```javascript
export <view>
  <span class="badge">${text}</span>
</view>

export <style>
.badge { padding: 0.25rem 0.65rem; border-radius: 999px; font-weight: 700; }
</style>
```

**Parent** — pass a live signal or a static string:

```javascript
import Badge from './components/Badge.jcr'
import { signal } from '@jacare/core'

const mood = signal('focused')

export <view>
  <Badge :text=${mood} />
  <Badge :text=${'static label'} />
</view>
```

| Prop style | Example | Behavior |
|------------|---------|----------|
| Reactive expression | `:text=${mood}` | Child re-renders text when signal changes |
| String literal | `:title=${'Hello'}` | Static prop, set once at mount |
| HTML attribute | `type="email"` | Passed as string prop |

**Slots** — project parent content into a child without prop drilling:

```javascript
// Card.jcr
export <view>
  <div class="card">
    <h3>${title}</h3>
    <div class="card-body"><slot /></div>
  </div>
</view>

// Page.jcr
<Card :title=${'Hello'}>
  <p>Projected into the default slot.</p>
</Card>
```

`<slot />` in the child receives whatever markup the parent places between the opening and closing tags.

### Nav

Multi-page apps without React Router or Vue Router. `createNav` mounts a **layout shell** and swaps **screens** inside `<main jacare-frame>`.

**Why built-in nav?** Screens are lazy-loaded `.jcr` modules. URL changes update only the frame content — the shell (header, footer) stays mounted. Guards, path params, and query strings are first-class.

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

Details: [docs/api.md — Navigation](docs/api.md#9-navigation)

### Forms

`createForm` builds validated fields on top of signals. Each field has `error()`, `touched()`, `blur()`, and works with `bind-value` out of the box.

**Why not a separate form library?** Field state is already reactive. The compiler binds inputs directly to signals — validation errors show via `#if field.error()` with no extra bridge layer.

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

`connectJacareDevtools()` opens the **Pulse Graph** — a live view of which signals depend on which, and their current values. Zero cost when not connected.

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

connectJacareDevtools()
```

Useful when debugging why an effect re-ran or tracing data flow in a complex screen.

## Development

Requires Node.js 20+. Clone the monorepo to hack on Jacaré itself:

```bash
yarn install
yarn build
yarn test
yarn typecheck
yarn example:dev      # todo demo — http://localhost:3000
yarn showcase:dev     # showcase — http://localhost:3001
```

Scaffold from the monorepo:

```bash
yarn jacare new demo
cd demo && yarn install && yarn dev
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

See [Quick start](#quick-start) to scaffold a new app.

Add Jacaré to an existing Vite project:

```bash
npm install @jacare/core
npm install -D @jacare/cli @jacare/vite-plugin vite
```

```bash
jacare new my-app --template=todo
```

## Live demos

| Demo | URL | What to explore |
|------|-----|-----------------|
| **Todo app** | [jacarejs.github.io/core](https://jacarejs.github.io/core/) | Tasks, forms, keyed lists, tutorial routes |
| **Showcase** | [jacarejs.github.io/core/showcase](https://jacarejs.github.io/core/showcase/) | Reactivity, components, slots, scoped CSS, cart |

Run locally:

```bash
yarn showcase:dev   # http://localhost:3001
yarn example:dev    # jacare-todo dev server
```

---

<p align="center">🇧🇷 ilove brazil</p>
