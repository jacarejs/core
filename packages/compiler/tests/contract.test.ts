import { describe, expect, it } from 'vitest'
import {
  compile,
  parseContractBody,
  parseModule,
  parseTemplate,
  validateContractUsage,
} from '../src/index.js'

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

  it('parses contract links and injects getBag locals', () => {
    const body = `
links: {
  count: { from: 'cart.count', mode: 'read' }
  add: { from: 'cart.add', mode: 'write' }
  money: 'cart.money'
}
`
    const contract = parseContractBody(body)
    expect(contract.links.count).toEqual({ from: 'cart.count', mode: 'read' })
    expect(contract.links.add).toEqual({ from: 'cart.add', mode: 'write' })
    expect(contract.links.money).toEqual({ from: 'cart.money', mode: 'read' })

    const source = `export <contract>
  links: {
    count: { from: 'cart.count', mode: 'read' }
  }
</contract>

export <view>
  <span>\${count}</span>
</view>`
    const client = compile(source, { mode: 'client', debug: false, cpw: false })
    expect(client.contract?.links.count).toEqual({ from: 'cart.count', mode: 'read' })
    expect(client.props).not.toContain('count')
    expect(client.code).toContain('getBag')
    expect(client.code).toContain('bindText')
    expect(client.code).toContain('const count = getBag("cart")?.count')
    expect(client.code).toMatch(/bindText\([^,]+, count\)/)

    const cpw = compile(source, { mode: 'client', debug: false, cpw: true })
    expect(cpw.code).toContain('count.peek')
    expect(cpw.code).toContain('count.subscribe')

    const server = compile(source, { mode: 'server', debug: false })
    expect(server.code).toContain('const count = getBag("cart")?.count')
    expect(server.code).toContain("kind: 'signal', read: count")
  })

  it('parses hyphenated bag ids in links', () => {
    const contract = parseContractBody(`
links: {
  count: { from: 'lab-cart.count', mode: 'read' }
}
`)
    expect(contract.links.count).toEqual({ from: 'lab-cart.count', mode: 'read' })
  })

  it('rejects link names that clash with props', () => {
    expect(() =>
      parseContractBody(`
props: { count: 'number' }
links: { count: { from: 'cart.count', mode: 'read' } }
`),
    ).toThrow(/clashes with props/)
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

  it('keeps bind- as model binding on component call sites', () => {
    const source = `import Field from './Field.jcr'
import { pulse } from '@jacare/core'
const email = pulse('')
export <view>
  <Field :label=\${'Email'} bind-value=\${email} />
</view>`
    const mod = parseModule(source)
    const ast = parseTemplate(mod.viewHtml!)
    const field = ast.children[0]
    expect(field?.type).toBe('component')
    if (field?.type !== 'component') return
    expect(field.attrs).toEqual(
      expect.arrayContaining([
        { name: 'label', kind: 'prop', value: "'Email'" },
        { name: 'value', kind: 'bind', value: 'email' },
      ]),
    )
  })

  it('validates model props require bind- at the parent', () => {
    const contract = parseContractBody(`
props: {
  label: { type: 'string', required: true }
  value: { type: 'string', model: true }
}
`)
    const bad = parseTemplate(`<Field :label={'Email'} :value={email} />`).children[0]
    const good = parseTemplate(`<Field :label={'Email'} bind-value={email} />`).children[0]
    expect(bad?.type).toBe('component')
    expect(good?.type).toBe('component')
    if (bad?.type !== 'component' || good?.type !== 'component') return

    const badIssues = validateContractUsage(bad, contract)
    expect(badIssues.map((i) => i.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('is model — use bind-value'),
      ]),
    )

    expect(validateContractUsage(good, contract)).toEqual([])
  })

  it('rejects bind- on non-model props and bad static types', () => {
    const contract = parseContractBody(`
props: {
  label: { type: 'string', required: true }
  open: { type: 'boolean', default: false }
  meta: { type: 'object' }
}
`)
    const node = parseTemplate(`<Field bind-label={x} open="yes" meta="{}" />`).children[0]
    expect(node?.type).toBe('component')
    if (node?.type !== 'component') return

    const messages = validateContractUsage(node, contract).map((i) => i.message)
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('is not model — use :label'),
        expect.stringContaining('expects boolean static value'),
        expect.stringContaining('expects an object'),
      ]),
    )
    expect(messages.some((m) => m.includes('missing required'))).toBe(false)
  })

  it('passes model prop through parent mount props object', () => {
    const source = `import Field from './Field.jcr'
import { pulse } from '@jacare/core'
const email = pulse('')
export <view>
  <Field :label=\${'Email'} bind-value=\${email} />
</view>`
    const result = compile(source, { filename: 'Parent.jcr' })
    expect(result.code).toContain('value: email')
    expect(result.code).toContain("label: 'Email'")
  })

  it('child model prop uses bindModel; one-way prop uses bindPropText', () => {
    const source = `export <contract>
  props: {
    label: { type: 'string', required: true }
    value: { type: 'string', model: true }
  }
</contract>

export <view>
  <label>\${label}</label>
  <input bind-value=\${value} />
</view>`
    const result = compile(source, { filename: 'Field.jcr' })
    expect(result.code).toContain('bindPropText(')
    expect(result.code).toContain('bindModel(')
    expect(result.code).toContain('props["label"]')
    expect(result.code).toContain('props["value"]')
  })
})
