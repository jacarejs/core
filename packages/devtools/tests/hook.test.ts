import { afterEach, describe, expect, it } from 'vitest'
import { enableDevtools } from '@jacare/core'
import { resetDevtoolsForTests } from '../../runtime/src/devtools/registry.js'
import { installPageHook } from '../src/hook.js'

describe('installPageHook', () => {
  afterEach(() => {
    resetDevtoolsForTests()
  })

  it('installs $why / $why.last and cleans up on dispose', () => {
    enableDevtools()
    const dispose = installPageHook({ coreVersion: 'test' })
    const g = globalThis as typeof globalThis & {
      $why?: ((target: unknown) => unknown) & { last: () => unknown }
      __JACARE__?: Record<string, unknown>
    }

    expect(typeof g.$why).toBe('function')
    expect(typeof g.$why?.last).toBe('function')
    expect(typeof g.__JACARE__?.why).toBe('function')
    expect(typeof g.__JACARE__?.whyLast).toBe('function')
    expect(typeof g.__JACARE__?.formatWhyChain).toBe('function')

    dispose()
    expect(g.$why).toBeUndefined()
    expect(g.__JACARE__).toBeUndefined()
  })
})
