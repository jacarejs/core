import { describe, expect, it } from 'vitest'
import { addressAtOffset } from '../src/mesh/address-at.js'
import { buildBagIndexFromSources } from '../src/mesh/bag-index.js'
import { formatMeshHoverMarkdown } from '../src/mesh/markdown.js'

describe('addressAtOffset', () => {
  it('resolves bag and route addresses', () => {
    const text = '${@lab-cart/count} and ${@route/id}'
    const bag = addressAtOffset(text, text.indexOf('@lab') + 2)!
    expect(bag.bag).toBe('lab-cart')
    expect(bag.key).toBe('count')
    expect(bag.resolveExpr).toBe('getBag("lab-cart")?.count')
    expect(bag.isRoute).toBe(false)

    const route = addressAtOffset(text, text.indexOf('@route') + 1)!
    expect(route.isRoute).toBe(true)
    expect(route.resolveExpr).toBe('getRouteParam("id")')
  })
})

describe('buildBagIndexFromSources', () => {
  it('indexes createBag sites for go-to-def', () => {
    const source = `export const cart = createBag('lab-cart', () => {
  return { count, add }
})`
    const index = buildBagIndexFromSources([{ file: '/app/bags/cart.js', source }])
    const entry = index.get('lab-cart')!
    expect([...entry.keys].sort()).toEqual(['add', 'count'])
    expect(entry.sites[0]!.file).toBe('/app/bags/cart.js')
    expect(entry.sites[0]!.line).toBe(0)
    expect(source.split('\n')[0]!.slice(entry.sites[0]!.character)).toMatch(/^createBag/)
  })
})

describe('formatMeshHoverMarkdown', () => {
  it('shows published bag details', () => {
    const md = formatMeshHoverMarkdown({
      bag: 'lab-cart',
      key: 'count',
      resolveExpr: 'getBag("lab-cart")?.count',
      isRoute: false,
      entry: {
        id: 'lab-cart',
        keys: new Set(['count', 'add']),
        sites: [{ file: '/app/bags/cart.js', line: 2, character: 10, keys: ['count', 'add'] }],
      },
      relativePath: 'bags/cart.js',
    })
    expect(md).toContain('**Mesh Port** `@lab-cart/count`')
    expect(md).toContain('getBag("lab-cart")?.count')
    expect(md).toContain('bags/cart.js:3')
    expect(md).toContain('`add`')
  })

  it('warns when bag is missing', () => {
    const md = formatMeshHoverMarkdown({
      bag: 'missing',
      key: 'x',
      resolveExpr: 'getBag("missing")?.x',
      isRoute: false,
      entry: undefined,
    })
    expect(md).toContain('no `createBag')
  })

  it('describes route sugar', () => {
    const md = formatMeshHoverMarkdown({
      bag: 'route',
      key: 'slug',
      resolveExpr: 'getRouteParam("slug")',
      isRoute: true,
      entry: undefined,
    })
    expect(md).toContain('**Route param**')
    expect(md).toContain('reserved')
  })
})
