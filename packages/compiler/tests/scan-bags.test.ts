import { describe, expect, it } from 'vitest'
import { mergePublishedBags, scanPublishedBags } from '../src/scan-bags.js'

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
