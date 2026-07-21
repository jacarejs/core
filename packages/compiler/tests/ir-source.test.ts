import { describe, expect, it } from 'vitest'
import { lowerBindingSource, bindingSignalName, isLocalSignalSource } from '../src/ir/source.js'

describe('lowerBindingSource (Fatia 0)', () => {
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
    const expr = lowerBindingSource('a + b', { signals })
    expect(bindingSignalName(expr)).toBeNull()
    expect(isLocalSignalSource(expr)).toBe(false)
  })
})
