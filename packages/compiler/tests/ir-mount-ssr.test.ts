import { describe, expect, it } from 'vitest'
import { compile } from '../src/compile.js'
import { lowerMountAst } from '../src/ir/mount-plan.js'
import { parseTemplate } from '../src/parse-template.js'

const FIXTURE = `
import { signal } from '@jacare/core'
const count = signal(0)
const open = signal(true)
export <view>
  <div class="box" class-open=\${open} bind-title=\${count}>
    <p>\${count}</p>
  </div>
</view>
`

describe('MountPlan + SSR leaf IR', () => {
  it('lowers forest into MountPlan nodes', () => {
    const ast = parseTemplate(`<p class="x">\${count}</p>`)
    const forest = lowerMountAst(ast, {
      signals: new Set(['count']),
      cpw: false,
    })
    expect(forest).toHaveLength(1)
    expect(forest[0]!.kind).toBe('element')
    if (forest[0]!.kind !== 'element') return
    expect(forest[0].tag).toBe('p')
    expect(forest[0].children[0]?.kind).toBe('text')
  })

  it('SSR emits dynamic class/attr from leaf IR', () => {
    const result = compile(FIXTURE, { mode: 'server' })
    expect(result.code).toContain('open()')
    expect(result.code).toContain('class=\\"open\\"')
    expect(result.code).toContain('title=')
    expect(result.code).toContain('data-jacare-bind')
  })

  it('client emits from the same MountPlan forest', () => {
    const result = compile(FIXTURE, { mode: 'client' })
    expect(result.code).toContain('createElement')
    expect(result.code).toContain('bindClass')
    expect(result.code).toContain('bindAttribute')
    expect(result.code).toContain('bindText')
  })
})

describe('compile microbench', () => {
  it('compiles a representative fixture under budget', () => {
    const source = `
import { signal, derive } from '@jacare/core'
const count = signal(0)
const items = signal([1, 2, 3])
const label = derive(() => 'n=' + count())
export <view>
  <h1>\${label}</h1>
  <button class-on=\${count} on-click=\${() => count.update(n => n + 1)}>+1</button>
  #if count() > 0
    <p>go</p>
  #else
    <p>idle</p>
  #end
  #for items() as n (n)
    <span>\${n}</span>
  #end
</view>
`
    const times: number[] = []
    for (let i = 0; i < 30; i++) {
      const t0 = performance.now()
      compile(source, { mode: 'client', cpw: true, filename: 'bench.jcr' })
      times.push(performance.now() - t0)
    }
    times.sort((a, b) => a - b)
    const p95 = times[Math.floor(times.length * 0.95)]!
    // Loose CI budget (ms); production bench target remains 50ms in benchmarks/compile-app.mjs
    expect(p95).toBeLessThan(100)
  })
})
