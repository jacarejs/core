import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  batch,
  createBag,
  disablePatience,
  effect,
  enablePatience,
  flushSync,
  isPatienceEnabled,
  resetBagRegistry,
  ripple,
  runAsLane,
  signal,
} from '../src/index.js'

afterEach(() => {
  disablePatience()
  resetBagRegistry()
  vi.useRealTimers()
})

describe('patience scheduler (Etapa 1)', () => {
  it('stays sync by default', () => {
    expect(isPatienceEnabled()).toBe(false)
    const count = signal(0)
    const spy = vi.fn()
    effect(() => {
      count()
      spy()
    })
    spy.mockClear()
    count.set(1)
    count.set(2)
    count.set(3)
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('coalesces burst writes into one microtask flush', async () => {
    enablePatience()
    const count = signal(0)
    const spy = vi.fn()
    effect(() => {
      spy(count())
    })
    spy.mockClear()

    count.set(1)
    count.set(2)
    count.set(3)
    expect(spy).not.toHaveBeenCalled()

    await Promise.resolve()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(3)
  })

  it('flushSync drains pending immediately', () => {
    enablePatience()
    const count = signal(0)
    let seen = 0
    effect(() => {
      seen = count()
    })

    count.set(7)
    expect(seen).toBe(0)
    flushSync()
    expect(seen).toBe(7)
  })

  it('batch still flushes synchronously with patience on', () => {
    enablePatience()
    const a = signal(0)
    const b = signal(0)
    const spy = vi.fn()
    effect(() => {
      spy(a() + b())
    })
    spy.mockClear()

    batch(() => {
      a.set(1)
      b.set(2)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(3)
  })

  it('ripple still flushes synchronously with patience on', () => {
    enablePatience()
    const bag = createBag('sched-cart', () => ({ n: signal(0) }))
    const spy = vi.fn()
    effect(() => {
      spy(bag.n())
    })
    spy.mockClear()

    ripple(() => {
      bag.n.set(1)
      bag.n.set(2)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('disablePatience flushes and restores sync', () => {
    enablePatience()
    const count = signal(0)
    let seen = 0
    effect(() => {
      seen = count()
    })

    count.set(4)
    expect(seen).toBe(0)
    disablePatience()
    expect(seen).toBe(4)
    expect(isPatienceEnabled()).toBe(false)

    count.set(5)
    expect(seen).toBe(5)
  })

  it('flushSync is a no-op when the queue is empty', () => {
    expect(() => flushSync()).not.toThrow()
    enablePatience()
    expect(() => flushSync()).not.toThrow()
  })

  it('nested writes during flush run in the same turn', () => {
    enablePatience()
    const a = signal(0)
    const b = signal(0)
    const log = []
    effect(() => {
      log.push(['a', a()])
      if (a() === 1) b.set(9)
    })
    effect(() => {
      log.push(['b', b()])
    })
    log.length = 0

    a.set(1)
    expect(log).toEqual([])
    flushSync()
    expect(log).toEqual([
      ['a', 1],
      ['b', 9],
    ])
  })
})

describe('patience lanes (Etapa 2)', () => {
  it('flushes input before default in the same microtask', async () => {
    enablePatience()
    const input = signal(0)
    const derived = signal(0)
    const order = []

    effect(() => {
      order.push(['default', derived()])
    })
    effect(() => {
      order.push(['input', input()])
    })
    order.length = 0

    runAsLane('input', () => input.set(1))
    derived.set(2)

    expect(order).toEqual([])
    await Promise.resolve()
    expect(order).toEqual([
      ['input', 1],
      ['default', 2],
    ])
  })

  it('defers idle work after input/default', async () => {
    vi.stubGlobal('requestIdleCallback', undefined)
    vi.useFakeTimers()
    enablePatience()
    const urgent = signal(0)
    const background = signal(0)
    const order = []

    effect(() => {
      order.push(['urgent', urgent()])
    })
    effect(() => {
      order.push(['idle', background()])
    })
    order.length = 0

    urgent.set(1)
    runAsLane('idle', () => background.set(9))

    expect(order).toEqual([])
    await Promise.resolve()
    expect(order).toEqual([['urgent', 1]])

    await vi.advanceTimersByTimeAsync(5)
    expect(order).toEqual([
      ['urgent', 1],
      ['idle', 9],
    ])
  })

  it('flushSync drains idle immediately', () => {
    enablePatience()
    const background = signal(0)
    let seen = 0
    effect(() => {
      seen = background()
    })

    runAsLane('idle', () => background.set(3))
    expect(seen).toBe(0)
    flushSync()
    expect(seen).toBe(3)
  })

  it('promotes a subscriber from idle to input', async () => {
    enablePatience()
    const value = signal(0)
    const spy = vi.fn()
    effect(() => {
      spy(value())
    })
    spy.mockClear()

    runAsLane('idle', () => value.set(1))
    runAsLane('input', () => value.set(2))

    await Promise.resolve()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(2)
  })
})
