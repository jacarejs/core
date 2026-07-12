import { describe, expect, it, vi } from 'vitest'
import { batch, computed, effect, signal, untrack } from '../src/index.js'

describe('signal', () => {
  it('reads and writes values', () => {
    const count = signal(0)
    expect(count()).toBe(0)
    count.set(5)
    expect(count()).toBe(5)
    count.update((n) => n + 1)
    expect(count()).toBe(6)
  })

  it('skips notification on equal values', () => {
    const count = signal(1)
    const spy = vi.fn()
    effect(() => {
      count()
      spy()
    })
    spy.mockClear()
    count.set(1)
    expect(spy).not.toHaveBeenCalled()
  })

  it('peek does not track dependencies', () => {
    const count = signal(0)
    const spy = vi.fn()
    effect(() => {
      count.peek
      spy()
    })
    spy.mockClear()
    count.set(1)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('computed', () => {
  it('derives values from signals', () => {
    const a = signal(2)
    const b = signal(3)
    const sum = computed(() => a() + b())
    expect(sum()).toBe(5)
    a.set(10)
    expect(sum()).toBe(13)
  })

  it('memoizes until dependencies change', () => {
    const spy = vi.fn()
    const a = signal(1)
    const doubled = computed(() => {
      spy()
      return a() * 2
    })
    expect(doubled()).toBe(2)
    expect(doubled()).toBe(2)
    expect(spy).toHaveBeenCalledTimes(1)
    a.set(2)
    expect(doubled()).toBe(4)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})

describe('effect', () => {
  it('re-runs when dependencies change', () => {
    const count = signal(0)
    const spy = vi.fn()
    effect(() => {
      count()
      spy()
    })
    expect(spy).toHaveBeenCalledTimes(1)
    count.set(1)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('disposes cleanly', () => {
    const count = signal(0)
    const spy = vi.fn()
    const e = effect(() => {
      count()
      spy()
    })
    spy.mockClear()
    e.dispose()
    count.set(1)
    expect(spy).not.toHaveBeenCalled()
  })

  it('runs user cleanup before re-run', () => {
    const count = signal(0)
    const cleanup = vi.fn()
    effect(() => {
      count()
      return cleanup
    })
    cleanup.mockClear()
    count.set(1)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})

describe('batch', () => {
  it('coalesces multiple updates into one effect run', () => {
    const a = signal(0)
    const b = signal(0)
    const spy = vi.fn()
    effect(() => {
      a()
      b()
      spy()
    })
    spy.mockClear()
    batch(() => {
      a.set(1)
      b.set(1)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(a()).toBe(1)
    expect(b()).toBe(1)
  })
})

describe('untrack', () => {
  it('reads without subscribing', () => {
    const a = signal(0)
    const b = signal(0)
    const spy = vi.fn()
    effect(() => {
      untrack(() => a())
      b()
      spy()
    })
    spy.mockClear()
    a.set(1)
    expect(spy).not.toHaveBeenCalled()
    b.set(1)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
