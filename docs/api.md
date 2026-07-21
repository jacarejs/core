# Jacaré API Reference

<p align="center">
  <img src="../packages/cli/assets/jacare-logo.png" width="120" alt="Jacaré logo" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@jacare/core"><img src="https://img.shields.io/npm/v/@jacare/core.svg?label=%40jacare%2Fcore&color=189030" alt="npm" /></a>
  <a href="https://github.com/jacarejs/core/actions/workflows/ci.yml"><img src="https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://jacarejs.github.io/core/lab/"><img src="https://img.shields.io/badge/demo-Lab-78c018.svg" alt="Lab" /></a>
  <a href="https://github.com/jacarejs/core/blob/main/LICENSE"><img src="https://img.shields.io/github/license/jacarejs/core.svg?color=189030" alt="MIT" /></a>
</p>

Complete API guide for building applications with Jacaré. Each section explains **what** the API does, **when** to use it, and includes a **minimal working example**.

For syntax details see [syntax.md](syntax.md). For architecture rationale see [phases/](phases/).

---

## Tutorial — Jacaré Lab

> **Featured interactive tutorial.** Prefer learning by running demos? Open **[Jacaré Lab](https://jacarejs.github.io/core/lab/)** — one lesson per API topic, each with a live example and a **View code** modal.

| | |
|---|---|
| **Live** | [https://jacarejs.github.io/core/lab/](https://jacarejs.github.io/core/lab/) |
| **Local** | `yarn lab:dev` → http://localhost:3003 |
| **Source** | [`examples/jacare-lab`](../examples/jacare-lab) |
| **Matches this doc** | Reactivity → tooling (§3–§19), including contracts, forms, nav, and cookbook |

[![Open Jacaré Lab](https://img.shields.io/badge/Open%20Jacaré%20Lab-interactive%20tutorial-78c018?style=for-the-badge)](https://jacarejs.github.io/core/lab/)

---

## Table of contents

1. [Tutorial — Jacaré Lab](#tutorial--jacaré-lab)
2. [Quick start](#1-quick-start)
3. [Module format (.jcr)](#2-module-format-jcr)
4. [Reactivity](#3-reactivity)
5. [Pulse bags (shared state)](#3b-pulse-bags-shared-state)
6. [Templates](#4-templates)
7. [DOM bindings](#5-dom-bindings)
8. [Events (`on-*` / `@*`)](#6-events-on---)
9. [Control flow — `#if`](#7-control-flow--if)
10. [Control flow — `#case`](#7b-control-flow--case)
11. [Dev debug — `<debug>`](#7c-dev-debug-debug)
12. [Control flow — `#for`](#8-control-flow--for)
13. [Components, props, and slots](#9-components-and-slots)
14. [Scoped CSS](#10-scoped-css)
15. [Navigation](#11-navigation)
16. [Forms](#12-forms)
17. [Lifecycle and scope](#13-lifecycle-and-scope)
18. [Cookbook (if + for + events + props + lifecycle)](#13b-cookbook--if--for--events--props--lifecycle)
19. [SSR and hydration](#14-ssr-and-hydration)
20. [DevTools](#15-devtools)
21. [Compiler API](#16-compiler-api)
22. [CLI](#17-cli)
23. [Vite plugin](#18-vite-plugin)
24. [Testing](#19-testing)
25. [Runtime helpers index](#20-runtime-helpers-index)

Jump to: [Tutorial](#tutorial--jacaré-lab) · [Pulse bags](#3b-pulse-bags-shared-state) · [Events](#6-events-on---) · [`#if`](#7-control-flow--if) · [`#case`](#7b-control-flow--case) · [`#for`](#8-control-flow--for) · [CLI](#17-cli) · [Packages on npm](#packages-on-npm)

---

## 1. Quick start

### Step 1 — Scaffold a project

```bash
npm install -g @jacare/cli
jacare new my-app
cd my-app && npm install && jacare dev
```

Or with `create-jacare`:

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

## 3b. Pulse bags (shared state)

A **pulse bag** publishes a named group of pulses on a shared mesh. Any `.jcr` that imports the bag reads and writes the **same cells** — no props drilling, no provider tree.

| API | Role |
|-----|------|
| `createBag(id, factory)` | Register a bag; factory runs on first access |
| `ripple(fn)` | Coalesce writes into one notification wave (same engine as `batch`) |
| `getBag(id)` | Look up a registered bag |
| `bag.snap()` / `bag.hydrate(data)` | Persist / restore writable pulses |
| `bag.reset()` | Drop cells; next access rebuilds the factory |

### Define a bag

```javascript
import { createBag, pulse, derive, ripple } from '@jacare/core'

export const cart = createBag('cart', () => {
  const items = pulse([])
  const count = derive(() => items().reduce((n, line) => n + line.qty, 0))
  const total = derive(() =>
    items().reduce((sum, line) => sum + line.price * line.qty, 0),
  )

  function add(product) {
    ripple(() => {
      items.update((list) => {
        const i = list.findIndex((line) => line.id === product.id)
        if (i === -1) return [...list, { ...product, qty: 1 }]
        return list.map((line, idx) =>
          idx === i ? { ...line, qty: line.qty + 1 } : line,
        )
      })
    })
  }

  function remove(id) {
    ripple(() => {
      items.update((list) => list.filter((line) => line.id !== id))
    })
  }

  return { items, count, total, add, remove }
})
```

Published cells are named `@cart/items`, `@cart/count`, `@cart/total` for DevTools.

### Use in any component

```javascript
import { cart } from '../bags/cart.js'

export <view>
  <span class="badge">${cart.count()}</span>
  <button type="button" on-click=${() => cart.add(product)}>Add</button>

  #for cart.items() as line (line.id)
    <div>
      ${line.name} × ${line.qty}
      <button type="button" on-click=${() => cart.remove(line.id)}>Remove</button>
    </div>
  #end
</view>
```

Prefer bare `${cart.count()}` when there is no loop local to capture. Live demos: **Lab → Pulse bags** and **Todo → Shop**.

---

## 4. Templates

Templates are compile-time. The compiler emits static `createElement` calls and binding hooks.

### Text interpolation

```javascript
export <view>
  <p>${greeting}</p>
</view>
```

- If `greeting` is a **signal** → `bindText` in dev, CPW inline in production
- If `greeting` is a **component prop** → `bindPropText(node, greeting)` (handles signals and plain strings)
- Mixed template → `effect(() => { node.data = \`Hello ${name()}\` })`

### Reactive CSS variables

```javascript
import { computed, signal } from '@jacare/core'

const progress = signal(25)
const pct = computed(() => progress() + '%')

export <view>
  <div class="track">
    <div class="fill" style---pct=${pct} />
  </div>
</view>

export <style>
.fill { width: var(--pct); }
</style>
```

`style---pct` and `style:pct` are equivalent. The compiler sets `--pct` on the element. In production, CPW emits `el.style.setProperty('--pct', …)` without importing `bindStyleVar`.

### Events

See full guide: [§6 Events](#6-events-on---).

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
| `bindText(node, signal)` | Reactive text from signal (dev; prod uses CPW when possible) |
| `bindPropText(node, prop)` | Component prop (signal or string) |
| `bindAttribute(el, name, signal)` | Reactive attribute |
| `bindModel(el, name, signal)` | Two-way `value` / `checked` |
| `bindClass(el, className, signal)` | Toggle class |
| `bindStyleVar(el, name, signal)` | Reactive CSS custom property (`--name`) |
| `bindDebug(host, read, options?)` | Dev-only JSON inspector ([§7c](#7c-dev-debug-debug)) |
| `branch(anchor, fn)` | `#if` / `#elif` / `#else` and `#case` / `#when` / `#else` |
| `reconcileKeyedList(anchor, source, key, render)` | `#for` keyed lists |
| `mountSlot(anchor, children, name?)` | Slot projection |
| `ensureScopedStyle(scopeId, css)` | Inject scoped stylesheet |

### Compile-Time Pulse Wiring (CPW)

Production builds (`vite build`) enable CPW automatically via the Vite plugin. For static signal bindings, the compiler inlines:

```javascript
let _v = count.peek
node.data = String(_v)
_cleanups.push(count.subscribe(() => { /* update if changed */ }))
```

**Covered by CPW:** `${signal}`, `bind-*` (one-way), `class-*`, `style---*`.

**Still runtime:** `bindModel`, mixed text, arrow expressions, component props, control flow.

```javascript
// vite.config.js
import { jacare } from '@jacare/vite-plugin'

export default {
  plugins: [
    jacare({
      cpw: 'auto',    // default — true in production client builds
      inspect: true,  // write .jacare/compiled/*.js
    }),
  ],
}
```

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

### CSS variable binding

```javascript
const width = signal(50)
const pct = computed(() => width() + '%')

export <view>
  <div class="bar" style---pct=${pct} />
</view>
```

---

## 6. Events (`on-*` / `@*`)

Event handlers wire DOM listeners at mount and remove them on dispose. Prefer named functions for readability.

### Syntax

| Canonical | Alias | DOM |
|-----------|-------|-----|
| `on-click=${fn}` | `@click=${fn}` | `click` |
| `on-input=${fn}` | `@input=${fn}` | `input` |
| `on-submit=${fn}` | `@submit=${fn}` | `submit` |
| `on-change=${fn}` | `@change=${fn}` | `change` |
| `on-blur=${fn}` | `@blur=${fn}` | `blur` |
| `on-keydown=${fn}` | `@keydown=${fn}` | `keydown` |

Any DOM event name works: `on-<event>` or `@<event>`. The compiler emits `addEventListener` + cleanup.

### Basic click

```javascript
function save() {
  /* … */
}

export <view>
  <button on-click=${save}>Save</button>
  <button @click=${cancel}>Cancel</button>
</view>
```

### Inline arrow (captures locals)

```javascript
export <view>
  <button on-click=${() => addToCart(product.id)}>Add</button>
  <button on-click=${() => changeQty(line.productId, 1)}>+</button>
</view>
```

### Form submit

```javascript
function onSubmit(event) {
  event.preventDefault()
  form.handleSubmit(save)(event)
}

export <view>
  <form on-submit=${onSubmit}>
    <input bind-value=${form.fields.email} />
    <button type="submit">Send</button>
  </form>
</view>
```

Or with `createForm`:

```javascript
<form on-submit=${form.handleSubmit(save)}>
```

### Keyboard

```javascript
export <view>
  <input
    bind-value=${query}
    on-keydown=${(e) => { if (e.key === 'Enter') search() }}
  />
</view>
```

### Pointer / mouse

```javascript
export <view>
  <div
    class="pad"
    on-pointerdown=${onDown}
    on-pointerup=${onUp}
    on-pointermove=${onMove}
  />
  <img :src=${url} on-load=${onImageReady} on-error=${onImageError} alt="" />
</view>
```

### Prevent default / stop propagation

```javascript
function onCardClick(event) {
  event.stopPropagation()
  openDetails()
}

function onLinkClick(event) {
  event.preventDefault()
  nav.go('/settings')
}

export <view>
  <article on-click=${onCardClick}>…</article>
  <a href="/settings" on-click=${onLinkClick}>Settings</a>
</view>
```

### Rules

- Handler expression must evaluate to a **function**.
- Do not put side effects in the attribute expression itself — only in the function body.
- Listeners are removed when `mount()` dispose runs (HMR / nav unmount).
- For two-way inputs prefer `bind-value` / `bind-checked` instead of manual `on-input`.
- Component-to-parent notifications today: pass a **callback prop** (`:onPress=${fn}`). DOM events use `on-*` / `@*`.

### What the compiler emits (concept)

```javascript
const handler = save
el.addEventListener('click', handler)
_cleanups.push(() => el.removeEventListener('click', handler))
```

---

## 7. Control flow — `#if`

Conditionals mount **one** branch at a time. Inactive branches are not in the DOM.

### Syntax

```
#if <condition>
  …
#elif <condition>
  …
#else
  …
#end
```

Aliases: `@if`, `@elseif`, `@else`, `@end`.

| Part | Required | Notes |
|------|----------|-------|
| `#if expr` | yes | Truthy → mount this block |
| `#elif expr` | no | Zero or more |
| `#else` | no | Fallback |
| `#end` | yes | Closes the block |

### Signal / computed conditions

Call signals in the condition when you need a boolean read:

```javascript
const loading = signal(true)
const error = signal(null)
const isEmpty = computed(() => items().length === 0)

export <view>
#if loading()
  <p>Loading…</p>
#elif error()
  <p>${error()}</p>
#elif isEmpty()
  <p>No items</p>
#else
  <Content />
#end
</view>
```

Bare signal refs may work when the compiler rewrites them inside effects; **prefer `name()`** in `#if` for clarity.

### Nested `#if`

```javascript
#if user()
  #if user().admin
    <AdminPanel />
  #else
    <UserPanel />
  #end
#else
  <Login />
#end
```

### With siblings (order preserved)

```javascript
#if itemCount() > 0
  <p class="demo-label">${itemCount} items in cart</p>
  <ul class="list">…</ul>
  <button on-click=${clearCart}>Clear</button>
#end
```

All children of the active branch mount in **source order**.

The runtime keeps an insertion cursor after the comment anchor: each `mount()` call inserts the next node after the previous one (`createOrderedMount` in `@jacare/core`). Fragments are expanded in child order.

### Runtime

Compiles to `branch(anchor, (mount) => { if (…) mount(node); … })` from `@jacare/core`. Switching branch disposes the previous nodes and mounts the new ones.

### When to use

- Loading / error / empty / ready screens
- Auth gates
- Optional UI blocks

Avoid giant nested trees — split into components when a branch grows.

---

## 7b. Control flow — `#case`

Match **one expression** against several values. Prefer `#case` over a long `#elif` chain when every condition is `scrutinee === value`.

### Syntax

```
#case <expr>
  #when <value>
    …
  #when <value>
    …
  #else
    …
#end
```

| Part | Required | Notes |
|------|----------|-------|
| `#case expr` | yes | Evaluated once per update |
| `#when value` | yes (at least one) | Compared with `Object.is` |
| `#else` | no | Fallback when no `#when` matches |
| `#end` | yes | Closes the block |

### Example

```javascript
const role = signal('member')

export <view>
#case role()
  #when 'admin'
    <p>Admin panel unlocked.</p>
  #when 'guest'
    <p>Guest preview only.</p>
  #else
    <p>Member workspace.</p>
#end
</view>
```

### Derived match key

When the decision needs ranges or complex logic, compute a discrete key in script, then match literals in the template:

```javascript
function gradeKey() {
  const n = Number(score())
  if (n >= 90) return 'A'
  if (n >= 80) return 'B'
  if (n >= 70) return 'C'
  if (n >= 60) return 'D'
  return 'F'
}

export <view>
#case gradeKey()
  #when 'A'
    <span class="badge">Grade A</span>
  #when 'B'
    <span class="badge">Grade B</span>
  #else
    <span class="badge">Grade F</span>
#end
</view>
```

### Runtime

Same helper as `#if`: `branch()`. The compiler emits:

```javascript
const _cv = (role())
if (Object.is(_cv, ('admin'))) { … }
else if (Object.is(_cv, ('guest'))) { … }
else { … }
```

Inactive arms are not in the DOM.

### Lab

Interactive demos: Jacaré Lab route `/case`.

### `#case` vs `#if`

| Use `#case` when… | Use `#if` when… |
|-------------------|-----------------|
| Same expression vs several literals | Open boolean conditions |
| Status / role / tab machines | `loading()`, `count() > 0`, nested auth |
| You want the scrutinee evaluated once | Each branch has a different predicate |

---

## 7c. Dev debug (`<debug>`)

Pretty-print reactive state as JSON during development. Unlike `${obj}` in normal text nodes (which goes through `escapeHtml`), `<debug>` writes raw JSON to a `<pre>` via `textContent` — quotes stay readable.

### Syntax

```javascript
<debug>${cart}</debug>
<debug copy label="cart">${cart}</debug>
<debug>${{ score, mood, removed }}</debug>
```

| Part | Notes |
|------|-------|
| Body | Exactly one `${expr}` |
| `label="…"` | Optional caption in the debug header |
| `copy` | Boolean flag — shows a **Copy JSON** button |

### Props / state (Lab: Components)

```javascript
const score = pulse(0)
const mood = pulse('curious')
const removed = pulse(0)

export <view>
  <Counter :label=${'Score'} :count=${score} on-inc=${onScoreInc} />
  <debug copy label="props">${{ score, mood, removed }}</debug>
</view>
```

Bare pulse names inside object literals are auto-unwrapped (`score` → `score()`).

### Event-driven state (Lab: Events)

```javascript
const clicks = pulse(0)
const fruits = pulse([{ id: 'a', label: 'Apple', picks: 0 }])

export <view>
  <button on-click=${handleClick}>Click</button>
  <debug copy label="events">${{ clicks, fruits }}</debug>
</view>
```

Updates reactively as handlers mutate pulses.

### Production strip

The Vite plugin passes `debug: !isProduction` to `compile()`. With `debug: false`, `<debug>` nodes emit **no DOM** and no `bindDebug` import.

```javascript
compile(source, { debug: false, mode: 'client' })
```

SSR `render()` skips debug output entirely.

### Runtime helper

```javascript
import { bindDebug } from '@jacare/core'

bindDebug(host, () => cart(), { label: 'cart', copy: true })
```

Returns a dispose function (registered on the mount cleanup stack by the compiler).

---

## 8. Control flow — `#for`

Keyed lists reconcile by **key**, not index. Rows are created, moved, or removed incrementally.

### Syntax

```
#for <source> as <item> (<key>)
  …
#end
```

Aliases: `@each` … `@end`.

| Part | Example | Notes |
|------|---------|-------|
| source | `items()` / `catalog` | Array or signal-returning array |
| item | `item` / `line` | Binding per row |
| key | `(item.id)` | **Required for stable identity** |
| index | `as item, i (item.id)` | Optional second binding |

### Basic list

```javascript
const items = signal([
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
])

export <view>
<ul>
  #for items() as item (item.id)
    <li>${item.label}</li>
  #end
</ul>
</view>
```

### With index

```javascript
#for items() as item, index (item.id)
  <li>${index + 1}. ${item.label}</li>
#end
```

### Static array (module constant)

```javascript
const catalog = [/* … */]

#for catalog as product (product.id)
  <li>${product.name}</li>
#end
```

### Row actions (events inside `#for`)

```javascript
#for lines() as line (line.productId)
  <li class="cart-line">
    <strong>${line.product.name}</strong>
    <button on-click=${() => changeQty(line.productId, -1)}>−</button>
    <span>${line.qty}</span>
    <button on-click=${() => changeQty(line.productId, 1)}>+</button>
    <button on-click=${() => removeFromCart(line.productId)}>Remove</button>
  </li>
#end
```

### Immutable updates (required for refresh)

```javascript
// good — new array / new row objects
cart.update((items) => items.map((x) =>
  x.productId === id ? { …x, qty: x.qty + 1 } : x,
))

// bad — mutate in place; row may not refresh
items()[0].qty++
```

When the key stays the same but the item **identity** changes, Jacaré remounts that row’s bindings.

### Keys

| Key choice | Result |
|------------|--------|
| Stable id `(item.id)` | Move/update without remount siblings |
| Index `(index)` only | Reorder recreates rows — avoid for dynamic lists |
| Missing key | Falls back to index — warn in reviews |

### Runtime

Compiles to `reconcileKeyedList({ parent, anchor, items, getKey, render })`.

When `#for` is nested under `#if` (mount target), the compiler passes `anchor.parentNode` instead of the root `mount` parameter. On each reconcile, the runtime also prefers the live `anchor.parentNode` so the list stays attached after the initial fragment is moved into the host.

Multi-node rows (compiler may mount a `DocumentFragment` per item) keep **source order** inside each row and across the list. The runtime detects fragments with `nodeType === 11` (reliable across DOM implementations), expands them into child nodes, and inserts each row as an ordered group.

### Multi-child row (fragment)

```javascript
#for lines() as line (line.productId)
  <li class="cart-line">
    <div class="cart-line-info">
      <strong>${line.product.name}</strong>
      <span>${line.unitLabel} each</span>
    </div>
    <div class="demo-row">
      <button on-click=${() => changeQty(line.productId, -1)}>−</button>
      <span>${line.qty}</span>
      <button on-click=${() => changeQty(line.productId, 1)}>+</button>
    </div>
  </li>
#end
```

DOM order per row matches the template top-to-bottom; reordering items by key moves the whole row together.

### `#for` + `#if`

```javascript
#if lines().length
  <ul>
    #for lines() as line (line.productId)
      <li>${line.product.name}</li>
    #end
  </ul>
#else
  <p>Cart is empty</p>
#end
```

`#for` may also be a **direct child** of `#if` / `#else` (no wrapper element). The compiler resolves the list parent from the list comment anchor (`anchor.parentNode`) instead of assuming the root `mount` target — so nested control flow does not throw at runtime.

Prefer a stable `<ul>` outside `#if` when only the emptiness message toggles — fewer remounts:

```javascript
<p>${itemCount} items</p>
#if isEmpty()
  <p>Cart is empty</p>
#end
<ul>
  #for lines() as line (line.productId)
    <li>…</li>
  #end
</ul>
```

---

## 9. Components and slots

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

### Template contracts (`export <contract>`)

Declare the component surface once; the compiler emits `emit()` and `jacare check` validates parents against children — **no runtime PropTypes**.

```javascript
// Counter.jcr
export <contract>
  props: { label: 'string' }
  pulses: { count: 'number' }
  slots: ['default', 'actions']
  emits: ['inc']
</contract>

export <view>
  <p>${label}: ${count}</p>
  <slot name="actions" />
  <button on-click=${() => emit('inc')}>+</button>
</view>
```

```javascript
// parent
<Counter :label=${'Score'} :count=${score} on-inc=${() => score.update((n) => n + 1)}>
  <button slot="actions">Reset</button>
</Counter>
```

| Field | Meaning |
|-------|---------|
| `props` | Accepted props (`'string'` or `{ type, required, default, model }`) |
| `pulses` | Props expected to be pulses/signals |
| `slots` | Slot names (`default` → `children`) |
| `emits` | Events the child may `emit('name')` — parent listens with `on-name` |
| `forwards` | Parsed for future emit bridging (not validated yet) |

`compile()` returns `contract` + `props`. Rich defaults become `props["open"] ?? false` in `mount`.

**Model props (two-way):** declare `model: true`. Parents must use `bind-name={signal}` (not `:name`). Inside the child, `bind-value=${value}` compiles to `bindModel`; one-way props in text compile to `bindPropText`.

```javascript
// Field.jcr
export <contract>
  props: {
    label: { type: 'string', required: true }
    open: { type: 'boolean', default: false }
    value: { type: 'string', model: true }
  }
</contract>

export <view>
  <label>${label}</label>
  <input bind-value=${value} />
</view>
```

```javascript
// parent — build / jacare check fails if label is missing or value uses :value
<Field :label=${'Email'} bind-value=${email} />
```

### Prop rules

- `:propName=${expr}` — one-way prop (expression / signal)
- `bind-propName=${signal}` — two-way **model** prop (must match `model: true` in contract)
- `title="Hello"` — static string prop (soft type-checked when a contract is present)
- Identifiers in the template not declared in script → mount props (merged with contract)
- Imports and `signal` / `computed` declarations are never props
- With a contract, unknown props / missing required / missing pulses / wrong bind vs `:` fail `jacare check` and Vite transform

### Props — all common cases

#### Static string

```javascript
<Card title="Profile" subtitle="Edit your account" />
```

#### Signal / computed (one-way)

```javascript
const title = signal('Hello')
const upper = computed(() => title().toUpperCase())

<Badge :text=${title} />
<Badge :text=${upper} />
```

#### Callback props (parent → child “events”)

Jacaré components receive functions as props. Prefer a **template contract** `emits` + `emit('name')` + parent `on-name` when you want compile-time checking; bare callback props (`:onPress=${fn}`) still work.

```javascript
// IconButton.jcr
export <view>
  <button class="icon-btn" on-click=${onPress} type="button">
    ${label}
  </button>
</view>
```

```javascript
// parent
import IconButton from './IconButton.jcr'

function removeLine() {
  removeFromCart(line.productId)
}

export <view>
  <IconButton :label=${'Remove'} :onPress=${removeLine} />
  <IconButton
    :label=${'Add'}
    :onPress=${() => addToCart(product.id)}
  />
</view>
```

#### Boolean / disabled

```javascript
const isEmpty = computed(() => itemCount() === 0)

<button class="btn" on-click=${clearCart} :disabled=${isEmpty}>
  Clear cart
</button>
```

`:disabled=${isEmpty}` binds reactively (removes the attribute when falsy).

#### Nested components (parent → child → grandchild)

```javascript
// Page.jcr
<ProductCard
  :product=${product}
  :onAdd=${() => cart.add(product.id)}
>
  <Badge slot="tag" :text=${product.tag} />
</ProductCard>

// ProductCard.jcr — props + default/named slot + callback prop
export <view>
  <article class="card">
    <header>
      <slot name="tag" />
      <h3>${product.name}</h3>
    </header>
    <p>${product.priceLabel}</p>
    <button on-click=${onAdd}>Add</button>
  </article>
</view>
```

> Named slots: declare `<slot name="tag" />` in the child. Passing `slot="tag"` from the parent is the intended API; default `<slot />` is fully wired today.

---

## 10. Scoped CSS

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

### Reactive control flow in `export <style>`

The same `#if` / `#for` / `#case` directives work inside the style block. When any pulse they read changes, Jacaré rebuilds the CSS string, re-scopes it, and updates a per-mount `<style>` tag.

```javascript
const theme = signal('day')

export <view>
  <div class="card">Hello</div>
</view>

export <style>
.card {
  padding: 1rem;

  #if theme() === 'night'
    background: #0b1a14;
    color: #e8f8dc;
  #else
    background: #f8fffb;
    color: #0b1a14;
  #end
}
</style>
```

`#case` matches one value (same `Object.is` semantics as in the view):

```css
#case tone()
  #when 'ok'
.badge { background: #dcfce7; }
  #when 'warn'
.badge { background: #fef3c7; }
  #else
.badge { background: #f3f4f6; }
#end
```

`#for` + `${}` generate rules from lists (static arrays or pulses):

```css
#for accents() as accent (accent.id)
.chip-${accent.id} {
  border-color: ${accent.color};
}
#end
```

| Mode | Runtime |
|------|---------|
| Static style (no directives / `${}`) | `ensureScopedStyle` — one shared sheet per file |
| Reactive style | `bindStyleSheet` — per-mount sheet + `effect` |

Lab demos: `/css` (if / case / for panels).

Preprocessor attribute (parsed, not yet compiled):

```javascript
export <style lang="scss">
$color: #003030;
.title { color: $color; }
</style>
```

---

## 11. Navigation

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

### Screen title

Configure `title` on each route in `createNav` — applied when that screen activates:

```javascript
export const nav = createNav({
  layout: Shell,
  screens: {
    '/': { use: screen(Home), title: 'Jacaré · Home' },
    '/about': { use: lazy(() => import('./pages/about.jcr')), title: 'Jacaré · About' },
    '/topic/:slug': {
      use: lazy(() => import('./pages/topic.jcr')),
      title: (ctx) => `Topic · ${ctx.params.slug}`,
    },
  },
})
```

| Form | Behavior |
|------|----------|
| `title: '…'` | Static document title on activate |
| `title: (ctx) => …` | Title from `NavContext` (`params`, `search`, `path`) |

Nav titles win over an optional page-level `export const title`.

### Dynamic title — `setNavTitle` / `getNavTitle`

For titles that change while the screen is open (countdown, cart total, draft name), call **`setNavTitle`** from the page — typically inside an `effect` started in `onActivate` so it cleans up on leave. Read the current value with **`getNavTitle`**.

```javascript
import { createLifecycle, effect, getNavTitle, setNavTitle } from '@jacare/core'

const clock = derive(() => /* "24:59" */)

export const lifecycle = createLifecycle({
  onActivate() {
    const titleFx = effect(() => {
      setNavTitle(`Jacaré · Focus · ${clock()}`)
    })
    return () => titleFx.dispose()
  },
})

// later / elsewhere:
getNavTitle() // → "Jacaré · Focus · 24:59"
```

| API | When |
|-----|------|
| `createNav` `{ use, title }` | Static (or param-based) title when the route activates |
| `setNavTitle(string)` | Update `document.title` from the screen — live values, after mount |
| `getNavTitle()` | Read the current `document.title` |
| `document.title = …` in `onActivate` | One-shot; prefer `setNavTitle` for the same job |

See the live example on **Focus** in the Todo suite (`examples/jacare-todo` → `/focus`).

---

## 12. Forms

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

## 13. Lifecycle and scope

### Screen lifecycle

Export `lifecycle` from a **screen** module (a page used with `createNav`). Nav invokes hooks when the screen mounts, activates, deactivates, or unmounts.

```javascript
import { createLifecycle, signal } from '@jacare/core'

const ticks = signal(0)
let timer

// Prefer title on the route in createNav: { use: screen(This), title: 'Jacaré · Tasks' }

export const lifecycle = createLifecycle({
  onMount() {
    timer = setInterval(() => ticks.update((n) => n + 1), 1000)
    return () => clearInterval(timer)
  },
  onActivate(ctx) {
    // screen became visible — ctx has nav info
  },
  onDeactivate() {
    // screen hidden but kept alive (depending on nav strategy)
  },
  onUnmount() {
    // last chance; prefer cleanup returned from onMount
  },
})

export <view>
  <p>Open for ${ticks}s</p>
</view>
```

| Hook | When | Cleanup |
|------|------|---------|
| `onMount` | Screen first mounted | Return a function |
| `onActivate` | Screen becomes active | Return a function (optional) |
| `onDeactivate` | Screen no longer active | — |
| `onUnmount` | Screen torn down | — |

### Mount dispose (component / page root)

Every `mount(target)` returns a dispose function. Always call it on HMR or when replacing a tree:

```javascript
import mount from './app.jcr'

const root = document.getElementById('app')
let dispose = mount(root)

if (import.meta.hot) {
  import.meta.hot.dispose(() => dispose?.())
  import.meta.hot.accept(() => {
    dispose?.()
    dispose = mount(root)
  })
}
```

### Scope debugging

Scope is a **manual watch list** for values you care about during development — separate from the Pulse Graph (which tracks every `pulse` / `derive` / `effect` automatically).

```javascript
import { registerScope } from '@jacare/core'

// typically inside onActivate / mount
const stop = registerScope('cart.total', 'Cart total', () => total())
registerScope('cart.count', 'Items', () => itemCount())

// later (or return stop from onActivate cleanup)
stop()
```

| Piece | Role |
|-------|------|
| `id` | Stable key (replacing the same id updates the entry) |
| `label` | Human label in the Scope panel |
| `read` | Getter polled ~every 120ms while DevTools is connected |
| Return value | Unsubscribe / remove that entry |
| `clearScope()` | Remove all entries at once |

Visible in the **Scope** panel (default bottom-left) when `connectJacareDevtools()` is active. Use it for cart totals, form drafts, filters — anything you want to glance at without hunting through the full Pulse Graph.

Open **⚙ Config** on the Pulse Graph to move either panel, clear highlights/selection, or clear Scope entries.

---

## 13b. Cookbook — `#if` + `#for` + events + props + lifecycle

Full screen-style example combining the main template features:

```javascript
import { computed, createLifecycle, signal } from '@jacare/core'
import Badge from './Badge.jcr'
import IconButton from './IconButton.jcr'

const loading = signal(false)
const items = signal([
  { id: 'a', label: 'Alpha', done: false },
  { id: 'b', label: 'Beta', done: true },
])

const remaining = computed(() => items().filter((i) => !i.done).length)
const isEmpty = computed(() => items().length === 0)

function toggle(id) {
  items.update((list) =>
    list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
  )
}

function remove(id) {
  items.update((list) => list.filter((i) => i.id !== id))
}

function addItem() {
  const id = crypto.randomUUID()
  items.update((list) => [...list, { id, label: 'New', done: false }])
}

export const lifecycle = createLifecycle({
  onActivate() {
    // live title — prefer setNavTitle + effect (see §11)
    document.title = `Tasks (${remaining()})`
  },
})

export <view>
  <header class="row">
    <h1>Tasks</h1>
    <Badge :text=${() => `${remaining()} left`} />
    <button class="btn" on-click=${addItem}>Add</button>
  </header>

  #if loading()
    <p class="muted">Loading…</p>
  #elif isEmpty()
    <p class="muted">No tasks yet.</p>
  #else
    <ul class="list">
      #for items() as item (item.id)
        <li class="list-item" class-done=${item.done}>
          <button on-click=${() => toggle(item.id)}>${item.label}</button>
          <IconButton :label=${'Remove'} :onPress=${() => remove(item.id)} />
        </li>
      #end
    </ul>
  #end
</view>
```

**What each piece does:**

| Feature | In the example |
|---------|----------------|
| `#if` / `#elif` / `#else` | loading / empty / list |
| `#for` + key | `items() as item (item.id)` |
| Events | `on-click` on Add / row / toggles |
| Props | `:text`, `:label`, `:onPress` into Badge / IconButton |
| `class-*` | `class-done=${item.done}` |
| Lifecycle | `createNav` `{ use, title }` for static titles; `setNavTitle` + `effect` for live titles |

| Immutable update | `items.update(list => list.map/filter/…)` |

---

## 14. SSR and hydration

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

## 15. DevTools

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

connectJacareDevtools()
```

Panels (dev only — only when you call `connectJacareDevtools()`):

- **Pulse Graph** — signal dependency graph, **live values**, **source names** (`count` · `Counter.jcr:4`), **DOM highlight** on hover
- **Scope** — values you register with `registerScope()` (manual watch list; see [§13](#13-lifecycle-and-scope))

Controls: `⚙` config · `◎` pick element · `−` minimize · `×` hide · **drag header** to move. Config lets you pick corners, clear highlight/selection, clear Scope, or reset layout. Preferences persist in `sessionStorage`.

```javascript
connectJacareDevtools({
  position: 'bottom-right',  // Pulse Graph
  scopePosition: 'bottom-left',
  scope: true,
})
```

Zero runtime cost when DevTools are not connected (production should keep the import behind `import.meta.env.DEV`). The Vite plugin passes `debug: !isProduction`, so name/bind metadata is stripped from production builds.

### Pulse Graph nodes

Each node in the graph has:

| Field | Description |
|-------|-------------|
| `id` | Stable numeric id |
| `name` | Source variable name when known (`count`) |
| `file` / `line` | Declaration location |
| `kind` | `signal` · `computed` · `effect` |
| `value` | Last known value |
| `stale` | Derived node marked dirty |
| `subscribers` | Downstream dependency count |
| `disposed` | Effect cleaned up |

| Label | Example |
|-------|---------|
| Named | `count` · Counter.jcr:4 |
| Fallback | `Pulse #3` |

### Source names

In DEV the compiler rewrites declarations:

```javascript
const count = pulse(0, { name: 'count', file: '/src/Counter.jcr', line: 4 })
const total = derive(() => count() * 2, { name: 'total', file: '…', line: 12 })
```

You can also pass options manually, or rename later:

```javascript
import { pulse, namePulse } from '@jacare/core'

const count = pulse(0, { name: 'count' })
namePulse(count, 'cartCount', { file: 'Cart.jcr', line: 8 })
```

### DOM highlight

Bindings compiled in DEV also register `(pulse → DOM node)`:

```javascript
bindText(_text1, count)
devtoolsBind(count, _text1, { kind: 'text', file: '…', line: 28 })
```

| Action | Feedback |
|--------|----------|
| Hover node in Pulse Graph | Outline on bound DOM elements |
| Click `◎` (pick) | Click a page element → selects pulses that feed it |
| Pulse value update | List + value panel flash in the Pulse Graph (no DOM blink) |

Runtime helpers:

```javascript
import {
  highlightBinding,
  clearHighlight,
  flashDom,
  pickElement,
  getBindingsForPulse,
  getPulsesForElement,
  devtoolsBind,
} from '@jacare/core'

highlightBinding(pulseId)
const el = await pickElement()
```

See [Phase 6 — DevTools](phases/06-devtools.md).

---

## 16. Compiler API

Package: `@jacare/compiler`

```typescript
import { compile, parseModule, parseTemplate } from '@jacare/compiler'

const result = compile(source, {
  filename: 'Card.jcr',
  mode: 'client',       // 'client' | 'server' | 'full'
  cpw: true,            // inline pulse wiring (default false; Vite prod sets true)
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
  → Binding IR        BindingSource → leaf / flow / component ops → MountPlan
  → generate()        mount / render / resume (same MountPlan walk)
  → scopeCss()        [data-jacare-s] selectors
```

Client and SSR emit from the same lowered forest (`MountPlan`). Classification (`signal` / `prop` / `expr`, CPW eligibility, `#if` DCE) happens once in the IR — not re-decided per backend.

### Binding IR helpers

```typescript
import {
  compile,
  inspectTemplateBindings,
  lowerMountAst,
  parseModule,
  parseTemplate,
} from '@jacare/compiler'

const mod = parseModule(source, 'Card.jcr')
const ast = parseTemplate(mod.viewHtml!, { filename: 'Card.jcr' })

// Compact sites for tooling (kind · label · mode · sourceKind)
inspectTemplateBindings(ast)

// Structural plan shared by client + SSR emit
lowerMountAst(ast, { signals: new Set(['count']), cpw: false })
```

### Standalone compile

```bash
npx jacare-compile src/app.jcr dist/app.js
jacare compile src/app.jcr --watch
jacare check
jacare check --bindings   # also print IR binding sites per file
```

### Pulse analysis

`jacare check --bindings` lists every lowered site (`text`, `attr`, `class`, `model`, `if`, `list`, …) with mode and source kind. Suboptimal-pattern warnings (e.g. `${count()}` where `${count}` is enough) remain planned; today the compiler silently picks the best binding and `--bindings` exposes the decision.

See [Phase 2 — Compiler](phases/02-compiler.md#binding-ir).

---

## 17. CLI

Package: [`@jacare/cli`](https://www.npmjs.com/package/@jacare/cli)

```bash
npm install -g @jacare/cli
```

| Command | Description |
|---------|-------------|
| `jacare new <name> [--template=…]` | Scaffold project |
| `jacare dev [--port=N] [--open=false]` | Dev server |
| `jacare build` | Production build → `dist/` |
| `jacare compile <file> [out] [--watch]` | Compile one file |
| `jacare check` | Compile-check all `.jcr` in CWD (contracts included) |
| `jacare check --bindings` | Same as `check`, plus IR binding sites per file |
| `jacare check --no-style` | Skip soft style hints (redundant `${() => …}`) |
| `jacare check --strict-style` | Fail when style warnings are present |

### `jacare.config.js`

```javascript
export default {
  title: 'My App',
  port: 3000,
  base: '/',
}
```

---

## 18. Vite plugin

Package: [`@jacare/vite-plugin`](https://www.npmjs.com/package/@jacare/vite-plugin)

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
      cpw: 'auto',            // 'auto' | true | false — prod client builds use CPW
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

### Featured tutorial

| | |
|---|---|
| **[Jacaré Lab](https://jacarejs.github.io/core/lab/)** | Full interactive API tutorial — live demos + View code for every section |
| Path | `examples/jacare-lab` |
| Run | `yarn lab:dev` |

### Other demos

| Example | Path | Highlights |
|---------|------|------------|
| **Todo** | `examples/jacare-todo` | Nav, forms, Shop (`createBag`), tutorial, lifecycle |
| **Showcase** | `examples/jacare-showcase` | CPW, `style---`, components, slots, cart |
| **Scale BMI** | `examples/jacare-bmi` | Live gauge, metric/imperial, `derive` + range inputs |

```bash
yarn lab:dev        # Jacaré Lab (tutorial) — http://localhost:3003
yarn example:dev    # todo app
yarn showcase:dev   # showcase
yarn bmi:dev        # Scale BMI
```

Live demos: [Lab](https://jacarejs.github.io/core/lab/) · [Todo](https://jacarejs.github.io/core/todo/) · [Showcase](https://jacarejs.github.io/core/showcase/) · [BMI](https://jacarejs.github.io/core/bmi/)

---

## 19. Testing

Jacaré apps and packages are tested with **Vitest** and **happy-dom**.

| Approach | When to use |
|----------|-------------|
| Runtime unit tests | Signals, bindings, nav, forms without compiling templates |
| Compile + mount | Full `.jcr` integration — compile source, call `mount(root)` |
| Compiler assertions | Verify generated `bindText` / `bindModel` / `branch` output |
| DevTools registry | `enableDevtools()` + `getPulseGraph()` in tests |

```bash
yarn test          # monorepo — 127 tests
```

Full guide: [testing.md](testing.md)

### `@jacare/testing` (planned)

A dedicated package will provide `render()`, query helpers, and `cleanup()` around the compile-and-mount flow. Until it ships, use the patterns in [testing.md](testing.md).

---

## 20. Runtime helpers index

All from [`@jacare/core`](https://www.npmjs.com/package/@jacare/core) unless noted.

| Helper | Doc | Role |
|--------|-----|------|
| `signal` / `pulse` | [§3](#3-reactivity) | Writable reactive cell |
| `computed` / `derive` | [§3](#3-reactivity) | Derived value |
| `effect` / `watch` | [§3](#3-reactivity) | Side effect |
| `batch` | [§3](#3-reactivity) | Coalesce updates |
| `createBag` / `ripple` / `getBag` | [§3b](#3b-pulse-bags-shared-state) | Shared pulse mesh |
| `bindText` / `bindPropText` | [§5](#5-dom-bindings) | Text node |
| `bindAttribute` / `bindProperty` | [§5](#5-dom-bindings) | Attributes / props |
| `bindModel` | [§5](#5-dom-bindings) | Two-way input |
| `bindClass` / `bindStyleVar` | [§5](#5-dom-bindings) | Class / CSS var |
| `bindDebug` | [§7c `<debug>`](#7c-dev-debug-debug) | Dev JSON inspector |
| `namePulse` / `devtoolsBind` | [§15](#15-devtools) | Source names + DOM bindings |
| `highlightBinding` / `pickElement` | [§15](#15-devtools) | DOM outline / picker |
| `branch` / `showIf` | [§7 `#if`](#7-control-flow--if) · [§7b `#case`](#7b-control-flow--case) | Conditionals / match |
| `ensureScopedStyle` | [§10](#10-scoped-css) | Static scoped CSS inject |
| `bindStyleSheet` / `scopeCss` | [§10](#10-scoped-css) | Reactive style (`#if` / `#for` / `#case`) |
| `reconcileKeyedList` | [§8 `#for`](#8-control-flow--for) | Keyed lists |
| `mountSlot` | [§9](#9-components-and-slots) | Slot projection |
| Event `on-*` / `@*` | [§6](#6-events-on---) | DOM listeners |
| `createNav` / `lazy` | [§11](#11-navigation) | Routing |
| `screens: { use, title }` | [§11 Screen title](#screen-title) | Document title per route |
| `setNavTitle` / `getNavTitle` | [§11 Dynamic title](#dynamic-title--setnavtitle--getnavtitle) | Live `document.title` read/write from a screen |
| `createForm` | [§12](#12-forms) | Forms |
| `createLifecycle` / `registerScope` | [§13](#13-lifecycle-and-scope) | Lifecycle / debug |
| `renderToString` / `resumeBindings` | [§14](#14-ssr-and-hydration) | SSR |
| `connectJacareDevtools` | [§15](#15-devtools) | [`@jacare/devtools`](https://www.npmjs.com/package/@jacare/devtools) |

---

## Packages on npm

| Package | Link |
|---------|------|
| `@jacare/core` | https://www.npmjs.com/package/@jacare/core |
| `@jacare/compiler` | https://www.npmjs.com/package/@jacare/compiler |
| `@jacare/vite-plugin` | https://www.npmjs.com/package/@jacare/vite-plugin |
| `@jacare/cli` | https://www.npmjs.com/package/@jacare/cli |
| `@jacare/devtools` | https://www.npmjs.com/package/@jacare/devtools |
| `@jacare/meta` | https://www.npmjs.com/package/@jacare/meta |
| `create-jacare` | https://www.npmjs.com/package/create-jacare |

```bash
npm install -g @jacare/cli
npm install @jacare/core
npm install -D @jacare/vite-plugin vite
```
