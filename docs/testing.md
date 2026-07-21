# Testing Jacaré

Guide for testing Jacaré apps and packages with **Vitest** and **happy-dom**.

For API details see [api.md](api.md). For compiler internals see [phases/02-compiler.md](phases/02-compiler.md).

---

## Toolchain

| Tool | Role |
|------|------|
| [Vitest](https://vitest.dev/) | Test runner |
| [happy-dom](https://github.com/capricorn86/happy-dom) | Lightweight DOM for Node.js |
| `@jacare/compiler` | Compile `.jcr` source in integration tests |
| `@jacare/core` | Runtime APIs under test |

The monorepo runs **127 tests** across runtime, compiler, vite-plugin, cli, meta, and create-jacare (`yarn test`).

---

## Project setup

### Monorepo (this repository)

Vitest is configured at the root in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['packages/**/tests/**/*.test.{ts,js}'],
  },
})
```

`pretest` runs `yarn build` so `@jacare/*` dist files exist before tests execute.

### Your app

Add Vitest and happy-dom:

```bash
npm install -D vitest happy-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
```

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Patterns

### 1. Runtime unit tests

Test signals, bindings, and DOM helpers directly:

```typescript
import { describe, expect, it } from 'vitest'
import { signal } from '@jacare/core'
import { bindText } from '@jacare/core'

it('updates text when signal changes', () => {
  const count = signal(0)
  const el = document.createElement('p')
  const dispose = bindText(el, count)

  expect(el.textContent).toBe('0')
  count.set(5)
  expect(el.textContent).toBe('5')

  dispose()
})
```

Use this for `@jacare/core` internals, custom helpers, and nav/forms logic without compiling templates.

### 2. Compile `.jcr` then mount

Integration tests compile source strings and call the generated `mount()`:

```typescript
import { describe, expect, it } from 'vitest'
import { compile } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const SOURCE = `
import { signal } from '@jacare/core'

const count = signal(0)

export <view>
  <p class="value">\${count}</p>
  <button class="inc" on-click=\${() => count.update((n) => n + 1)}>+1</button>
</view>
`

function loadMount(source: string) {
  const { code } = compile(source)
  const body = code
    .replace(/^import[^\n]*\n/, '')
    .replace(/^export default mount\s*/m, '')
    .replace(/^export /gm, '')
  return new Function(
    'runtime',
    \`const { signal, computed, effect, bindText, bindModel, bindAttribute, bindClass, branch, reconcileKeyedList } = runtime
\${body}
return mount\`,
  )(runtime) as (target: HTMLElement) => () => void
}

it('increments on click', () => {
  const mount = loadMount(SOURCE)
  const root = document.createElement('div')
  const dispose = mount(root)

  expect(root.querySelector('.value')?.textContent).toBe('0')
  root.querySelector<HTMLButtonElement>('.inc')?.click()
  expect(root.querySelector('.value')?.textContent).toBe('1')

  dispose()
})
```

Reference implementation: `packages/runtime/tests/todo.test.ts`.

### 3. Compiler output assertions

Verify generated code without mounting:

```typescript
import { compile } from '@jacare/compiler'

const result = compile(source, { filename: 'app.jcr' })

expect(result.code).toContain('export function mount(target)')
expect(result.code).toContain('bindText')
expect(result.code).not.toContain('showIf')

const cpw = compile(source, { mode: 'client', cpw: true })
expect(cpw.code).toContain('.peek')
expect(cpw.code).toContain('.subscribe(')
expect(cpw.code).not.toContain('bindText(')
```

Use for binding selection (`bindText` vs `bindModel` vs CPW vs `effect`), prop detection, and error positions.

### 3b. Binding IR inspection

```typescript
import { inspectTemplateBindings, parseModule, parseTemplate } from '@jacare/compiler'

const mod = parseModule(source, 'Card.jcr')
const ast = parseTemplate(mod.viewHtml!, { filename: 'Card.jcr' })
const sites = inspectTemplateBindings(ast)

expect(sites.some((s) => s.kind === 'text' && s.sourceKind === 'signal')).toBe(true)
```

Or from the CLI:

```bash
jacare check --bindings
```

### 4. DevTools registry

```typescript
import { enableDevtools, getPulseGraph, resetDevtoolsForTests } from '@jacare/core'

afterEach(() => resetDevtoolsForTests())

it('tracks signal updates', () => {
  enableDevtools()
  const count = signal(0)
  count.set(1)
  const graph = getPulseGraph()
  expect(graph.nodes.length).toBeGreaterThan(0)
})
```

---

## Async updates

Signal-driven DOM updates may flush on the next microtask. After mutating state, await a tick:

```typescript
count.set(42)
await Promise.resolve()
expect(el.textContent).toBe('42')
```

---

## CI

The monorepo CI runs:

```bash
yarn install --frozen-lockfile
yarn typecheck
yarn test
yarn example:build
yarn showcase:build
```

---

## Planned: `@jacare/testing`

A dedicated testing package is on the roadmap. It will wrap the compile-and-mount pattern with helpers such as:

| API (planned) | Purpose |
|---------------|---------|
| `render(source)` | Compile `.jcr` and mount into a container |
| `screen.getByText()` | Query rendered output |
| `fireEvent.click()` | Dispatch DOM events |
| `cleanup()` | Dispose mounts between tests |

Until `@jacare/testing` ships, use the patterns above.
