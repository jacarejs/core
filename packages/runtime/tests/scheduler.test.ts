import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  batch,
  disablePatience,
  effect,
  enablePatience,
  flushSync,
  isPatienceEnabled,
  signal,
} from '../src/index.js'

afterEach(() => {
  disablePatience()
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
})
