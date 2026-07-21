import { describe, expect, it } from 'vitest'
import { collectProvidedProps, validateContractUsage } from '../src/validate-contract.js'
import { inspectTemplateBindings } from '../src/ir/inspect.js'
import { parseContractBody } from '../src/parse-contract.js'
import { parseTemplate } from '../src/parse-template.js'

describe('IR consumers', () => {
  it('collectProvidedProps reads component IR (incl. lazy)', () => {
    const node = parseTemplate(
      `<Field title="Hi" :label={t('x')} bind-value={email} />`,
    ).children[0]!
    expect(node.type).toBe('component')
    if (node.type !== 'component') return
    const provided = collectProvidedProps(node)
    expect(provided).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'title', mode: 'static', value: 'Hi' }),
        expect.objectContaining({
          name: 'label',
          mode: 'one-way',
          value: "t('x')",
          lazy: true,
        }),
        expect.objectContaining({ name: 'value', mode: 'model', value: 'email' }),
      ]),
    )
  })

  it('validateContractUsage stays green via IR props', () => {
    const contract = parseContractBody(`
props: {
  label: { type: 'string', required: true }
  value: { type: 'string', model: true }
}
`)
    const good = parseTemplate(`<Field :label={'Email'} bind-value={email} />`).children[0]!
    expect(good.type).toBe('component')
    if (good.type !== 'component') return
    expect(validateContractUsage(good, contract)).toEqual([])
  })

  it('inspectTemplateBindings summarizes sites from IR', () => {
    const ast = parseTemplate(`
#if show()
  <button class-on={open} on-click={inc}>\${count}</button>
  <Card :title={t('home')}>
    <p>hi</p>
  </Card>
#end
#for items() as item (item.id)
  <li>\${item.label}</li>
#end
`)
    const sites = inspectTemplateBindings(ast, {
      signals: new Set(['show', 'open', 'count', 'items']),
    })
    expect(sites.some((s) => s.kind === 'if' && s.label === 'show()')).toBe(true)
    expect(sites.some((s) => s.kind === 'class' && s.label === 'on')).toBe(true)
    expect(sites.some((s) => s.kind === 'text')).toBe(true)
    expect(
      sites.some((s) => s.kind === 'component' && s.label === 'Card.title' && s.lazy),
    ).toBe(true)
    expect(sites.some((s) => s.kind === 'list' && s.label === 'items()')).toBe(true)
  })
})
