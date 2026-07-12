# @jacare/core

Fine-grained reactivity runtime for [Jacaré](https://github.com/jacarejs/core). Zero Virtual DOM — updates flow directly to the DOM through a pulse graph.

## Install

```bash
npm install @jacare/core
```

## Quick start

```javascript
import { pulse, derive, view } from '@jacare/core'

const count = pulse(0)
const label = derive(() => `Count: ${count()}`)

export default view`
  <button on-click=${() => count.update((n) => n + 1)}>
    ${label}
  </button>
`
```

Each `.jcr` module compiles to `mount()`, `render()`, and `resume()`.

## Reactivity

| API | Description |
|-----|-------------|
| `pulse(initial)` | Reactive value |
| `derive(() => …)` | Computed value |
| `watch(fn)` | Side effect |

Aliases: `signal`, `computed`, `effect`.

## Navigation

```javascript
import { createNav, lazy, screen } from '@jacare/core'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': screen(Home),
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  missing: NotFound,
})
```

Use `jacare-go` on links and `jacare-frame` in the layout shell.

## Forms

```javascript
import { createForm } from '@jacare/core'

const form = createForm({
  initial: { email: '' },
  validate: (values) => ({ email: values.email ? null : 'Required' }),
})
```

Bind fields with `bind-value=${form.fields.email}`.

## SSR

```javascript
import { renderToString, renderToStream } from '@jacare/core'
```

## Links

- [Repository](https://github.com/jacarejs/core)
- [Docs](https://github.com/jacarejs/core/blob/main/docs/syntax.md)

## License

MIT
