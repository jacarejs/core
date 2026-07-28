import { describe, expect, it } from 'vitest'
import { rewriteSignalsInExpr } from '../src/codegen-shared.js'

const signals = new Set(['count', 'label'])

describe('rewriteSignalsInExpr', () => {
  it('rewrites bare signal reads', () => {
    expect(rewriteSignalsInExpr('count + 1', signals)).toBe('count() + 1')
  })

  it('skips signal names inside single-quoted strings', () => {
    expect(rewriteSignalsInExpr("count + ' count'", signals)).toBe("count() + ' count'")
  })

  it('skips signal names inside double-quoted strings', () => {
    expect(rewriteSignalsInExpr('count + " count"', signals)).toBe('count() + " count"')
  })

  it('skips signal names inside template literal static parts', () => {
    expect(rewriteSignalsInExpr('count + ` count`', signals)).toBe('count() + ` count`')
  })

  it('rewrites interpolations inside nested templates', () => {
    expect(rewriteSignalsInExpr('`n=${count}`', signals)).toBe('`n=${count()}`')
  })

  it('expands object shorthand outside strings', () => {
    expect(rewriteSignalsInExpr('{ count, label }', signals)).toBe(
      '{ count: count(), label: label() }',
    )
  })

  it('skips already-called and property access', () => {
    expect(rewriteSignalsInExpr('count() + obj.count', signals)).toBe('count() + obj.count')
  })

  it('skips names inside line comments', () => {
    expect(rewriteSignalsInExpr('count // count here', signals)).toBe('count() // count here')
  })

  it('rewrites ternary consequent and alternate signals', () => {
    const names = new Set(['flag', 'on', 'off'])
    expect(rewriteSignalsInExpr('flag ? on : off', names)).toBe('flag() ? on() : off()')
  })

  it('still skips object keys followed by colon', () => {
    expect(rewriteSignalsInExpr('{ count: label }', signals)).toBe('{ count: label() }')
  })
})
