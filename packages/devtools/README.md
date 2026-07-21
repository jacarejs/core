# @jacare/devtools

[![npm](https://img.shields.io/npm/v/@jacare/devtools.svg?color=189030)](https://www.npmjs.com/package/@jacare/devtools)
[![downloads](https://img.shields.io/npm/dm/@jacare/devtools.svg)](https://www.npmjs.com/package/@jacare/devtools)
[![license](https://img.shields.io/npm/l/@jacare/devtools.svg)](https://github.com/jacarejs/core/blob/main/LICENSE)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![demo](https://img.shields.io/badge/demo-Todo-78c018.svg)](https://jacarejs.github.io/core/todo/)

Development tools for Jacaré — a **Pulse Graph** inspector (with a **Mesh** tab for `createBag`), plus a live **Scope** panel.

Use this package during development to visualize reactive dependencies, inspect live pulse values (with flash-on-change), pop Mesh into its own window when needed, and watch registered scope variables.

---

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Pulse Graph panel](#pulse-graph-panel)
- [Scope panel](#scope-panel)
- [Registering scope values](#registering-scope-values)
- [Low-level API](#low-level-api)
- [Options](#options)
- [When to use](#when-to-use)
- [Production builds](#production-builds)
- [Links](#links)

---

## Install

```bash
npm install @jacare/devtools
```

Requires `@jacare/core` as a peer dependency.

npm: [https://www.npmjs.com/package/@jacare/devtools](https://www.npmjs.com/package/@jacare/devtools)

---

## Quick start

Add to your app entry (e.g. `boot.js`) and guard with a dev check:

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

if (import.meta.env.DEV) {
  connectJacareDevtools()
}
```

Two floating panels appear (dev only):

1. **Pulse Graph** — reactive nodes + **Mesh** tab (`createBag` as `@id/key`; ↗ pops out to a separate window)
2. **Scope** — registered variables from `registerScope()`

### Show / hide Pulse Graph

| Action | How |
|--------|-----|
| Config | `⚙` — corners, clear highlight/selection/Scope, reset layout |
| Move | Drag the header, or pick a corner in Config |
| Minimize | `−` in the panel header (or click the collapsed header to expand) |
| Hide | `×` — collapses to a dark **Pulse Graph** chip |
| Show again | Click the chip |
| Remember | Mode + corners stored in `sessionStorage` |
| Remove entirely | Call the dispose function returned by `connectJacareDevtools()` |
| Never load | Omit `connectJacareDevtools()` or guard with `import.meta.env.DEV` (production builds tree-shake it) |

```javascript
connectJacareDevtools({
  position: 'bottom-right',
  scopePosition: 'bottom-left',
})
```

Call the returned dispose function to remove panels:

```javascript
const dispose = connectJacareDevtools()
// later
dispose()
```

---

## Pulse Graph panel

The Pulse Graph shows every reactive node in your app:

| Node kind | Label | Description |
|-----------|-------|-------------|
| `signal` | Pulse | Writable reactive state |
| `computed` | Derive | Values computed from other nodes |
| `effect` | Watch | Side effects that track dependencies |

In **DEV**, the Jacaré compiler injects `{ name, file, line }` on `pulse` / `derive` / `effect` declarations and registers DOM bindings via `devtoolsBind`. The panel then shows:

| Instead of | You see |
|------------|---------|
| `Pulse #3` | `count` · Counter.jcr:4 |
| `Derive #2` | `total` · Cart.jcr:12 |

| Action | Feedback |
|--------|----------|
| Hover a node | Outline bound DOM elements |
| Click `◎` | Pick a page element → select pulses that feed it |
| Value change | List flash + value panel flash in the Pulse Graph |

For each node you can see:

- **Name / source** — variable name and `file:line` when known
- **Value preview** — shown in the list and detail pane; flashes green when it changes
- **DOM bindings** — kind and location of template bindings
- **Dependencies** — which nodes this one reads from
- **Dependents** — which nodes read from this one

Pulses created **before** `connectJacareDevtools()` are still tracked (registration is always on; the panel only becomes visible after connect).

### How it works

`connectJacareDevtools()` calls `enableDevtools()` from `@jacare/core`, which instruments the pulse graph. The panel subscribes via `subscribePulseGraph()` and re-renders on every change.

---

## Scope panel

Scope is a **manual** watch list — nothing appears until you call `registerScope()`. Useful for cart totals, form drafts, filters, etc.

Values refresh ~every 120ms. Clear with `clearScope()`, the Scope `⌫` button, or Pulse Graph **Clear Scope**. Default position: bottom-left.

---

## Registering scope values

In your `.jcr` or `.js` files:

```javascript
import { pulse, registerScope } from '@jacare/core'

const draft = pulse('')
const filter = pulse('')

registerScope('draft', 'Draft', () => draft())
registerScope('filter', 'Filter', () => filter())
```

The Scope panel will show:

```
DRAFT    "hello world"
FILTER   ""
```

Register as many values as you need. Use descriptive names — they appear as labels in the panel.

### Form fields

```javascript
import { createForm, registerScope } from '@jacare/core'

const form = createForm({
  initial: { email: '', message: '' },
})

registerScope('email', () => form.fields.email())
registerScope('email.error', () => form.fields.email.error())
```

---

## Low-level API

You can build custom tooling without the built-in panels:

```javascript
import {
  enableDevtools,
  getPulseGraph,
  subscribePulseGraph,
} from '@jacare/core'

enableDevtools()

const snapshot = getPulseGraph()
console.log(snapshot.nodes)  // all reactive nodes
console.log(snapshot.edges)  // dependency edges

const unsubscribe = subscribePulseGraph(() => {
  const latest = getPulseGraph()
  // render your own UI
})
```

### Snapshot shape

```typescript
interface PulseGraphSnapshot {
  nodes: PulseNode[]
  edges: PulseEdge[]
}

interface PulseNode {
  id: string
  kind: 'signal' | 'computed' | 'effect'
  value: unknown
  stale?: boolean
  subscribers?: number
  disposed?: boolean
}
```

`name` (e.g. `pulse#count` from compiler metadata) is planned — see [docs/phases/06-devtools.md](https://github.com/jacarejs/core/blob/main/docs/phases/06-devtools.md#compiler-node-names).

```typescript
interface PulseEdge {
  from: string
  to: string
}
```

---

## Options

### connectJacareDevtools

```javascript
connectJacareDevtools({
  target: document.body,  // where to mount panels
  scope: true,              // set false to hide Scope panel
  mesh: true,               // set false to hide Mesh tab
  position: 'bottom-right',
  scopePosition: 'bottom-left',
  meshPosition: 'top-left', // used when Mesh is popped out
  meshDetached: false,      // true = start Mesh as its own window
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `HTMLElement` | `document.body` | DOM element to append panels to |
| `scope` | `boolean` | `true` | Enable Scope panel (`connectJacareScope`) |
| `mesh` | `boolean` | `true` | Enable Mesh tab (and optional pop-out window) |
| `position` | corner | `bottom-right` | Pulse Graph corner |
| `scopePosition` | corner | `bottom-left` | Scope corner |
| `meshPosition` | corner | `top-left` | Mesh window corner when detached |
| `meshDetached` | `boolean` | `false` | Start with Mesh in a separate window |

### connectJacareScope

Use the Scope panel independently:

```javascript
import { connectJacareScope } from '@jacare/devtools'

const dispose = connectJacareScope({
  target: document.body,
  pulseMs: 120,  // refresh interval in ms
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `HTMLElement` | `document.body` | Where to mount the panel |
| `pulseMs` | `number` | `120` | How often to poll scope values |

### connectJacareMesh

Inspect `createBag` cells in a standalone floating window (same UI as **↗ Pop out** from the Mesh tab):

```javascript
import { connectJacareMesh } from '@jacare/devtools'

const dispose = connectJacareMesh({
  target: document.body,
  pulseMs: 120,
})
```

Shows bag ids, `@id/key` addresses, intent ports, DOM bind sources, and the last `ripple` flash. Use **↙** to dock back into the Pulse Graph Mesh tab when connected via `connectJacareDevtools`.

---

## When to use

| Scenario | Tool |
|----------|------|
| Debug why a template isn't updating | Pulse Graph — check dependencies |
| See which pulses an effect tracks | Pulse Graph — inspect edges |
| Watch form state during typing | Scope panel + `registerScope()` |
| Understand reactivity in a new screen | Both panels |
| CI / production | Do not include — dev only |

---

## Production builds

Always guard devtools behind a dev check:

```javascript
if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}
```

The `todo` scaffold template from `@jacare/cli` includes this pattern by default.

Tree-shaking removes `@jacare/devtools` from production bundles when the import is behind `import.meta.env.DEV`.

---

## Links

- [npm — @jacare/devtools](https://www.npmjs.com/package/@jacare/devtools)
- [Repository](https://github.com/jacarejs/core)
- [DevTools docs](https://github.com/jacarejs/core/blob/main/docs/phases/06-devtools.md)
- [@jacare/core](https://www.npmjs.com/package/@jacare/core)
- [Live demo](https://jacarejs.github.io/core/todo/)
- [Jacaré Lab](https://jacarejs.github.io/core/lab/)
- Related: [@jacare/cli](https://www.npmjs.com/package/@jacare/cli) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin)

## License

MIT
