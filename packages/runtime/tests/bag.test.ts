import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createBag,
  derive,
  effect,
  getBag,
  listBags,
  pulse,
  resetBagRegistry,
  ripple,
} from '../src/index.js'

afterEach(() => {
  resetBagRegistry()
})

describe('createBag', () => {
  it('publishes a shared bag accessible from getBag', () => {
    const cart = createBag('cart', () => {
      const count = pulse(0)
      function bump() {
        count.update((n) => n + 1)
      }
      return { count, bump }
    })

    expect(cart.id).toBe('cart')
    expect(getBag('cart')).toBe(cart)
    expect(listBags()).toContain('cart')

    cart.bump()
    expect(cart.count()).toBe(1)
    expect(getBag<{ count: () => number }>('cart')!.count()).toBe(1)
  })

  it('lazily runs the factory on first property access', () => {
    const factory = vi.fn(() => {
      const n = pulse(1)
      return { n }
    })
    const bag = createBag('lazy', factory)
    expect(factory).not.toHaveBeenCalled()
    expect(bag.n()).toBe(1)
    expect(factory).toHaveBeenCalledTimes(1)
    expect(bag.n()).toBe(1)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('rejects duplicate bag ids', () => {
    createBag('dup', () => ({ x: pulse(0) }))
    expect(() => createBag('dup', () => ({ x: pulse(1) }))).toThrow(/already registered/)
  })

  it('coalesces ripple writes into one effect wave', () => {
    const bag = createBag('wave', () => {
      const a = pulse(0)
      const b = pulse(0)
      const sum = derive(() => a() + b())
      return { a, b, sum }
    })

    const seen: number[] = []
    effect(() => {
      seen.push(bag.sum())
    })
    expect(seen).toEqual([0])

    ripple(() => {
      bag.a.set(2)
      bag.b.set(3)
    })
    expect(seen).toEqual([0, 5])
  })

  it('snaps and hydrates writable pulses', () => {
    const bag = createBag('prefs', () => {
      const theme = pulse('forest')
      const label = derive(() => `theme:${theme()}`)
      return { theme, label }
    })

    bag.theme.set('night')
    expect(bag.snap()).toEqual({ theme: 'night' })

    bag.hydrate({ theme: 'lime' })
    expect(bag.theme()).toBe('lime')
    expect(bag.label()).toBe('theme:lime')
  })

  it('reset rebuilds cells on next access', () => {
    const bag = createBag('session', () => {
      const user = pulse('guest')
      return { user }
    })
    bag.user.set('heber')
    bag.reset()
    expect(bag.user()).toBe('guest')
  })
})
