# Jacaré

<p align="center">
  <img src="packages/cli/assets/jacare-logo.png" width="140" alt="Jacaré logo" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@jacare/core"><img src="https://img.shields.io/npm/v/@jacare/core.svg?label=%40jacare%2Fcore&color=189030" alt="npm @jacare/core" /></a>
  <a href="https://www.npmjs.com/package/@jacare/compiler"><img src="https://img.shields.io/npm/v/@jacare/compiler.svg?label=%40jacare%2Fcompiler&color=189030" alt="npm @jacare/compiler" /></a>
  <a href="https://www.npmjs.com/package/@jacare/cli"><img src="https://img.shields.io/npm/v/@jacare/cli.svg?label=%40jacare%2Fcli&color=189030" alt="npm @jacare/cli" /></a>
  <a href="https://www.npmjs.com/package/@jacare/vite-plugin"><img src="https://img.shields.io/npm/v/@jacare/vite-plugin.svg?label=%40jacare%2Fvite-plugin&color=189030" alt="npm @jacare/vite-plugin" /></a>
  <a href="https://www.npmjs.com/package/@jacare/devtools"><img src="https://img.shields.io/npm/v/@jacare/devtools.svg?label=%40jacare%2Fdevtools&color=189030" alt="npm @jacare/devtools" /></a>
  <a href="https://www.npmjs.com/package/@jacare/meta"><img src="https://img.shields.io/npm/v/@jacare/meta.svg?label=%40jacare%2Fmeta&color=189030" alt="npm @jacare/meta" /></a>
  <a href="https://www.npmjs.com/package/create-jacare"><img src="https://img.shields.io/npm/v/create-jacare.svg?label=create-jacare&color=189030" alt="npm create-jacare" /></a>
</p>

<p align="center">
  <a href="https://github.com/jacarejs/core/actions/workflows/ci.yml"><img src="https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/jacarejs/core/actions/workflows/pages.yml"><img src="https://github.com/jacarejs/core/actions/workflows/pages.yml/badge.svg" alt="Pages" /></a>
  <a href="https://github.com/jacarejs/core/blob/main/LICENSE"><img src="https://img.shields.io/github/license/jacarejs/core.svg?color=189030" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-189030.svg" alt="Node >= 20" />
  <a href="https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare"><img src="https://vsmarketplacebadges.dev/version-short/heberalmeida.jacare.svg" alt="VS Code Jacaré" /></a>
</p>

<p align="center">
  <a href="https://jacarejs.github.io/core/todo/"><img src="https://img.shields.io/badge/demo-Todo-78c018.svg" alt="Todo demo" /></a>
  <a href="https://jacarejs.github.io/core/showcase/"><img src="https://img.shields.io/badge/demo-Showcase-78c018.svg" alt="Showcase demo" /></a>
  <a href="https://jacarejs.github.io/core/bmi/"><img src="https://img.shields.io/badge/demo-Scale%20BMI-78c018.svg" alt="BMI demo" /></a>
  <a href="https://jacarejs.github.io/core/lab/"><img src="https://img.shields.io/badge/demo-Lab%20API%20tutorial-78c018.svg" alt="Lab demo" /></a>
</p>

**Jacaré** is a front-end framework for building fast, reactive web apps with plain JavaScript — no Virtual DOM, no component re-renders, no proprietary file format.

