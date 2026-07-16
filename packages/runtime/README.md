# @jacare/core

[![npm](https://img.shields.io/npm/v/@jacare/core.svg?color=189030)](https://www.npmjs.com/package/@jacare/core)
[![downloads](https://img.shields.io/npm/dm/@jacare/core.svg)](https://www.npmjs.com/package/@jacare/core)
[![license](https://img.shields.io/npm/l/@jacare/core.svg)](https://github.com/jacarejs/core/blob/main/LICENSE)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![node](https://img.shields.io/badge/node-%3E%3D20-189030.svg)](https://nodejs.org)
[![demo](https://img.shields.io/badge/demo-Lab-78c018.svg)](https://jacarejs.github.io/core/lab/)

The runtime for [Jacaré](https://github.com/jacarejs/core) — a fine-grained reactive UI framework with **no Virtual DOM**.

Jacaré compiles `.jcr` modules into direct DOM updates. When a value changes, only the nodes that depend on it update. This package provides the reactivity engine, DOM bindings, navigation, forms, SSR helpers, and lifecycle hooks.

---

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Core concepts](#core-concepts)
- [Reactivity API](#reactivity-api)
- [Template bindings](#template-bindings)
- [Components](#components)
- [Navigation](#navigation)
- [Forms](#forms)
- [Lifecycle hooks](#lifecycle-hooks)
- [Scope debugging](#scope-debugging)
- [Server-side rendering](#server-side-rendering)
- [API reference](#api-reference)
- [Links](#links)

---

## Install

```bash
npm install @jacare/core
```

For a full app with CLI, compiler, and Vite plugin:

```bash
npm install -g @jacare/cli
npm install @jacare/core
npm install -D @jacare/vite-plugin
```

npm: [https://www.npmjs.com/package/@jacare/core](https://www.npmjs.com/package/@jacare/core)

---

## Quick start

Create a `.jcr` file — a plain JavaScript module with a `view` tagged template:

```javascript
import { pulse, derive, view } from '@jacare/core'

const count = pulse(0)
const label = derive(() => `Count: ${count()}`)

export default view`
  <section class="counter">
    <p>${label}</p>
    <button on-click=${() => count.update((n) => n + 1)}>
      Increment
    </button>
  </section>
`
```

Mount it from `boot.js`:

```javascript
import App from './app.jcr'

const root = document.getElementById('app')
const dispose = App(root)

// later: dispose() to clean up
```

Each `.jcr` module compiles to three functions:

| Function | Purpose |
|----------|---------|
| `mount(target, props?)` | Client-side DOM mount |
| `render(props?)` | SSR HTML string |
| `resume(target, state, props?)` | Hydrate SSR output |

---

## Core concepts

### Pulses (signals)

State is stored in **pulses**. Reading a pulse inside a template or effect subscribes to it. Writing triggers only the dependents.

```javascript
const count = pulse(0)

count()              // read → 0
count.set(5)         // write
count.update(n => n + 1)  // functional update
```

### Derived values

Computed values re-run only when their dependencies change:

```javascript
const first = pulse(2)
const second = pulse(3)
const total = derive(() => first() + second())
```

### Effects

Run side effects when tracked pulses change:

```javascript
import { watch } from '@jacare/core'

watch(() => {
  console.log('count is', count())
})
```

### No Virtual DOM

Jacaré does not diff a virtual tree. The compiler emits precise DOM operations — text updates, attribute bindings, keyed list reconciliation — wired directly to the pulse graph.

---

## Reactivity API

### Canonical names

| API | Alias | Description |
|-----|-------|-------------|
| `signal(initial)` | `pulse(initial)` | Reactive value |
| `computed(fn)` | `derive(fn)` | Derived value |
| `effect(fn)` | `watch(fn)` | Side effect |
| `untrack(fn)` | — | Run without tracking |
| `batch(fn)` | — | Batch multiple writes |
| `runUntracked(fn)` | — | Untracked execution (used by DOM bindings) |

### Untracked reads

| API | Use when |
|-----|----------|
| `signal.peek` / `computed.peek` | Read current value without subscribing |
| `untrack(fn)` | Temporarily disable tracking inside an effect |
| `runUntracked(fn)` | Same as untrack — used internally by `bindText`, `bindModel`, etc. |

### Pulse graph internals

Each `signal` and `computed` owns a `DependencyCell`:

- Subscribers stored in an array for fast `notify()`
- A `Set` provides O(1) duplicate checks during dependency tracking
- Unsubscribe uses swap-remove — O(1) amortized

Effects and computeds use an `OwnerNode` tree. Disposing an owner clears dependencies and runs cleanups automatically.

```javascript
import { pulse, derive, view } from '@jacare/core'

const items = pulse([
  { id: '1', label: 'Learn Jacaré', done: false },
])

const filter = pulse('')
const filtered = derive(() => {
  const q = filter().trim().toLowerCase()
  if (!q) return items()
  return items().filter((item) => item.label.toLowerCase().includes(q))
})

function addItem(label) {
  items.update((list) => [
    ...list,
    { id: String(Date.now()), label, done: false },
  ])
}
```

---

## Template bindings

Use these inside `view\`...\``:

### Text

```javascript
view`<p>${greeting}</p>`
```

Reactive pulses are read automatically. For mixed text:

```javascript
view`<p>Total: ${total()}</p>`
```

### Events

```javascript
view`<button on-click=${save}>Save</button>`
view`<input on-input=${(e) => filter.set(e.target.value)} />`
```

Alias: `@click=${fn}`

### Attributes

```javascript
view`<a bind-href=${url}>Link</a>`
```

Alias: `:href=${url}`

### Two-way form bindings

```javascript
view`
  <input bind-value=${text} />
  <input type="checkbox" bind-checked=${done} />
`
```

`bind-value` and `bind-checked` compile to `bindModel` — DOM and signal stay in sync.

### Conditional classes

```javascript
view`<li class-done=${() => item.done}>...</li>`
```

Alias: `class:done=${() => item.done}`

### Conditionals

```javascript
view`
  #if show()
    <p>Visible</p>
  #elif loading()
    <p>Loading…</p>
  #else
    <p>Hidden</p>
  #end
`
```

Alias: `@if` / `@elseif` / `@else` / `@end`

Multiple siblings inside a branch mount in **source order** (`branch` / `showIf` use an insertion cursor after the comment anchor).

### Lists

```javascript
view`
  #for items() as item (item.id)
    <li>${item.label}</li>
  #end
`
```

- `item.id` is the **key** for efficient DOM reconciliation
- Alias: `@each items() as item (item.id)` / `@end`

---

## Components

Import another `.jcr` module and use it as a self-closing tag:

```javascript
import Field from './Field.jcr'

export default view`
  <Field :label=${'Email'} :field=${form.fields.email} :type=${'email'} />
`
```

Props are passed with `:propName=${value}`. Inside the child component, props appear as variables in scope.

---

## Navigation

Client-side routing with lazy-loaded screens:

```javascript
import { createNav, lazy, screen } from '@jacare/core'
import Shell from './shell.jcr'
import Home from './pages/home.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: '/',
  layout: Shell,
  screens: {
    '/': screen(Home),
    '/about': lazy(() => import('./pages/about.jcr')),
    '/users/:id': lazy(() => import('./pages/user.jcr')),
  },
  missing: NotFound,
})

// in boot.js
nav.attach(document.getElementById('app'))
```

### Layout shell

```javascript
export default view`
  <header>...</header>
  <main jacare-frame></main>
  <footer>...</footer>
`
```

Active screen content mounts inside `jacare-frame`.

### Declarative links

```html
<a jacare-go="/about" href="/about">About</a>
```

Jacaré intercepts clicks and syncs the `jacare-here` class on the active link.

### Programmatic navigation

```javascript
await nav.go('/about')
await nav.swap('/settings')  // replace history entry
nav.undo()                   // history.back()
await nav.warm('/about')     // prefetch lazy screen
```

`nav.where` is a `Signal<NavPlace>`:

```javascript
nav.where()       // reactive — re-runs dependents on navigation
nav.where.peek    // untracked — current place without subscribing
```

### Route helpers

```javascript
import { routeParam, routeSearch, routeHref } from '@jacare/core'

const userId = routeParam('id')
const tab = routeSearch('tab')
const link = routeHref('/about', { tab: 'feedback' })
```

---

## Forms

```javascript
import { createForm } from '@jacare/core'

const form = createForm({
  email: {
    value: '',
    validate: (value) => (value.includes('@') ? 'Invalid email' : null),
  },
  message: {
    value: '',
    validate: (value) => (!value.trim() ? 'Required' : null),
  },
})

export <view>
  <input bind-value=${form.fields.email} on-blur=${() => form.fields.email.blur()} />
  #if form.fields.email.error()
    <span>${form.fields.email.error()}</span>
  #end
</view>
```

Each `form.fields.*` is a field signal with `error()`, `touched()`, `dirty()`, and `blur()`.

---

## Lifecycle hooks

Per-screen lifecycle for mount, activate, deactivate, and unmount:

```javascript
import { createLifecycle } from '@jacare/core'

export const lifecycle = createLifecycle({
  onMount() {
    console.log('screen mounted')
  },
  onActivate(ctx) {
    console.log('screen visible', ctx.path)
    return () => {}
  },
  onDeactivate() {
    console.log('screen hidden')
  },
  onUnmount() {
    console.log('screen destroyed')
  },
})
```

Export `lifecycle` from lazy-loaded `.jcr` screens. Nav wraps it automatically via `screen()`.

---

## Scope debugging

Register values for live inspection (used by `@jacare/devtools`):

```javascript
import { registerScope, pulse } from '@jacare/core'

const draft = pulse('')

registerScope('draft', () => draft())
```

---

## Server-side rendering

```javascript
import { renderToString, renderToStream } from '@jacare/core'
import { render, resume } from './app.jcr'

// server
const html = renderToString(() => render())

// client hydration
const dispose = resume(root, state)
```

SSR output includes `data-jacare-bind` markers for precise hydration targets.

---

## API reference

### Reactivity
`signal`, `pulse`, `computed`, `derive`, `effect`, `watch`, `untrack`, `batch`, `runUntracked`, `isTracking`

### DOM
`view`, `bindText`, `bindPropText`, `bindAttribute`, `bindProperty`, `bindClass`, `bindModel`, `branch`, `reconcileKeyedList`, `showIf`, `ensureScopedStyle`, `mountSlot`

### Nav
`createNav`, `lazy`, `screen`, `adaptScreen`, `createRoute`, `routeHref`, `routeParam`, `routeSearch`, `screenProps`

### Forms
`createForm`

### Lifecycle
`createLifecycle`

### Scope
`registerScope`, `clearScope`, `getScopeSnapshot`, `subscribeScope`, `startScopePulse`

### SSR
`renderToString`, `renderToStream`, `resumeBindings`, `escapeHtml`

### DevTools hooks
`enableDevtools`, `getPulseGraph`, `subscribePulseGraph`

---

## Links

- [npm — @jacare/core](https://www.npmjs.com/package/@jacare/core)
- [Repository](https://github.com/jacarejs/core)
- [API reference](https://github.com/jacarejs/core/blob/main/docs/api.md)
- [Syntax guide](https://github.com/jacarejs/core/blob/main/docs/syntax.md)
- [Live demo](https://jacarejs.github.io/core/todo/)
- [Jacaré Lab](https://jacarejs.github.io/core/lab/) — full API tutorial
- [Example app](https://github.com/jacarejs/core/tree/main/examples/jacare-todo)
- Related: [@jacare/compiler](https://www.npmjs.com/package/@jacare/compiler) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin) · [@jacare/cli](https://www.npmjs.com/package/@jacare/cli) · [@jacare/devtools](https://www.npmjs.com/package/@jacare/devtools) · [@jacare/meta](https://www.npmjs.com/package/@jacare/meta)

## License

MIT
