# Phase 4 — SSR and JavaScript-First Modules

## Problem

Phase 3 added dynamic DOM, but SSR was still missing:

1. **Server render** — HTML on first request
2. **Resumability** — hydrate bindings without full re-execution
3. **Streaming** — emit HTML incrementally where possible

**Core question:** How do you stay close to vanilla JavaScript while compiling views and serving them on the server?

## Format Change — JavaScript Modules

Jacaré `.jcr` files are **plain JavaScript modules**. Views use a `view` tagged template:

```javascript
import { pulse, view } from '@jacare/core'

const count = pulse(0)

export default view`
  <div>
    <p>${count}</p>
    <button on-click=${increment}>+</button>
  </div>
`

function increment() {
  count.update((n) => n + 1)
}
```

### Why this is different

Jacaré `.jcr` files are plain JavaScript — no `<script>` / `<template>` blocks:

| Pattern | Jacaré |
|---------|------|
| File structure | One JavaScript module |
| Markup | `view\`...\`` tagged template |
| Events | `on-click` or `@click` |
| Control flow | `#if` / `#for` or `@if` / `@each` |
| Interpolation | `${expr}` — native JS template literals |

The compiler:

1. Finds `view\`...\`` in the module
2. Flattens `${expr}` → `{expr}` in an HTML template
3. Emits `mount`, `render`, and `resume` alongside your code

### Control flow

```javascript
view`
  #if items().length === 0
    <p>Empty</p>
  #else
    <ul>
      #for items() as item (item.id)
        <li>${item.label}</li>
      #end
    </ul>
  #end
`
```

## SSR Architecture

### Three exports per component

| Export | Environment | Role |
|--------|-------------|------|
| `mount(target)` | Client | Create DOM + reactive bindings |
| `render(props?)` | Server | Return `{ html, state }` |
| `resume(target, state)` | Client | Hydrate bindings on existing HTML |

### Render pipeline

```
AST → MountPlan (shared with client)
render()
  ├── walk MountPlan
  ├── emit HTML from leaf IR (text / class / attr / style)
  └── collect binding snapshot in state.bindings
```

Bindings use `data-jacare-bind` markers:

```html
<span data-jacare-bind="b1">42</span>
```

```javascript
{
  bindings: [
    { id: 'b1', kind: 'signal', read: count },
    { id: 'b2', kind: 'expr', read: () => count() * 2 },
  ]
}
```

Dynamic `class-*`, `bind-*`, and text interpolations go through the same leaf IR as the client (`emit-ssr-leaf`) — SSR does not re-classify “is this a signal?”.
### Resume (resumability)

`resume(target, state)` calls `resumeBindings()` — attaches fine-grained bindings to server HTML **without** running `mount()` again. Both `signal` and `expr` bindings hydrate through the `read` function.

### Security

Dynamic SSR output uses `escapeHtml()` from `@jacare/core` on all interpolated values. Never bypass this when extending the compiler.

### Streaming

```typescript
import { renderToStream } from '@jacare/core'

for await (const chunk of renderToStream(render)) {
  res.write(chunk)
}
```

Phase 4 streams one chunk per top-level HTML sibling. Nested incremental streaming is future work.

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| JS-first modules | Vanilla feel, standard tooling | Requires compiler for `view` |
| Tagged template `view` | Native JS syntax for markup | Template literal parsing complexity |
| `#if` / `#for` blocks | Readable control flow | Custom syntax inside literals |
| `render` + `resume` split | True resumability | Two client entry points |
| `data-jacare-bind` markers | Precise hydration targets | Extra DOM attributes in HTML |

## Implementation

```
packages/compiler/src/
├── ir/mount-plan.ts     — MountPlan forest (shared)
├── ir/emit-ssr-leaf.ts  — dynamic text/attrs → HTML + bindings
├── codegen-client.ts    — mount() from MountPlan
└── codegen-ssr.ts       — render() + resume() from MountPlan

packages/runtime/src/
├── view.ts              — compile-time stub
└── ssr/index.ts         — renderToString, renderToStream, resumeBindings, escapeHtml
```

## Tests

```bash
yarn build && yarn test
```

- Module parsing and `view` literal flattening
- `#if`, `#for`, `on-click` parsing
- `mount` / `render` / `resume` codegen from MountPlan
- SSR leaf IR for dynamic class/attr/text
- `resumeBindings` hydration for signal and expr bindings
- `escapeHtml` neutralizes markup in SSR output
- `renderToString` and `renderToStream`

## Not yet implemented

| Area | Detail |
|------|--------|
| Nested streaming | Yield HTML per nested node (top-level chunks work) |
| Islands | `resume` per component region |
| TypeScript in `.jcr` | SWC transform for module script |
| Serialized signal graph | Full state transfer for resumability |
| SSR component composition | Nested `render()` chaining |

---

**Next:** Nav — layout frames, lazy screens, warm preload
