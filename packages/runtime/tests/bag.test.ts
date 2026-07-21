import { afterEach, describe, expect, it, vi } from 'vitest'
import { resetDevtoolsForTests } from '../src/devtools/registry.js'
import {
  createBag,
  derive,
  effect,
  enableDevtools,
  getMeshSnapshot,
  getBag,
  listBags,
  pulse,
  registerBinding,
  resetBagRegistry,
  ripple,
  subscribeMesh,
} from '../src/index.js'

afterEach(() => {
  resetBagRegistry()
  resetDevtoolsForTests()
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

describe('mesh snapshot', () => {
  it('lists unpublished bags until first access', () => {
    createBag('cart', () => {
      const count = pulse(0)
      return { count, add() {} }
    })

    const snap = getMeshSnapshot()
    expect(snap.bags).toHaveLength(1)
    expect(snap.bags[0]).toMatchObject({
      id: 'cart',
      published: false,
      cells: [],
      ports: [],
    })
  })

  it('publishes cell addresses and intent ports', () => {
    enableDevtools()
    const cart = createBag('cart', () => {
      const items = pulse([{ id: 1, qty: 1 }])
      const count = derive(() => items().reduce((n, line) => n + line.qty, 0))
      function add() {
        ripple(() => items.update((list) => [...list, { id: 2, qty: 1 }]))
      }
      return { items, count, add }
    })

    void cart.count
    const el = document.createElement('span')
    document.body.appendChild(el)
    registerBinding(cart.count, el, { kind: 'text', file: 'Badge.jcr', line: 4 })

    const bag = getMeshSnapshot().bags[0]!
    expect(bag.published).toBe(true)
    expect(bag.cells.map((c) => c.address).sort()).toEqual(['@cart/count', '@cart/items'])
    expect(bag.cells.find((c) => c.key === 'count')).toMatchObject({
      kind: 'derive',
      value: 1,
      bindings: 1,
      boundFrom: ['Badge.jcr'],
    })
    expect(bag.ports).toEqual([
      { address: '@cart/add', bagId: 'cart', key: 'add', kind: 'intent' },
    ])
    el.remove()
  })

  it('records last ripple addresses for DevTools flash', () => {
    const bag = createBag('wave', () => {
      const a = pulse(0)
      const b = pulse(0)
      return { a, b }
    })
    void bag.a

    ripple(() => {
      bag.a.set(1)
      bag.b.set(2)
    })

    const { lastRipple } = getMeshSnapshot()
    expect(lastRipple?.bagIds).toEqual(['wave'])
    expect(lastRipple?.addresses.sort()).toEqual(['@wave/a', '@wave/b'])
  })

  it('notifies mesh subscribers on publish and ripple', () => {
    const seen: number[] = []
    const stop = subscribeMesh(() => {
      seen.push(getMeshSnapshot().bags.length)
    })

    createBag('notify', () => ({ n: pulse(0) }))
    expect(seen.at(-1)).toBe(1)

    const bag = getBag<{ n: { set(v: number): void } }>('notify')!
    ripple(() => bag.n.set(3))
    expect(seen.length).toBeGreaterThanOrEqual(2)
    stop()
  })
})
