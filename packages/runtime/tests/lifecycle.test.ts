import { describe, expect, it, vi } from 'vitest'
import { createLifecycle, runScreenLifecycle } from '../src/lifecycle.js'

describe('lifecycle', () => {
  it('runs activate and mount cleanups', () => {
    const onDeactivate = vi.fn()
    const onUnmount = vi.fn()
    const hooks = createLifecycle({
      onActivate: () => () => onDeactivate(),
      onMount: () => () => onUnmount(),
    })

    const activateCleanup = runScreenLifecycle(hooks, 'activate', {
      path: '/about',
      params: {},
      search: {},
    })
    const mountCleanup = runScreenLifecycle(hooks, 'mount')

    expect(typeof activateCleanup).toBe('function')
    expect(typeof mountCleanup).toBe('function')

    activateCleanup?.()
    mountCleanup?.()
    runScreenLifecycle(hooks, 'deactivate')
    runScreenLifecycle(hooks, 'unmount')

    expect(onDeactivate).toHaveBeenCalledTimes(1)
    expect(onUnmount).toHaveBeenCalledTimes(1)
  })
})
