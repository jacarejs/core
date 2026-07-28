export const overviewCode = `// JS-first. TypeScript is optional.
// Pick one:
//   1. Sibling Foo.jcr.ts  (typed logic, clean view)
//   2. // @jacare-ts       (types inside the .jcr script)
//   3. import from .ts     (Vite compiles the .ts as usual)
//   4. jacare.d.ts         (type import App from './app.jcr')`

export const siblingTsCode = `// counter.jcr.ts  — logic only (no export <view>)
import { pulse } from '@jacare/core'

export const count = pulse(0)

export function increment(): void {
  count.set(count() + 1)
}`

export const siblingJcrCode = `// counter.jcr  — view only; compiler merges counter.jcr.ts
export <view>
  <button type="button" on-click={increment}>
    \${count}
  </button>
</view>`

export const pragmaCode = `// @jacare-ts
import { pulse } from '@jacare/core'

const start: number = 0
const count = pulse(start)

function bump(delta: number): void {
  count.set(count() + delta)
}

export <view>
  <button type="button" on-click={() => bump(1)}>
    \${count}
  </button>
</view>`

export const importTsCode = `// cart.jcr — explicit import (any .ts file; no auto-merge)
import { cart, addLine } from './cart.ts'
import type { Line } from './cart.ts'

export <view>
  <p>Lines: \${() => cart.lines().length}</p>
  <button type="button" on-click={() => addLine({ id: '1', qty: 1 })}>
    Add
  </button>
</view>`

export const dtsCode = `// jacare.d.ts — type host apps that import .jcr modules
declare module '*.jcr' {
  import type { Cleanup } from '@jacare/core'
  export function mount(
    target: ParentNode,
    props?: Record<string, unknown>,
  ): Cleanup
  export function render(
    props?: Record<string, unknown>,
  ): { html: string; state: unknown }
  export function resume(
    target: ParentNode,
    state: unknown,
    props?: Record<string, unknown>,
  ): Cleanup
  const _default: typeof mount
  export default _default
}`

export const rulesCode = `| Rule | Detail |
|------|--------|
| Default | .jcr script is JavaScript |
| Sibling path | Foo.jcr → Foo.jcr.ts (auto-merged) |
| Sibling content | Logic only — no export <view> |
| Pragma | // @jacare-ts on its own line |
| Strip | esbuild removes types before codegen |
| Editor | VS Code: pragma → TS colors; .jcr.ts → TypeScript mode |`
