import { describe, expect, it } from 'vitest'
import { compile, parseContractBody, parseModule } from '../src/index.js'

describe('template contracts', () => {
  it('parses export <contract> fields', () => {
    const source = `import { pulse } from '@jacare/core'
const count = pulse(0)

export <contract>
  props: { label: 'string' }
  pulses: { count: 'number' }
  slots: ['default', 'actions']
  emits: ['inc']
</contract>

export <view>
  <p>\${label}: \${count}</p>
  <slot name="actions" />
  <button on-click=\${() => emit('inc')}>+</button>
</view>`

    const mod = parseModule(source)
    expect(mod.contract).toBeTruthy()
    expect(mod.contract?.props.label?.type).toBe('string')
    expect(mod.contract?.pulses.count).toBe('number')
    expect(mod.contract?.slots).toEqual(['default', 'actions'])
    expect(mod.contract?.emits.inc).toEqual({})
    expect(mod.code).not.toContain('<contract>')
  })

  it('parses rich prop definitions', () => {
    const body = `
props: {
  label: { type: 'string', required: true }
  open: { type: 'boolean', default: false }
  value: { type: 'string', model: true }
}
emits: {
  change: { value: 'number' }
  done: {}
}
`
    const contract = parseContractBody(body)
    expect(contract.props.label).toEqual({ type: 'string', required: true })
    expect(contract.props.open).toEqual({ type: 'boolean', default: false })
    expect(contract.props.value).toEqual({ type: 'string', model: true })
    expect(contract.emits.change).toEqual({ value: 'number' })
    expect(contract.emits.done).toEqual({})
  })

  it('compiles emit helper and prop defaults from contract', () => {
    const source = `export <contract>
  props: {
    label: { type: 'string', required: true }
    open: { type: 'boolean', default: false }
  }
  emits: ['toggle']
</contract>

export <view>
  <p>\${label}</p>
  <button on-click=\${() => emit('toggle')}>\${open}</button>
</view>`

    const result = compile(source, { filename: 'Toggle.jcr' })
    expect(result.contract?.emits.toggle).toEqual({})
    expect(result.props).toEqual(expect.arrayContaining(['label', 'open']))
    expect(result.code).toContain('function emit(name, ...payload)')
    expect(result.code).toContain('props["open"] ?? false')
    expect(result.code).toContain('emit(')
  })
})
