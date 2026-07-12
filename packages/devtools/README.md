# @jacare/devtools

Development tools for Jacaré — Pulse Graph inspector and live Scope panel.

## Install

```bash
npm install @jacare/devtools
```

Requires `@jacare/core`.

## Usage

```javascript
import { connectJacareDevtools } from '@jacare/devtools'

if (import.meta.env.DEV) {
  connectJacareDevtools()
}
```

## Pulse Graph

Inspect reactive nodes, dependencies, and live values in a floating panel.

```javascript
import { enableDevtools, getPulseGraph, subscribePulseGraph } from '@jacare/core'

enableDevtools()
const snapshot = getPulseGraph()
```

## Scope panel

Watch registered form fields and signals with `registerScope()`:

```javascript
import { registerScope } from '@jacare/core'

registerScope('draft', () => draft())
```

## Options

```javascript
connectJacareDevtools({
  pulse: true,
  scope: true,
  target: document.body,
})
```

## Links

- [Repository](https://github.com/jacarejs/core)
- [DevTools docs](https://github.com/jacarejs/core/blob/main/docs/phases/06-devtools.md)

## License

MIT
