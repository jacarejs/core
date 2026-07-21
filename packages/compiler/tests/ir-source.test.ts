import { describe, expect, it } from 'vitest'
import { lowerBindingSource, bindingSignalName, isLocalSignalSource } from '../src/ir/source.js'

describe('lowerBindingSource', () => {
  const signals = new Set(['count', 'open'])
  const importedNames = new Set(['locale', 't'])
  const componentProps = new Set(['title', 'label'])

  it('classifies local signal call and bare ref', () => {
    expect(lowerBindingSource('count()', { signals })).toEqual({
      kind: 'signal',
      name: 'count',
      local: true,
    })
    expect(lowerBindingSource('count', { signals })).toEqual({
      kind: 'signal',
      name: 'count',
      local: true,
    })
  })

  it('classifies imported pulse', () => {
    expect(lowerBindingSource('locale()', { signals, importedNames })).toEqual({
      kind: 'signal',
      name: 'locale',
      local: false,
    })
    expect(lowerBindingSource('locale', { signals, importedNames })).toEqual({
      kind: 'signal',
      name: 'locale',
      local: false,
    })
  })

  it('classifies imported bag members as Mesh Port', () => {
    const bags = new Set(['cart', 'demoCart'])
    expect(lowerBindingSource('cart.count()', { importedNames: bags })).toEqual({
      kind: 'mesh',
      bag: 'cart',
      key: 'count',
    })
    expect(lowerBindingSource('cart.count', { importedNames: bags })).toEqual({
      kind: 'mesh',
      bag: 'cart',
      key: 'count',
    })
    expect(lowerBindingSource('demoCart.money()', { importedNames: bags })).toEqual({
      kind: 'mesh',
      bag: 'demoCart',
      key: 'money',
    })
    expect(lowerBindingSource('other.total()', { importedNames: bags }).kind).toBe('expr')
  })

  it('classifies @bag/key address sugar as Mesh Port', () => {
    expect(lowerBindingSource('@cart/total')).toEqual({
      kind: 'mesh',
      bag: 'cart',
      key: 'total',
      address: true,
    })
    expect(lowerBindingSource('@lab-cart/count()')).toEqual({
      kind: 'mesh',
      bag: 'lab-cart',
      key: 'count',
      address: true,
    })
    expect(bindingSignalName(lowerBindingSource('@cart/total')!)).toBe(
      'getBag("cart")?.total',
    )
  })

  it('desugars @bag/key inside larger expressions', () => {
    const src = lowerBindingSource('@cart/total() + 1')
    expect(src).toEqual({
      kind: 'expr',
      code: 'getBag("cart")?.total() + 1',
      arrow: false,
    })
  })

  it('does not treat local.signal as mesh', () => {
    expect(
      lowerBindingSource('count.nested()', {
        signals: new Set(['count']),
        importedNames: new Set(['count']),
      }).kind,
    ).toBe('expr')
  })

  it('classifies component prop when preferProp', () => {
    expect(
      lowerBindingSource('title', { signals, componentProps }, { preferProp: true }),
    ).toEqual({ kind: 'prop', name: 'title' })
  })

  it('prefers signal over prop by default', () => {
    const both = new Set(['title'])
    expect(
      lowerBindingSource('title', {
        signals: both,
        componentProps: both,
      }),
    ).toEqual({ kind: 'signal', name: 'title', local: true })
  })

  it('classifies calls and arrows as expr', () => {
    expect(lowerBindingSource("t('home.lead')", { signals, importedNames })).toEqual({
      kind: 'expr',
      code: "t('home.lead')",
      arrow: false,
    })
    expect(lowerBindingSource('() => count()', { signals })).toEqual({
      kind: 'expr',
      code: '() => count()',
      arrow: true,
    })
  })

  it('exposes helpers', () => {
    const local = lowerBindingSource('open()', { signals })
    expect(bindingSignalName(local)).toBe('open')
    expect(isLocalSignalSource(local)).toBe(true)
    const mesh = lowerBindingSource('cart.total()', { importedNames: new Set(['cart']) })
    expect(bindingSignalName(mesh)).toBe('cart.total')
    expect(isLocalSignalSource(mesh)).toBe(false)
    const expr = lowerBindingSource('a + b', { signals })
    expect(bindingSignalName(expr)).toBeNull()
    expect(isLocalSignalSource(expr)).toBe(false)
  })
})
