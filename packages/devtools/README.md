# @jacare/devtools

Development tools for Jacaré — a **Pulse Graph** inspector and a live **Scope** panel.

Use this package during development to visualize reactive dependencies, inspect live pulse values, and watch registered scope variables update in real time.

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

Two floating panels appear in the bottom-right corner of the page (dev only):

1. **Pulse Graph** — reactive nodes, dependencies, and **live values**
2. **Scope** — registered variables from `registerScope()`

### Show / hide Pulse Graph

| Action | How |
|--------|-----|
| Minimize | `−` in the panel header (or click the collapsed header to expand) |
| Hide | `×` — collapses to a dark **Pulse Graph** chip |
| Show again | Click the chip |
| Remember | Mode is stored in `sessionStorage` for the tab |
| Remove entirely | Call the dispose function returned by `connectJacareDevtools()` |
| Never load | Omit `connectJacareDevtools()` or guard with `import.meta.env.DEV` (production builds tree-shake it) |

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

For each node you can see:

- **Id / kind** — Pulse, Derive, or Watch
- **Value preview** — shown in the list and detail pane; flashes green when it changes
- **Dependencies** — which nodes this one reads from
- **Dependents** — which nodes read from this one

Pulses created **before** `connectJacareDevtools()` are still tracked (registration is always on; the panel only becomes visible after connect).

### How it works

`connectJacareDevtools()` calls `enableDevtools()` from `@jacare/core`, which instruments the pulse graph. The panel subscribes via `subscribePulseGraph()` and re-renders on every change.

---

## Scope panel

The Scope panel shows values registered with `registerScope()` from `@jacare/core`.

This is useful for watching:

- Form field values
- Draft text before submit
- Filter/search state
- Any custom value you want visible during development

Values refresh automatically on a short interval (default 120ms) and whenever scope subscriptions fire.

---

## Registering scope values

In your `.jcr` or `.js` files:

```javascript
import { pulse, registerScope } from '@jacare/core'

const draft = pulse('')
const filter = pulse('')

registerScope('draft', () => draft())
registerScope('filter', () => filter())
```

The Scope panel will show:

```
draft   "hello world"
filter  ""
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
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `HTMLElement` | `document.body` | DOM element to append panels to |
| `scope` | `boolean` | `true` | Enable Scope panel (`connectJacareScope`) |

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
- Related: [@jacare/cli](https://www.npmjs.com/package/@jacare/cli) · [@jacare/vite-plugin](https://www.npmjs.com/package/@jacare/vite-plugin)

## License

MIT
