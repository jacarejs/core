# @jacare/compiler

Compiles Jacaré `.jcr` modules into optimized client and server output.

## Install

```bash
npm install @jacare/compiler
```

## Usage

```javascript
import { compile } from '@jacare/compiler'

const source = `
import { pulse, view } from '@jacare/core'

const count = pulse(0)

export default view\`
  <p>\${count}</p>
\``

const { code, map } = compile(source, {
  filename: 'app.jcr',
  mode: 'client',
})
```

## Modes

| Mode | Output |
|------|--------|
| `client` | `mount()` + `resume()` |
| `server` | `render()` |
| `full` | All three (default) |

## CLI

```bash
npx jacare-compile src/app.jcr dist/app.js
```

## Features

- `view\`...\`` tagged templates
- `#if` / `#for` control flow
- Component props and keyed lists
- Source maps back to `.jcr` lines
- `JacareCompileError` with file, line, and snippet

## Links

- [Repository](https://github.com/jacarejs/core)
- [Compiler docs](https://github.com/jacarejs/core/blob/main/docs/phases/02-compiler.md)

## License

MIT