Repository: [github.com/jacarejs/core](https://github.com/jacarejs/core)

## Tutorial — Jacaré Lab

> **Start here if you want to learn the full API by doing.**  
> [Jacaré Lab](https://jacarejs.github.io/core/lab/) is the interactive tutorial: every API topic from [`docs/api.md`](docs/api.md) has a live demo and a **View code** modal.

| | |
|---|---|
| **Live** | [jacarejs.github.io/core/lab](https://jacarejs.github.io/core/lab/) |
| **Local** | `yarn lab:dev` → [http://localhost:3003](http://localhost:3003) |
| **Source** | [`examples/jacare-lab`](examples/jacare-lab) |
| **Covers** | Reactivity, templates, bindings, events, `#if` / `#for`, components & contracts, CSS, nav, forms, lifecycle, cookbook, SSR, tooling |

[![Lab tutorial](https://img.shields.io/badge/Jacaré%20Lab-interactive%20API%20tutorial-78c018?style=for-the-badge)](https://jacarejs.github.io/core/lab/)

## Documentation

| Topic | Link |
|-------|------|
| **Tutorial (Jacaré Lab)** | [Live](https://jacarejs.github.io/core/lab/) · [`examples/jacare-lab`](examples/jacare-lab) · `yarn lab:dev` |
| **API reference (full)** | [docs/api.md](docs/api.md) |
| Template contracts | [docs/api.md §9](docs/api.md#template-contracts-export-contract) |
| Events `on-*` / `@*` | [docs/api.md §6](docs/api.md#6-events-on---) |
| Conditionals `#if` | [docs/api.md §7](docs/api.md#7-control-flow--if) |
| Lists `#for` | [docs/api.md §8](docs/api.md#8-control-flow--for) |
| Reactivity | [docs/api.md §3](docs/api.md#3-reactivity) |
| DOM bindings | [docs/api.md §5](docs/api.md#5-dom-bindings) |
| Components & slots | [docs/api.md §9](docs/api.md#9-components-and-slots) |
| Navigation | [docs/api.md §11](docs/api.md#11-navigation) |
| Forms | [docs/api.md §12](docs/api.md#12-forms) |
| CLI | [docs/api.md §17](docs/api.md#17-cli) |
| Syntax cheatsheet | [docs/syntax.md](docs/syntax.md) |
| Testing | [docs/testing.md](docs/testing.md) |
| Contributing | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) |

## Quick start

```bash
npm create jacare@latest my-app
cd my-app && npm install && npm run dev
```

Or install the CLI globally and scaffold with `jacare new`:

```bash
npm install -g @jacare/cli
jacare new my-app
cd my-app && npm install && jacare dev
```

Open `http://localhost:5173` (create-jacare) or `http://localhost:3000` (`jacare new`) — a reactive counter is already running.

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
export <view>          bindText (dev)           updated one-by-one
export <style>         CPW inline (prod)        when signals change
                       branch, reconcileKeyedList
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

Live demos: [**Lab (tutorial)**](https://jacarejs.github.io/core/lab/) · [Todo app](https://jacarejs.github.io/core/todo/) · [Showcase](https://jacarejs.github.io/core/showcase/) · [Scale BMI](https://jacarejs.github.io/core/bmi/)

Full docs: [API](docs/api.md) · [Events](docs/api.md#6-events-on---) · [`#if`](docs/api.md#7-control-flow--if) · [`#for`](docs/api.md#8-control-flow--for) · [Cookbook](docs/api.md#13b-cookbook--if--for--events--props--lifecycle)

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
| 8 — CPW + CSS vars | ✓ |
| Template contracts (`export <contract>`) | ✓ — props / pulses / slots / emits + `jacare check` |
| Typed model props (`model` + `bind-*`) | ✓ — defaults, required, Vite + CLI validation |
| Jacaré Lab (API tutorial) | ✓ — `examples/jacare-lab` · [live](https://jacarejs.github.io/core/lab/) |

## Packages

Published under the [`@jacare`](https://www.npmjs.com/search?q=scope:jacare) scope on npm (**v0.1.6**):

| Package | Badges | Description |
|---------|--------|-------------|
| `@jacare/core` | [![npm](https://img.shields.io/npm/v/@jacare/core.svg?color=189030)](https://www.npmjs.com/package/@jacare/core) [![dm](https://img.shields.io/npm/dm/@jacare/core.svg)](https://www.npmjs.com/package/@jacare/core) | Pulse graph, DOM bindings, SSR |
| `@jacare/compiler` | [![npm](https://img.shields.io/npm/v/@jacare/compiler.svg?color=189030)](https://www.npmjs.com/package/@jacare/compiler) [![dm](https://img.shields.io/npm/dm/@jacare/compiler.svg)](https://www.npmjs.com/package/@jacare/compiler) | Compiles `export <view>` / `<style>` / `<contract>` |
| `@jacare/vite-plugin` | [![npm](https://img.shields.io/npm/v/@jacare/vite-plugin.svg?color=189030)](https://www.npmjs.com/package/@jacare/vite-plugin) [![dm](https://img.shields.io/npm/dm/@jacare/vite-plugin.svg)](https://www.npmjs.com/package/@jacare/vite-plugin) | Vite integration + contract checks |
| `@jacare/cli` | [![npm](https://img.shields.io/npm/v/@jacare/cli.svg?color=189030)](https://www.npmjs.com/package/@jacare/cli) [![dm](https://img.shields.io/npm/dm/@jacare/cli.svg)](https://www.npmjs.com/package/@jacare/cli) | `jacare` — create, dev, build, check |
| `@jacare/devtools` | [![npm](https://img.shields.io/npm/v/@jacare/devtools.svg?color=189030)](https://www.npmjs.com/package/@jacare/devtools) [![dm](https://img.shields.io/npm/dm/@jacare/devtools.svg)](https://www.npmjs.com/package/@jacare/devtools) | Pulse Graph inspector panel |
| `@jacare/meta` | [![npm](https://img.shields.io/npm/v/@jacare/meta.svg?color=189030)](https://www.npmjs.com/package/@jacare/meta) [![dm](https://img.shields.io/npm/dm/@jacare/meta.svg)](https://www.npmjs.com/package/@jacare/meta) | File-based routing conventions |
| `create-jacare` | [![npm](https://img.shields.io/npm/v/create-jacare.svg?color=189030)](https://www.npmjs.com/package/create-jacare) [![dm](https://img.shields.io/npm/dm/create-jacare.svg)](https://www.npmjs.com/package/create-jacare) | `npm create jacare` — Vite scaffolds |
| VS Code | [![marketplace](https://vsmarketplacebadges.dev/version-short/heberalmeida.jacare.svg)](https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare) | `.jcr` syntax highlighting |

Nav (`createNav`) ships inside `@jacare/core`.

## Commands

Install the CLI once (recommended):

```bash
npm install -g @jacare/cli
```

```bash
jacare new my-app     # scaffold a project
jacare dev            # start dev server
jacare build          # production build
jacare compile file   # compile one .jcr file
jacare check          # compile all .jcr files in project
jacare check --bindings  # same + list Binding IR sites per file
jacare check --strict-style  # fail on redundant ${() => …} style warnings
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

Full reference: [**API**](docs/api.md) · [Events](docs/api.md#6-events-on---) · [`#if`](docs/api.md#7-control-flow--if) · [`#for`](docs/api.md#8-control-flow--for) · [Syntax](docs/syntax.md)

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

Bindings are **compile-time**. The compiler lowers each site once into a **Binding IR** shared by client and SSR, then picks the thinnest path — runtime helpers in dev, **CPW** (inline `peek` + `subscribe`) in production builds.

| Syntax | What it does | Why use it |
|--------|--------------|------------|
| `${expr}` | Reactive text | Display live values without manual `textContent` updates |
| `on-click=${fn}` | DOM event | Declarative handlers with automatic cleanup on unmount |
| `bind-href=${url}` | Reactive attribute | Keep `href`, `src`, `disabled` in sync with state |
| `bind-value=${field}` | Two-way input | Signal ↔ input stay synced — no `on-input` boilerplate |
| `bind-checked=${on}` | Two-way checkbox | Same for checkboxes |
| `class-active=${on}` | Toggle class | Conditional styling without string concatenation |
| `style---pct=${pct}` | Reactive CSS variable | GPU-friendly animations via `var(--pct)` — no layout thrashing |
| `#if` / `#elif` / `#else` / `#end` | Show/hide branches | Compiler emits `branch()` — only active DOM exists |
| `#for … as item (key)` / `#end` | Keyed lists | Move/add/remove rows by key — no full list re-render |

### Compile-Time Pulse Wiring (CPW)

In **development**, simple signal bindings use runtime helpers (`bindText`, `bindAttribute`, `bindClass`, `bindStyleVar`) — easier to debug.

In **production** (`vite build`), the Vite plugin enables **CPW** automatically. The compiler emits direct wiring:

```javascript
let _v = count.peek
_text.data = String(_v)
_cleanups.push(count.subscribe(() => {
  const next = count.peek
  if (Object.is(next, _v)) return
  _v = next
  _text.data = String(next)
}))
```

**Benefits:** fewer imports in the bundle, no `effect` tracking on static bindings, ~2× faster micro-updates (see `yarn bench`).

Opt out: `jacare({ cpw: false })`. Force on: `compile(source, { cpw: true })`.

### Reactive CSS variables (`style---`)

Bind a signal to a CSS custom property — ideal for progress bars, transforms, and transitions:

```javascript
import { computed, signal } from '@jacare/core'

const progress = signal(35)
const pct = computed(() => progress() + '%')

export <view>
  <div class="bar" style---pct=${pct} />
</view>

export <style>
.bar { width: var(--pct); transition: width 0.2s ease; }
</style>
```

Also supported: `style:pct=${pct}` (same as `style---pct`).

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

Details: [docs/api.md — Navigation](docs/api.md#11-navigation)

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
yarn bench          # CPW vs runtime microbenchmarks
yarn typecheck
yarn example:dev      # todo demo — http://localhost:3000
yarn showcase:dev     # showcase — http://localhost:3001
yarn bmi:dev          # Scale BMI — http://localhost:3002
```

Scaffold from the monorepo:

```bash
yarn jacare new demo
cd demo && yarn install && yarn dev
```

## Architecture

- [**API reference**](docs/api.md) — full guide ([Events](docs/api.md#6-events-on---) · [`#if`](docs/api.md#7-control-flow--if) · [`#for`](docs/api.md#8-control-flow--for))
- [Syntax reference](docs/syntax.md)
- [Phase 1 — Reactivity](docs/phases/01-reactivity.md)
- [Phase 2 — Compiler](docs/phases/02-compiler.md)
- [Phase 3 — Incremental DOM](docs/phases/03-incremental-dom.md)
- [Phase 4 — SSR](docs/phases/04-ssr.md)
- [Phase 5 — Nav](docs/phases/05-nav.md)
- [Phase 6 — DevTools](docs/phases/06-devtools.md)
- [Phase 7 — Forms](docs/phases/07-forms.md)
- [Testing guide](docs/testing.md)
- [Benchmarks](benchmarks/README.md)
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
9. ~~CPW v1 — compile-time pulse wiring in production~~
10. ~~Reactive CSS variables (`style---`)~~
11. ~~Benchmarks — `pulse-update`, `pulse-fanout`, `list-toggle`, `mount-cold`, `hydrate`, `ssr-throughput`, `compile-app`, `bundle`~~

## Install

### CLI (global)

```bash
npm install -g @jacare/cli
jacare new my-app --template=todo
cd my-app && npm install && jacare dev
```

### Scaffold without a global CLI

```bash
npm create jacare@latest my-app
cd my-app && npm install && npm run dev
```

### Add Jacaré to an existing Vite project

```bash
npm install @jacare/core
npm install -D @jacare/cli @jacare/vite-plugin vite
```

See also: [@jacare/core](https://www.npmjs.com/package/@jacare/core) · [@jacare/compiler](https://www.npmjs.com/package/@jacare/compiler) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin) · [@jacare/cli](https://www.npmjs.com/package/@jacare/cli) · [@jacare/devtools](https://www.npmjs.com/package/@jacare/devtools) · [@jacare/meta](https://www.npmjs.com/package/@jacare/meta)

## Live demos

| Demo | Badges | URL | What to explore |
|------|--------|-----|-----------------|
| **Lab (tutorial)** | [![demo](https://img.shields.io/badge/tutorial-featured-78c018.svg)](https://jacarejs.github.io/core/lab/) | [jacarejs.github.io/core/lab](https://jacarejs.github.io/core/lab/) | **Featured** — full API walkthrough with View code modals |
| **Todo app** | [![demo](https://img.shields.io/badge/demo-live-78c018.svg)](https://jacarejs.github.io/core/todo/) | [jacarejs.github.io/core/todo](https://jacarejs.github.io/core/todo/) | Tasks, forms, keyed lists, tutorial routes |
| **Showcase** | [![demo](https://img.shields.io/badge/demo-live-78c018.svg)](https://jacarejs.github.io/core/showcase/) | [jacarejs.github.io/core/showcase](https://jacarejs.github.io/core/showcase/) | CPW, `style---`, components, slots, cart |
| **Scale BMI** | [![demo](https://img.shields.io/badge/demo-live-78c018.svg)](https://jacarejs.github.io/core/bmi/) | [jacarejs.github.io/core/bmi](https://jacarejs.github.io/core/bmi/) | Live BMI gauge, metric/imperial, reactive CSS |

Run locally:

```bash
yarn lab:dev        # Jacaré Lab (tutorial) — http://localhost:3003
yarn showcase:dev   # http://localhost:3001
yarn example:dev    # jacare-todo — http://localhost:3000
yarn bmi:dev        # Scale BMI — http://localhost:3002
```

---

<p align="center">Made in Brazil 🇧🇷</p>
