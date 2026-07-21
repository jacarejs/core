import { describe, expect, it } from 'vitest'
import {
  capturesLocal,
  collectIdents,
  lintRedundantArrows,
  unwrapNullaryArrow,
} from '../src/lint-template-expr.js'
import { parseTemplate } from '../src/parse-template.js'

describe('lintRedundantArrows', () => {
  it('unwraps nullary expression arrows', () => {
    expect(unwrapNullaryArrow('() => cart.count()')).toBe('cart.count()')
    expect(unwrapNullaryArrow('() => !!field.error()')).toBe('!!field.error()')
    expect(unwrapNullaryArrow('(e) => submit(e)')).toBeNull()
    expect(unwrapNullaryArrow('() => { return x }')).toBeNull()
    expect(unwrapNullaryArrow('cart.count()')).toBeNull()
  })

  it('detects free locals in arrow bodies', () => {
    expect(capturesLocal('line.qty * price()', new Set(['line']))).toBe(true)
    expect(capturesLocal('cart.count()', new Set(['line']))).toBe(false)
    expect(collectIdents("t('x', { n: item.n })")).toEqual(
      expect.arrayContaining(['t', 'item', 'n']),
    )
  })

  it('warns on redundant text / class / attr arrows', () => {
    const ast = parseTemplate(`
<p>{() => cart.count()}</p>
<button class-on={() => open()} disabled={() => !ready()}>{label}</button>
`)
    const warnings = lintRedundantArrows(ast)
    expect(warnings.length).toBeGreaterThanOrEqual(3)
    expect(warnings.every((w) => w.code === 'redundant-arrow')).toBe(true)
    expect(warnings.some((w) => w.preferred.includes('${cart.count()}'))).toBe(true)
    expect(warnings.some((w) => w.preferred.includes('class-on=${open()}'))).toBe(true)
    expect(warnings.some((w) => w.preferred.includes('disabled=${!ready()}'))).toBe(true)
  })

  it('skips arrows that capture #for locals', () => {
    const ast = parseTemplate(`
#for items() as item (item.id)
  <span>{() => fmt(item.id)}</span>
  <button class-active={() => selected() === item.id} on-click={() => pick(item.id)}>
    {item.label}
  </button>
#end
`)
    const warnings = lintRedundantArrows(ast)
    expect(warnings).toEqual([])
  })

  it('skips event handlers and mixed text', () => {
    const ast = parseTemplate(`
<button on-click={() => bump()}>x</button>
<p>Total: {() => cart.total()}</p>
`)
    expect(lintRedundantArrows(ast)).toEqual([])
  })

  it('warns on component one-way props without locals', () => {
    const ast = parseTemplate(`<Card :title={() => t('home')} />`)
    const warnings = lintRedundantArrows(ast)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]!.preferred).toContain(":title=${t('home')}")
  })
})
