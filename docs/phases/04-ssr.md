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
render()
  ├── evaluate template structure
  ├── emit HTML string
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
├── flatten-literal.ts   — view`...` → HTML + expressions
├── parse-module.ts      — JavaScript module parser
├── codegen-client.ts    — mount() emission
└── codegen-ssr.ts       — render() + resume() emission

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
- `mount` / `render` / `resume` codegen
- `resumeBindings` hydration for signal and expr bindings
- `escapeHtml` neutralizes markup in SSR output
- `renderToString` and `renderToStream`

## Future Work

1. **Chunked streaming** — yield HTML per top-level node
2. **Islands** — `resume` per component region
3. **TypeScript in `.jcr`** — SWC transform for `<script>`-less TS
4. **Serialized signal graph** — full state transfer for resumability
5. **SSR component composition** — nested `render()` chaining

---

**Next:** Nav — layout frames, lazy screens, warm preload
