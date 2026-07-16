# Phase 2 — Compiler and Vite Integration

## Problem

Phase 1 delivered fine-grained reactivity, but writing DOM by hand does not scale. Declarative templates must compile to direct DOM operations — with no intermediate virtual tree.

**Core question:** How do you turn declarative markup into code that updates only the nodes that actually change?

## Analysis

### Why a compiler?

Manual DOM with `bindText`, `bindAttribute`, and `effect` works, but repeats the same boilerplate. A compiler:

1. **Removes boilerplate** — creates elements, appends children, and wires bindings at compile time
2. **Infers dependencies** — `${count}` becomes `bindText(node, count)` automatically
3. **Emits static code** — DOM structure is known at build time; zero template parsing at runtime
4. **Imports only what is used** — runtime helpers are added per file based on generated code

### `.jcr` format

Jacaré files are **plain JavaScript modules**. Views use `export <view>` blocks (recommended) or a `view` tagged template:

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

export <view>
  <p>${count}</p>
  <button on-click=${() => count.update((n) => n + 1)}>+</button>
</view>

export <style>
.counter { padding: 1rem; }
</style>
```

Tagged template (still supported):

```javascript
export default view`
  <p>${count}</p>
`
```

**Template syntax:**

| Syntax | Output |
|--------|--------|
| `${expr}` | Reactive text (`bindText` or `effect`) |
| `bind-href=${url}` / `:href=${url}` | `bindAttribute` |
| `bind-value=${text}` / `bind-checked=${on}` | `bindModel` (signal) or `bindProperty` (expr) |
| `class-active=${on}` / `class:active=${on}` | `bindClass` (dev) / CPW (prod) |
| `style---pct=${pct}` / `style:pct=${pct}` | `bindStyleVar` (dev) / CPW (prod) |
| `on-click=${handler}` / `@click=${handler}` | `addEventListener` + `removeEventListener` |
| `#if` / `#elif` / `#else` / `#end` | `branch()` |
| `#for items() as item (id)` / `#end` | `reconcileKeyedList()` |
| `<Child :prop=${value} />` | Component `mount()` call |

## Alternatives

### A. Runtime template parser
- **Pros:** Flexible, no build step
- **Cons:** Runtime parsing, larger bundle, no build-time optimizations
- **Verdict:** Rejected as the primary approach

### B. Dedicated compiler (chosen)
- **Pros:** Zero runtime parsing, static optimizations, full control over output
- **Cons:** Up-front compiler investment
- **Verdict:** Selected

### C. Macro/transform-only in an existing bundler
- **Pros:** Less custom code
- **Cons:** External dependency, less control over output
- **Verdict:** Vite as an optional integration; compiler stays independent

## Architectural Decision

### Compilation pipeline

```
.jcr source (JavaScript module)
    │
    ▼
parseModule() ──► export <view> / view`...` + export <style> / style`...`
    │
    ▼
flattenLiteral() ──► HTML template + expression slots
    │
    ▼
parseTemplate() ──► TemplateAST
    │
    ▼
detectProps() + detectSignals() ──► mount props + reactive names
    │
    ▼
generate() ──► mount / render / resume
    │
    ▼
mount(target) ──► DOM + bindings
```

### Generated output (development)

```javascript
import { signal, bindText } from '@jacare/core'

const count = signal(0)

export function mount(target) {
  const _cleanups = []
  const _frag = document.createDocumentFragment()
  const _el1 = document.createElement('p')
  const _text1 = document.createTextNode('')
  _el1.appendChild(_text1)
  _cleanups.push(bindText(_text1, count))
  _frag.appendChild(_el1)
  target.appendChild(_frag)
  return () => { for (const c of _cleanups) c() }
}

export default mount
```

### Generated output (production — CPW)

When `cpw: true` (default in `vite build` client mode), static signal bindings inline `peek` + `subscribe`:

```javascript
import { signal } from '@jacare/core'

const count = signal(0)

export function mount(target) {
  const _cleanups = []
  const _frag = document.createDocumentFragment()
  const _el1 = document.createElement('p')
  const _text1 = document.createTextNode('')
  _el1.appendChild(_text1)
  let _v2 = count.peek
  _text1.data = String(_v2)
  _cleanups.push(count.subscribe(() => {
    const _v3 = count.peek
    if (Object.is(_v3, _v2)) return
    _v2 = _v3
    _text1.data = String(_v3)
  }))
  _frag.appendChild(_el1)
  target.appendChild(_frag)
  return () => { for (const c of _cleanups) c() }
}
```

Only runtime helpers referenced in the generated code appear in the import line.

### Binding optimizations

The compiler recognizes simple patterns:

- `count` or `count()` when `count` is a declared signal → `bindText` in dev, CPW in production
- Mixed text like `` `value = ${doubled}` `` → `` `value = ${doubled()}` `` inside an `effect`
- Complex expressions → `effect(() => { ... })` — automatic tracking
- Dynamic attributes like `href=${() => href(id)}` → `effect` that invokes the arrow and sets the attribute
- Event handlers → `addEventListener` with `removeEventListener` in dispose
- `bind-value` / `bind-checked` on a signal → `bindModel` (two-way)
- `#if` / `#elif` / `#else` → `branch` (not `showIf`)

### Prop and signal detection

**`detectProps(script, ast)`** collects identifiers used in the template that are not declared in the module script:

- Walks all `import { … } from` blocks with `matchAll` (not only the first import)
- Skips `const` / `let` / `var` declarations and default imports
- Names used only in the template become `mount(target, props)` parameters

**`detectSignals(script)`** finds reactive values declared with `signal`, `pulse`, `computed`, or `derive`:

