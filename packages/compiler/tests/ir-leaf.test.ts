import { describe, expect, it } from 'vitest'
import { lowerElementBindings, lowerTextParts } from '../src/ir/lower-leaf.js'
import { markCpwText } from '../src/ir/optimize.js'
import { compile } from '../src/compile.js'

describe('lower leaf ops', () => {
  const signals = new Set(['count', 'open', 'hue'])
  const ctx = { signals, cpw: false }

  it('lowers text signal to bindText', () => {
    const lowered = lowerTextParts([{ type: 'expr', value: 'count()' }], ctx)
    expect(lowered).toEqual({
      kind: 'binding',
      op: {
        op: 'text',
        source: { kind: 'signal', name: 'count', local: true },
        mode: 'bindText',
      },
    })
  })

  it('marks local text as cpw when enabled', () => {
    const lowered = markCpwText(
      lowerTextParts([{ type: 'expr', value: 'count' }], ctx),
      true,
    )
    expect(lowered.kind).toBe('binding')
    if (lowered.kind === 'binding') {
      expect(lowered.op.mode).toBe('cpw')
    }
  })

  it('lowers class / style / model attrs', () => {
    const ops = lowerElementBindings(
      [
        { name: 'active', kind: 'class', value: 'open()' },
        { name: 'hue', kind: 'style', value: 'hue' },
        { name: 'value', kind: 'bind', value: 'count' },
        { name: 'click', kind: 'event', value: 'inc' },
      ],
      ctx,
    )
    expect(ops.map((o) => o.op)).toEqual([
      'classToggle',
      'styleVar',
      'model',
      'event',
    ])
    expect(ops[0]).toMatchObject({ mode: 'bindClass', className: 'active' })
    expect(ops[1]).toMatchObject({ mode: 'bindStyleVar', cssVar: '--hue' })
    expect(ops[2]).toMatchObject({ mode: 'bindModel', prop: 'value' })
  })

  it('compiles counter fixture via leaf IR (parity smoke)', () => {
    const source = `
      import { signal } from '@jacare/core'
      const count = signal(0)
      export <view>
        <button class-active=\${count} on-click=\${() => count.update(c => c + 1)}>\${count}</button>
      </view>
    `
    const result = compile(source)
    expect(result.code).toContain('bindText')
    expect(result.code).toContain('bindClass')
    expect(result.code).toContain('addEventListener')
  })

  it('compiles bind-value and style--- via leaf IR', () => {
    const source = `
      import { signal } from '@jacare/core'
      const text = signal('')
      const hue = signal(120)
      export <view>
        <input bind-value=\${text} />
        <div style---hue=\${hue}></div>
      </view>
    `
    const result = compile(source)
    expect(result.code).toContain('bindModel')
    expect(result.code).toContain('bindStyleVar')
    expect(result.code).toContain('--hue')
  })

  it('CPW on/off share apply helpers', () => {
    const source = `
      import { signal } from '@jacare/core'
      const count = signal(0)
      const on = signal(false)
      export <view>
        <span class-on=\${on}>\${count}</span>
      </view>
    `
    const bind = compile(source, { mode: 'client', cpw: false })
    const cpw = compile(source, { mode: 'client', cpw: true })
    expect(bind.code).toContain('bindText')
    expect(bind.code).toContain('bindClass')
    expect(cpw.code).toContain('.peek')
    expect(cpw.code).toContain('.subscribe')
    expect(cpw.code).not.toContain('bindText')
  })
})
