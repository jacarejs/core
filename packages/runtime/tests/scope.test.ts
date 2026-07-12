import { describe, expect, it, vi } from 'vitest'
import {
  getScopeSnapshot,
  registerScope,
  subscribeScope,
  clearScope,
} from '../src/scope.js'

describe('scope', () => {
  it('registers and snapshots live values', () => {
    clearScope()
    let value = 'a'
    const unregister = registerScope('demo', 'Demo', () => value)

    expect(getScopeSnapshot().entries).toEqual([
      { id: 'demo', label: 'Demo', value: 'a' },
    ])

    value = 'b'
    expect(getScopeSnapshot().entries[0]?.value).toBe('b')

    unregister()
    expect(getScopeSnapshot().entries).toHaveLength(0)
  })

  it('notifies subscribers', () => {
    clearScope()
    const listener = vi.fn()
    const unsubscribe = subscribeScope(listener)
    registerScope('x', 'X', () => 1)
    expect(listener).toHaveBeenCalled()
    unsubscribe()
  })
})
