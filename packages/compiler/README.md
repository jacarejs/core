# @jacare/compiler

The Jacaré compiler transforms `.jcr` modules into optimized JavaScript for the client, server, or both.

A `.jcr` file is plain JavaScript with a `view\`...\`` tagged template. The compiler parses the template, detects reactive bindings, and emits fine-grained DOM code that uses `@jacare/core`.

---

## Table of contents

- [Install](#install)
- [What it compiles](#what-it-compiles)
- [Basic usage](#basic-usage)
- [Compile modes](#compile-modes)
- [Template syntax](#template-syntax)
- [Component props](#component-props)
- [CLI](#cli)
- [Error reporting](#error-reporting)
- [Source maps](#source-maps)
- [Integration](#integration)
- [Links](#links)

---

## Install

```bash
npm install @jacare/compiler
```

Usually installed as a dependency of `@jacare/vite-plugin` or `@jacare/cli`. Use directly when building custom tooling.

---

## What it compiles

**Input** — a `.jcr` module:

```javascript
import { pulse, view } from '@jacare/core'

const count = pulse(0)

export default view`
  <button on-click=${() => count.update((n) => n + 1)}>
    Count: ${count}
  </button>
`
```

**Output** — optimized JavaScript:

```javascript
export function mount(target) { /* direct DOM operations */ }
export function render() { /* SSR HTML */ }
export function resume(target, state) { /* hydration */ }
export default mount
```

The compiler imports only the runtime helpers each file actually uses (`bindText`, `branch`, `bindModel`, etc.).

---

## Basic usage

```javascript
import { compile } from '@jacare/compiler'
import { readFileSync, writeFileSync } from 'node:fs'

const source = readFileSync('src/app.jcr', 'utf-8')

const result = compile(source, {
  filename: 'src/app.jcr',
  mode: 'client',
})

writeFileSync('dist/app.js', result.code)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filename` | `string` | — | Source path for error messages and source maps |
| `mode` | `'client' \| 'server' \| 'full'` | `'full'` | Output mode |
| `runtimeImport` | `string` | `'@jacare/core'` | Import path for runtime helpers |

### Return value

```typescript
{
  code: string
  map?: RawSourceMap
}
```

---

## Compile modes

| Mode | Emits | Use case |
|------|-------|----------|
| `client` | `mount()` + `resume()` | Browser bundles |
| `server` | `render()` | SSR |
| `full` | All three | Tooling, inspection |

```javascript
compile(source, { mode: 'client' })  // dev / client-only
compile(source, { mode: 'server' })  // SSR-only
compile(source, { mode: 'full' })    // default
```

---

## Template syntax

### Text interpolation

```javascript
view`<p>${message}</p>`
view`<p>Hello, ${name()}!</p>`
```

Bare pulse references compile to `bindText`. Mixed text uses reactive effects.

### Events

```javascript
view`<button on-click=${save}>Save</button>`
view`<button on-click=${() => remove(id)}>Delete</button>`
```

### Attribute bindings

```javascript
view`<a bind-href=${url}>Link</a>`
view`<img bind-src=${avatar} bind-alt=${name} />`
```

Arrow functions in attributes are invoked reactively:

```javascript
view`<a jacare-go=${() => href(id)} href=${() => href(id)}>Go</a>`
```

### Two-way bindings

```javascript
view`
  <input bind-value=${text} />
  <input type="checkbox" bind-checked=${done} />
`
```

### Conditionals

```javascript
view`
  #if items().length === 0
    <p class="empty">No items</p>
  #else
    <ul>...</ul>
  #end
`
```

### Keyed lists

```javascript
view`
  #for items() as item (item.id)
    <li>${item.label}</li>
  #end
`
```

The expression in parentheses is the **key** for `reconcileKeyedList`.

### Components

```javascript
import Field from './Field.jcr'

view`<Field :label=${'Name'} :field=${form.fields.name} />`
```

---

## Component props

Variables used in the template but not declared in the module script become mount props:

```javascript
// Field.jcr
export default view`
  <label>
    <span>${label}</span>
    <input bind-value=${field} />
  </label>
`
```

Compiles to:

```javascript
export function mount(target, props = {}) {
  const label = props['label']
  const field = props['field']
  // ...
}
```

Module imports (`import { topics } from './topics.js'`) are **not** treated as props.

---

## CLI

```bash
npx jacare-compile src/app.jcr dist/app.js
```

Without an output path, writes next to the input with `.js` extension.

```bash
jacare-compile src/app.jcr
# → src/app.js
```

---

## Error reporting

Compile errors throw `JacareCompileError` with file, line, column, and a source snippet:

```
Jacaré: unclosed view template literal
  at src/app.jcr:12:3
export default view`
  <div>
```

```javascript
import { compile, formatCompileError, JacareCompileError } from '@jacare/compiler'

try {
  compile(source, { filename: 'app.jcr' })
} catch (error) {
  if (error instanceof JacareCompileError) {
    console.error(formatCompileError(error))
  }
}
```

---

## Source maps

When `filename` is provided, the compiler emits source maps mapping generated JS back to `.jcr` lines:

```javascript
const result = compile(source, { filename: 'src/app.jcr' })
console.log(result.map?.sources) // ['src/app.jcr']
```

---

## Integration

### With Vite

Use `@jacare/vite-plugin` — it calls this compiler automatically for `.jcr` files.

### With custom bundlers

Call `compile()` in your transform step and pass through the result.

### Detecting lazy loaders

The runtime uses `Symbol.for('jacare.lazy')` on loaders returned by `lazy()`. The compiler does not need special handling for lazy imports.

---

## Links

- [Repository](https://github.com/jacarejs/core)
- [Compiler docs](https://github.com/jacarejs/core/blob/main/docs/phases/02-compiler.md)
- [Syntax guide](https://github.com/jacarejs/core/blob/main/docs/syntax.md)
- [@jacare/core](https://www.npmjs.com/package/@jacare/core)

## License

MIT
