import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  compile,
  hasJacareTsPragma,
  prepareModuleScript,
  stripTypeScript,
} from '../src/index.js'

describe('TypeScript in .jcr', () => {
  it('detects // @jacare-ts pragma', () => {
    expect(hasJacareTsPragma('// @jacare-ts\nconst n: number = 1\n')).toBe(true)
    expect(hasJacareTsPragma('const n = 1\n')).toBe(false)
  })

  it('strips type annotations with esbuild', () => {
    const js = stripTypeScript(`const n: number = 1\nexport type T = string\n`)
    expect(js).toContain('const n = 1')
    expect(js).not.toContain(': number')
    expect(js).not.toContain('export type')
  })

  it('compiles .jcr script marked with // @jacare-ts', () => {
    const source = `// @jacare-ts
import { signal } from '@jacare/core'

const count: number = 0
const value = signal(count)

function bump(delta: number): void {
  value.set(value() + delta)
}

export <view>
  <button type="button" on-click={() => bump(1)}>\${value}</button>
</view>`

    const result = compile(source, { filename: '/tmp/counter.jcr' })
    expect(result.code).toContain('export function mount')
    expect(result.code).toContain('const count = 0')
    expect(result.code).not.toContain(': number')
    expect(result.code).not.toContain('@jacare-ts')
    expect(result.script).not.toContain(': number')
  })

  it('merges sibling .jcr.ts logic into a view-only .jcr', () => {
    const dir = mkdtempSync(join(tmpdir(), 'jacare-jcr-ts-'))
    try {
      const jcrPath = join(dir, 'counter.jcr')
      writeFileSync(
        jcrPath,
        `export <view>
  <button type="button" on-click={increment}>\${count}</button>
</view>
`,
        'utf8',
      )
      writeFileSync(
        `${jcrPath}.ts`,
        `import { pulse } from '@jacare/core'

export const count = pulse(0)

export function increment(): void {
  count.set(count() + 1)
}
`,
        'utf8',
      )

      const result = compile(
        `export <view>
  <button type="button" on-click={increment}>\${count}</button>
</view>
`,
        { filename: jcrPath },
      )

      expect(result.script).toContain('pulse(0)')
      expect(result.script).toContain('function increment')
      expect(result.script).not.toContain(': void')
      expect(result.code).toContain('export function mount')
      expect(result.code).toContain('bindText')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects sibling .jcr.ts that contains a view block', () => {
    expect(() =>
      prepareModuleScript('', {
        filename: '/x/app.jcr',
        siblingScript: `const n = 1
export <view>
  <p>\${n}</p>
</view>
`,
      }),
    ).toThrow(/logic only/)
  })

  it('leaves plain JS .jcr unchanged without pragma or sibling', () => {
    const source = `import { signal } from '@jacare/core'
const count = signal(0)
export <view>
  <p>\${count}</p>
</view>`
    const result = compile(source)
    expect(result.script).toContain('const count = signal(0)')
    expect(result.code).toContain('export function mount')
  })
})
