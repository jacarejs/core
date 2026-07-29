import { describe, expect, it } from 'vitest'
import { mergePublishedBags, scanBagPublishSites, scanPublishedBags } from '../src/scan-bags.js'
import {
  findMeshAddressAt,
  meshAddressResolveExpr,
  offsetToLineCharacter,
} from '../src/mesh-address.js'

describe('scanPublishedBags', () => {
  it('extracts bag id and return keys from createBag', () => {
    const source = `
import { createBag, pulse, derive } from '@jacare/core'
export const cart = createBag('cart', () => {
  const items = pulse([])
  const count = derive(() => items().length)
  function add() {}
  return { items, count, add }
})
`
    const bags = scanPublishedBags(source)
    expect([...bags.get('cart')!].sort()).toEqual(['add', 'count', 'items'])
  })

  it('merges multiple sources', () => {
    const a = scanPublishedBags(`createBag('cart', () => ({ count: 1 }))`)
    const b = scanPublishedBags(`createBag('session', () => { return { user, token } })`)
    const merged = mergePublishedBags(a, b)
    expect(merged.has('cart')).toBe(true)
    expect(merged.get('session')?.has('user')).toBe(true)
  })
})

describe('scanBagPublishSites', () => {
  it('records createBag index and keys', () => {
    const source = `export const cart = createBag('cart', () => {
  return { items, count, add }
})`
    const sites = scanBagPublishSites(source)
    expect(sites).toHaveLength(1)
    expect(sites[0]!.id).toBe('cart')
    expect(sites[0]!.keys.sort()).toEqual(['add', 'count', 'items'])
    expect(source.slice(sites[0]!.index, sites[0]!.index + 9)).toBe('createBag')
  })
})

describe('findMeshAddressAt', () => {
  it('finds address under cursor', () => {
    const text = 'cart · ${@lab-mesh30/count} in cart'
    const at = text.indexOf('@lab')
    const hit = findMeshAddressAt(text, at + 5)
    expect(hit).toEqual({
      bag: 'lab-mesh30',
      key: 'count',
      start: at,
      end: at + '@lab-mesh30/count'.length,
    })
  })

  it('returns null outside an address', () => {
    expect(findMeshAddressAt('no mesh here', 3)).toBeNull()
  })
})

describe('meshAddressResolveExpr', () => {
  it('resolves bag and route sugar', () => {
    expect(meshAddressResolveExpr('cart', 'count')).toBe('getBag("cart")?.count')
    expect(meshAddressResolveExpr('route', 'id')).toBe('getRouteParam("id")')
  })
})

describe('offsetToLineCharacter', () => {
  it('maps offset to 0-based line/character', () => {
    const source = 'a\nbc\nd'
    expect(offsetToLineCharacter(source, 0)).toEqual({ line: 0, character: 0 })
    expect(offsetToLineCharacter(source, 2)).toEqual({ line: 1, character: 0 })
    expect(offsetToLineCharacter(source, 4)).toEqual({ line: 1, character: 2 })
  })
})