- Strips `view\`…\`` template literals before scanning so string constants like `` const code = `pulse(0)` `` are not treated as signals

**`resolveSignalExpr(expr, signals)`** maps template expressions to direct signal bindings:

- `${count}` or `${count()}` → `bindText` / `bindModel` when `count` is a known signal
- String constants and component props fall through to `effect` or `bindProperty`

### Components

PascalCase tags compile to imported module calls. Parents can pass children between tags; the child projects them with `<slot />`:

```javascript
import Card from './Card.jcr'

export <view>
<Card :title=${'Hello'}>
  <p>Slot content</p>
</Card>
</view>
```

```javascript
// Card.jcr
export <view>
<div class="card">
  <h3>${title}</h3>
  <slot />
</div>
</view>
```

Self-closing form still works: `<Field :label=${'Email'} />`.

Props are inferred from `:name=${expr}` attributes and undeclared identifiers in the child template. Module imports (e.g. `import { topics } from './topics.js'`) are never treated as mount props.

### Compile modes

| Mode | Exports |
|------|---------|
| `full` (default) | `mount`, `render`, `resume` |
| `client` | `mount`, `resume` |
| `server` | `render` |

### Errors and source maps

`JacareCompileError` reports `filename:line:column` with a source snippet. `compile()` emits source maps mapping generated JS back to `.jcr` lines. The Vite plugin forwards `loc` and `frame` to the dev-server error overlay.

## Vite integration

`@jacare/vite-plugin` transforms `.jcr` files during dev and production builds:

```typescript
import { defineConfig } from 'vite'
import jacare from '@jacare/vite-plugin'

export default defineConfig({
  plugins: [jacare()],
})
```

Or use the helper:

```typescript
import { createJacareViteConfig } from '@jacare/vite-plugin'

export default createJacareViteConfig({
  title: 'My App',
  port: 3000,
  base: '/',
})
```

The compiler also runs standalone via CLI:

```bash
jacare compile src/app.jcr
jacare compile src/app.jcr --watch
jacare check
```

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| Custom parser | No parser dependencies, full control | HTML parser maintenance |
| JS-first modules | Standard tooling, colocated logic | Requires `view` transform |
| `bindText` for simple signals | Peak performance | Detection heuristics |
| Per-file runtime imports | Smaller bundles | Import tracking in codegen |
| Vite as optional plugin | Fast dev server, HMR | Peer dependency |
| Standalone CLI | Works without Vite | Extra binary |

## Implementation

```
packages/compiler/src/
├── types.ts           — AST types
├── parse-module.ts    — JavaScript module parser
├── flatten-literal.ts — view`...` → HTML + expressions
├── parse-template.ts  — HTML template parser
├── codegen-cpw.ts     — CPW inline emission
├── codegen-client.ts  — mount() emission
├── codegen-ssr.ts     — render() + resume() emission
├── codegen-shared.ts  — resolveSignalExpr, CodegenContext
├── codegen.ts         — generate() + detectProps/detectSignals
├── errors.ts          — JacareCompileError
├── compile.ts         — Pipeline entry
└── index.ts

packages/vite-plugin/src/
└── index.ts           — Vite transform hook
```

## Known limitations

| Limitation | Detail |
|------------|--------|
| One `view` per file | `findViewTemplates` exists but is not used in the pipeline |
| Named slots | `<slot name="footer" />` parses; `mountSlot` ignores `name` for now |
| `detectProps` heuristic | Props from `:attr` and free identifiers in template |
| No fragments | No `<>...</>` |
| No HTML validation | Unclosed tags may produce invalid output |
| No TypeScript in `.jcr` | Type annotations in module script are not stripped |
| CPW v1 scope | `bindModel` and dynamic expressions stay on runtime helpers |

## Not yet implemented

| Area | Detail |
|------|--------|
| ~~Compile-time dependency graph~~ | **CPW v1** — inline wiring in production for static bindings |
| CPW for `bindModel` | Two-way inputs still use runtime helper |
| TypeScript in `.jcr` | SWC transform for type annotations |
| Component prop types | **Done (1a/1b):** `export <contract>` + defaults + `model`/`bind-*` validation (`jacare check` + Vite) |
| HTML validation | Actionable errors for unclosed tags |
| Pluggable directives | Custom attribute transforms via plugin API |
| Branch tree-shaking | `#if import.meta.env.DEV` eliminated at build time |

### Pulse analysis

Compile-time diagnostics when a binding could be more efficient:

| Pattern | Today | Diagnostic (planned) |
|---------|-------|----------------------|
| `${count()}` with bare signal | Emits `bindText` when detected | Warn if written as call when bare reference works |
| `${label()}` inside mixed text | Falls back to `effect` | Suggest splitting or using computed |
| Signal read in event handler | Correct — not a binding | No warning |

The compiler already uses `detectSignals()` and `resolveSignalExpr()` to choose `bindText`, `bindModel`, or `effect`. Pulse analysis will expose these decisions as warnings during `jacare compile` and `jacare check`.

## Tests

```bash
yarn build && yarn test
```

- Parse `view` literals and module imports
- Parse elements, interpolations, attributes, control flow, components
- Generate `mount()` with correct bindings
- Import only used runtime helpers (no `showIf` when only `branch` is emitted)
- `JacareCompileError` with file position
- Source maps in `compile()` output
- `detectProps` ignores secondary module imports
- `detectSignals` ignores signal-like text inside string literals
- Mixed text and dynamic attributes invoke signals correctly
- `bindModel` for `bind-value` / `bind-checked`

---

**Next:** [Incremental DOM](03-incremental-dom.md) — keyed lists, conditionals, components
