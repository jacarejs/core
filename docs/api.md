# Jacaré API Reference

Complete API guide for building applications with Jacaré. Each section explains **what** the API does, **when** to use it, and includes a **minimal working example**.

For syntax details see [syntax.md](syntax.md). For architecture rationale see [phases/](phases/).

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Module format (.jcr)](#2-module-format-jcr)
3. [Reactivity](#3-reactivity)
4. [Templates](#4-templates)
5. [DOM bindings](#5-dom-bindings)
6. [Control flow](#6-control-flow)
7. [Components and slots](#7-components-and-slots)
8. [Scoped CSS](#8-scoped-css)
9. [Navigation](#9-navigation)
10. [Forms](#10-forms)
11. [Lifecycle and scope](#11-lifecycle-and-scope)
12. [SSR and hydration](#12-ssr-and-hydration)
13. [DevTools](#13-devtools)
14. [Compiler API](#14-compiler-api)
15. [CLI](#15-cli)
16. [Vite plugin](#16-vite-plugin)

---

## 1. Quick start

### Step 1 — Scaffold a project

```bash
npm create jacare@latest my-app
cd my-app && npm install && npm run dev
```

Or from the monorepo:

```bash
yarn jacare new demo
cd demo && yarn dev
```

### Step 2 — Create `src/app.jcr`

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
```

### Step 3 — Boot in `src/boot.js`

```javascript
import mount from './app.jcr'

const root = document.getElementById('app')
const dispose = mount(root)

if (import.meta.hot) {
  import.meta.hot.dispose(() => dispose?.())
}
```

### Step 4 — HTML shell (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/boot.js"></script>
  </body>
</html>
```

The Vite plugin compiles `.jcr` files on import. No virtual DOM — only the nodes bound to signals re-run when data changes.

---

## 2. Module format (.jcr)

A `.jcr` file is a **JavaScript module** with optional script logic and one or more exported blocks.

### Recommended layout

```javascript
// 1. Imports
import { signal, computed } from '@jacare/core'
import Card from './Card.jcr'

// 2. State and logic
const title = signal('Hello')
const subtitle = computed(() => `Updated: ${title()}`)

function onSave() {
  title.set('Saved')
}

// 3. View (required)
export <view>
  <Card :title=${title} :subtitle=${subtitle}>
    <button on-click=${onSave}>Save</button>
  </Card>
</view>

// 4. Scoped styles (optional, last)
export <style>
.card { padding: 1rem; }
</style>
```

### Supported view syntax

| Form | Example |
|------|---------|
| **Block (recommended)** | `export <view>...</view>` |
| Block with default | `export default <view>...</view>` |
| Tagged template | `export default view\`...\`` |
| Return block | `return <view>...</view>` (factory modules) |

### Supported style syntax

| Form | Example |
|------|---------|
| **Block (recommended)** | `export <style>...</style>` |
| With preprocessor lang | `export <style lang="scss">...</style>` |
| Tagged template | `style\`...\`` after the view |

`lang` is parsed and exposed as `styleLang` in compile output. SCSS/Less are passed through as CSS until a preprocessor is wired in.

### Compiled output

Every `.jcr` file compiles to three exports:

| Export | Purpose |
|--------|---------|
| `mount(target, props?)` | Client render; returns dispose function |
| `render(props?)` | Server HTML + binding state |
| `resume(target, state, props?)` | Hydrate client from SSR state |
| `default` | Alias for `mount` |

---

## 3. Reactivity

Jacaré uses **fine-grained reactivity**: signals track dependencies at read time; effects re-run only when tracked signals change. No virtual DOM diff.

### Canonical API

| API | Alias | Role |
|-----|-------|------|
| `signal(initial)` | `pulse` | Mutable reactive cell |
| `computed(fn)` | `derive` | Derived read-only value |
| `effect(fn)` | `watch` | Side effect on dependency change |
| `untrack(fn)` | `runUntracked` | Run without tracking |

### Step 1 — Create a signal

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

count()           // read → 0
count.set(5)      // write
count.update(n => n + 1)
count.peek        // read without subscribing (non-reactive)
```

### Step 2 — Derive values

```javascript
import { signal, computed } from '@jacare/core'

const price = signal(10)
const qty = signal(2)

const total = computed(() => price() * qty())

total() // 20 — recomputes when price or qty changes
```

### Step 3 — Side effects

```javascript
import { signal, effect } from '@jacare/core'

const name = signal('')

const dispose = effect(() => {
  document.title = `Hello, ${name()}`
})

// later: dispose() to stop
```

### Step 4 — Batch updates

```javascript
import { signal, batch } from '@jacare/core'

const a = signal(0)
const b = signal(0)

batch(() => {
  a.set(1)
  b.set(2)
}) // effects run once after both writes
```

### Step 5 — Untrack reads

```javascript
import { effect, untrack } from '@jacare/core'

effect(() => {
  const tracked = someSignal()
  const ignored = untrack(() => otherSignal()) // not a dependency
})
```

---

## 4. Templates

Templates are compile-time. The compiler emits static `createElement` calls and binding hooks.

### Text interpolation

```javascript
export <view>
  <p>${greeting}</p>
</view>
```

- If `greeting` is a **signal** → `bindText(node, greeting)`
- If `greeting` is a **component prop** → `bindPropText(node, greeting)` (handles signals and plain strings)
- Mixed template → `effect(() => { node.data = \`Hello ${name()}\` })`

### Events

```javascript
export <view>
  <button on-click=${save}>Save</button>
  <button @click=${cancel}>Cancel</button>
</view>
```

`on-click` and `@click` are equivalent. Handlers are registered with cleanup on unmount.

### Static vs reactive attributes

```javascript
export <view>
  <a bind-href=${url}>Link</a>
  <img :src=${avatar} alt="Avatar" />
  <input type="text" placeholder="Name" />
</view>
```

`bind-href` / `:href` on a signal → `bindAttribute`. Static `title="Hello"` on components → string prop.

---

## 5. DOM bindings

Runtime helpers imported only when the compiler needs them.

| Helper | Use |
|--------|-----|
| `bindText(node, signal)` | Reactive text from signal |
| `bindPropText(node, prop)` | Component prop (signal or string) |
| `bindAttribute(el, name, signal)` | Reactive attribute |
| `bindModel(el, name, signal)` | Two-way `value` / `checked` |
| `bindClass(el, className, signal)` | Toggle class |
| `branch(anchor, fn)` | `#if` / `#elif` / `#else` |
| `reconcileKeyedList(anchor, source, key, render)` | `#for` keyed lists |
| `mountSlot(anchor, children, name?)` | Slot projection |
| `ensureScopedStyle(scopeId, css)` | Inject scoped stylesheet |

### Two-way binding

```javascript
import { signal } from '@jacare/core'

const text = signal('')

export <view>
  <input bind-value=${text} />
  <input type="checkbox" bind-checked=${enabled} />
</view>
```

`bind-value` and `bind-checked` on signals compile to `bindModel` — no manual `on-input` needed.

### Class binding

```javascript
export <view>
  <li class-done=${item.done} class-active=${selected}>${item.label}</li>
</view>
```

---

## 6. Control flow

### Conditionals

```javascript
export <view>
#if loading()
  <p>Loading…</p>
#elif error()
  <p>${error()}</p>
#else
  <Content />
#end
</view>
```

Aliases: `@if`, `@elseif`, `@else`, `@end`.

### Keyed lists

```javascript
export <view>
<ul>
  #for items() as item (item.id)
    <li>${item.label}</li>
  #end
</ul>
</view>
```

The key expression `(item.id)` drives incremental reconciliation — rows are created, moved, or removed by key, not by index.

Optional index:

```javascript
#for items() as item, index (item.id)
```

---

## 7. Components and slots

Components are `.jcr` modules used as PascalCase tags.

### Step 1 — Child component (`Badge.jcr`)

```javascript
export <view>
<span class="badge">${text}</span>
</view>

export <style>
.badge {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-weight: 700;
}
</style>
```

`text` is inferred as a mount prop from `${text}` in the template.

### Step 2 — Parent usage

```javascript
import Badge from './Badge.jcr'
import { signal } from '@jacare/core'

const mood = signal('focused')

export <view>
  <Badge :text=${mood} />
</view>
```

### Step 3 — Slots

Child (`Card.jcr`):

```javascript
export <view>
<div class="card">
  <h3>${title}</h3>
  <slot />
</div>
</view>
```

Parent:

```javascript
export <view>
<Card :title=${'Hello'}>
  <p>Projected content</p>
</Card>
</view>
```

Children compile to a slot render function passed as `children` prop.

### Prop rules

- `:propName=${expr}` — reactive prop
- `title="Hello"` — static string prop
- Identifiers in template not declared in script → mount props
- Imports and `signal`/`computed` declarations are never props

---

## 8. Scoped CSS

Styles in `export <style>` are scoped with `data-jacare-s` on the mount root.

```javascript
export <view>
<div class="card">
  <p class="title">${title}</p>
</div>
</view>

export <style>
.card { padding: 1rem; border: 1px solid #ccc; }
.title { font-weight: bold; }
</style>
```

Compiles to:

```css
[data-jacare-s="abc123"] .card { ... }
[data-jacare-s="abc123"] .title { ... }
```

Opt out for shared selectors:

```css
:global(.shared) { color: red; }
```

Preprocessor attribute (parsed, not yet compiled):

```javascript
export <style lang="scss">
$color: #003030;
.title { color: $color; }
</style>
```

---

## 9. Navigation

`createNav` provides layout + screen routing without a virtual DOM router.

### Step 1 — Shell (`shell.jcr`)

```javascript
export <view>
  <header>
    <a jacare-go="/" href="/">Home</a>
    <a jacare-go="/about" href="/about">About</a>
  </header>
  <main jacare-frame></main>
</view>
```

### Step 2 — Screen map (`nav.js`)

```javascript
import { createNav, lazy } from '@jacare/core'
import Shell from './shell.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': () => import('./pages/home.jcr'),
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  missing: lazy(() => import('./pages/not-found.jcr')),
})
```

### Step 3 — Boot

```javascript
import { nav } from './nav.js'

nav.attach(document.getElementById('app'))
```

### Nav API

| Method / property | Description |
|-------------------|-------------|
| `attach(target)` | Mount layout; navigate to current URL |
| `go(path)` | Push navigation |
| `swap(path)` | Replace history entry |
| `undo()` | `history.back()` |
| `warm(path)` | Preload lazy screen |
| `where` | `Signal<NavPlace>` — current route |
| `beforeGo(to, from)` | Guard; return `false` or redirect path |

### Route params and search

```javascript
import { createRoute, routeParam, routeSearch, routeHref } from '@jacare/core'

export const lifecycle = createRoute({
  path: '/tutorial/:topic',
  screen: lazy(() => import('./tutorial.jcr')),
})

// inside screen:
const topic = routeParam('topic')
const tab = routeSearch('tab')
const href = routeHref('/about', { tab: 'feedback' })
```

---

## 10. Forms

`createForm` builds validated fields with `bind-value` integration.

### Step 1 — Define fields

```javascript
import { createForm } from '@jacare/core'

const form = createForm({
  name: {
    value: '',
    validate: (v) => (v.trim().length < 2 ? 'Too short' : null),
  },
  email: {
    value: '',
    validate: (v) => (!v.includes('@') ? 'Invalid email' : null),
  },
})
```

### Step 2 — Submit handler

```javascript
const onSubmit = form.handleSubmit((values) => {
  console.log(values) // { name, email }
})
```

### Step 3 — Template with `Field` component

```javascript
import Field from './components/Field.jcr'

export <view>
<form on-submit=${onSubmit}>
  <Field :label="'Name'" :field=${form.fields.name} :type="'text'" />
  <Field :label="'Email'" :field=${form.fields.email} :type="'email'" />
  <button type="submit">Send</button>
</form>
</view>
```

### Field API (`form.fields.*`)

| Member | Type | Description |
|--------|------|-------------|
| `()` / `set()` / `update()` | Signal | Field value |
| `error()` | `ReadonlySignal<string \| undefined>` | Validation message |
| `touched()` | `ReadonlySignal<boolean>` | User interacted |
| `dirty()` | `ReadonlySignal<boolean>` | Value changed from initial |
| `blur()` | `() => void` | Mark touched, validate |
| `validate()` | `() => boolean` | Run validators now |

### Form API

| Member | Description |
|--------|-------------|
| `fields` | Per-field objects |
| `values()` | Computed snapshot of all values |
| `valid()` | All fields pass validation |
| `dirty()` | Any field dirty |
| `validate()` | Validate all fields |
| `reset()` | Reset to initial values |
| `handleSubmit(onValid)` | Event handler for `<form on-submit>` |

---

## 11. Lifecycle and scope

### Screen lifecycle

```javascript
import { createLifecycle } from '@jacare/core'

export const lifecycle = createLifecycle({
  onMount(ctx) {
    return () => { /* cleanup */ }
  },
  onActivate(ctx) { },
  onDeactivate() { },
  onUnmount() { },
})
```

Export `lifecycle` from a screen module; nav calls hooks on route changes.

### Scope debugging

```javascript
import { registerScope } from '@jacare/core'

registerScope('cart.total', 'Cart total', () => total())
```

Visible in DevTools Scope panel when `connectJacareDevtools()` is active.

---

## 12. SSR and hydration

### Server render

```javascript
import { render } from './app.jcr'

const { html, state } = render()
```

### Client hydration

```javascript
import { resume } from './app.jcr'

resume(document.getElementById('app'), state)
```

### Streaming helpers

```javascript
import { renderToString, renderToStream } from '@jacare/core'
import { render } from './app.jcr'

const html = renderToString(render)

for await (const chunk of renderToStream(render)) {
  res.write(chunk)
}
```

`resumeBindings(target, state)` re-attaches signal bindings without recreating DOM.

---

## 13. DevTools

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

connectJacareDevtools()
```

Panels:

- **Pulse Graph** — signal dependency graph, live values
- **Scope** — registered scope entries

Zero runtime cost when DevTools are not connected.

---

## 14. Compiler API

Package: `@jacare/compiler`

```typescript
import { compile, parseModule, parseTemplate } from '@jacare/compiler'

const result = compile(source, {
  filename: 'Card.jcr',
  mode: 'client',       // 'client' | 'server' | 'full'
  runtimeImport: '@jacare/core',
})

result.code          // generated JavaScript
result.template      // flattened HTML
result.scopedStyle   // scoped CSS string
result.styleLang     // e.g. 'scss' | null
result.map           // source map
```

### Pipeline

```
.jcr source
  → parseModule()     script + view HTML + style CSS
  → parseTemplate()   TemplateAST
  → generate()        mount / render / resume
  → scopeCss()        [data-jacare-s] selectors
```

### Standalone compile

```bash
npx jacare-compile src/app.jcr dist/app.js
jacare compile src/app.jcr --watch
jacare check
```

---

## 15. CLI

Package: `@jacare/cli`

| Command | Description |
|---------|-------------|
| `jacare new <name> [--template=…]` | Scaffold project |
| `jacare dev [--port=N] [--open=false]` | Dev server |
| `jacare build` | Production build → `dist/` |
| `jacare compile <file> [out] [--watch]` | Compile one file |
| `jacare check` | Compile-check all `.jcr` in CWD |

### `jacare.config.js`

```javascript
export default {
  title: 'My App',
  port: 3000,
  base: '/',
}
```

---

## 16. Vite plugin

Package: `@jacare/vite-plugin`

```javascript
// vite.config.js
import { createJacareViteConfig } from '@jacare/vite-plugin'
import jacareConfig from './jacare.config.js'

export default createJacareViteConfig(jacareConfig)
```

### Options

```javascript
import { jacare } from '@jacare/vite-plugin'

export default {
  plugins: [
    jacare({
      emit: 'auto',           // 'auto' | 'client' | 'server' | 'full'
      inspect: true,            // write compiled output to .jacare/compiled/
      runtimeImport: '@jacare/core',
    }),
  ],
}
```

### TypeScript

```typescript
// jacare.d.ts
declare module '*.jcr' {
  import type { Cleanup } from '@jacare/core'
  export function mount(target: ParentNode, props?: Record<string, unknown>): Cleanup
  export function render(props?: Record<string, unknown>): { html: string; state: unknown }
  export function resume(target: ParentNode, state: unknown, props?: Record<string, unknown>): Cleanup
  const _default: typeof mount
  export default _default
}
```

---

## Examples in this repository

| Example | Path | Highlights |
|---------|------|------------|
| **Todo** | `examples/jacare-todo` | Nav, forms, tutorial, lifecycle, playground |
| **Showcase** | `examples/jacare-showcase` | Components, slots, scoped CSS, cart computed |

```bash
yarn example:dev    # todo app
yarn showcase:dev   # showcase
```

Live demos: [jacarejs.github.io/core](https://jacarejs.github.io/core/) · [jacarejs.github.io/showcase](https://jacarejs.github.io/showcase/)
