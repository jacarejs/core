import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  batch,
  computed,
  effect,
  enableDevtools,
  ReactiveCycleError,
  signal,
  untrack,
} from '../src/index.js'
import { resetDevtoolsForTests } from '../src/devtools/registry.js'
import { DependencyCell } from '../src/context.js'

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

  it('unsubscribes after a throw so the next set does not re-explode', () => {
    const count = signal(0)
    const runs = vi.fn()
    expect(() =>
      effect(() => {
        count()
        runs()
        throw new Error('boom')
      }),
    ).toThrow('boom')
    expect(runs).toHaveBeenCalledTimes(1)
    expect(() => count.set(1)).not.toThrow()
    expect(runs).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes after a throw on a later run', () => {
    const count = signal(0)
    const runs = vi.fn()
    effect(() => {
      const value = count()
      runs()
      if (value > 0) throw new Error('later boom')
    })
    expect(runs).toHaveBeenCalledTimes(1)
    expect(() => count.set(1)).toThrow('later boom')
    expect(runs).toHaveBeenCalledTimes(2)
    expect(() => count.set(2)).not.toThrow()
    expect(runs).toHaveBeenCalledTimes(2)
  })

  it('calls onError and stops tracking instead of rethrowing', () => {
    const count = signal(0)
    const onError = vi.fn()
    const runs = vi.fn()
    effect(
      () => {
        count()
        runs()
        throw new Error('handled')
      },
      { onError },
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0]).toMatchObject({ message: 'handled' })
    expect(runs).toHaveBeenCalledTimes(1)
    count.set(1)
    expect(runs).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('does not run a deferred effect after disposal', async () => {
    const count = signal(0)
    const runs = vi.fn()
    const handle = effect(
      () => {
        count()
        runs()
      },
      { defer: true },
    )
    handle.dispose()
    await Promise.resolve()
    count.set(1)
    expect(runs).not.toHaveBeenCalled()
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

describe('reactive cycles', () => {
  afterEach(() => {
    resetDevtoolsForTests()
  })

  const runPingPongCycle = (wrap: (fn: () => void) => void = (fn) => fn()): void => {
    const a = signal(0)
    const b = signal(0)
    effect(() => {
      a()
      b.set(b() + 1)
    })
    effect(() => {
      b()
      a.set(a() + 1)
    })
    wrap(() => a.set(1))
  }

  it('throws a named error instead of overflowing the stack', () => {
    let caught: unknown
    try {
      runPingPongCycle()
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(ReactiveCycleError)
    expect(caught).not.toBeInstanceOf(RangeError)
    expect((caught as Error).message).toMatch(/reactive cycle detected/)
  })

  it('attaches WhyChain when DevTools are enabled', () => {
    enableDevtools()
    let caught: ReactiveCycleError | undefined
    try {
      runPingPongCycle()
    } catch (error) {
      caught = error as ReactiveCycleError
    }
    expect(caught).toBeInstanceOf(ReactiveCycleError)
    expect(caught?.why).toBeDefined()
    expect(caught?.whyText).toMatch(/why /)
    expect(caught?.message).toMatch(/why:/)
  })

  it('throws a named error for cycles inside batch', () => {
    expect(() => runPingPongCycle(batch)).toThrow(ReactiveCycleError)
  })

  it('keeps reacting after a cycle error', () => {
    const other = signal(0)
    const spy = vi.fn()
    effect(() => {
      other()
      spy()
    })
    spy.mockClear()

    expect(() => runPingPongCycle()).toThrow(ReactiveCycleError)

    other.set(1)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('allows self-writes that settle', () => {
    const limit = 3
    const count = signal(0)
    effect(() => {
      if (count() < limit) count.set(count() + 1)
    })
    expect(count()).toBe(limit)
  })

  it('allows deep cascades below the guard depth', () => {
    const chainLength = 50
    const cells = Array.from({ length: chainLength }, () => signal(0))
    for (let i = 0; i < chainLength - 1; i++) {
      const from = cells[i]!
      const to = cells[i + 1]!
      effect(() => {
        to.set(from())
      })
    }

    cells[0]!.set(1)
    expect(cells[chainLength - 1]!()).toBe(1)
  })
})

describe('DependencyCell', () => {
  it('deduplicates subscribers with O(1) membership checks', () => {
    const cell = new DependencyCell()
    const spy = vi.fn()
    const run = (): void => {
      spy()
    }

    cell.subscribe(run)
    expect(cell.has(run)).toBe(true)
    expect(cell.subscriberCount).toBe(1)

    cell.notify()
    expect(spy).toHaveBeenCalledTimes(1)
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
