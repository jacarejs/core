import { describe, expect, it } from 'vitest'
import { ensureScopedStyle, mountSlot } from '../src/dom/slot.js'

describe('ensureScopedStyle', () => {
  it('injects style tag once per scope id', () => {
    document.head.innerHTML = ''
    ensureScopedStyle('test-scope', '.x { color: red; }')
    ensureScopedStyle('test-scope', '.x { color: red; }')
    const styles = document.querySelectorAll('style[data-jacare-s="test-scope"]')
    expect(styles).toHaveLength(1)
    expect(styles[0]?.textContent).toContain('color: red')
  })
})

describe('mountSlot', () => {
  it('renders children into target', () => {
    const target = document.createElement('span')
    const dispose = mountSlot(target, (host) => {
      host.textContent = 'slot content'
      return () => {
        host.textContent = ''
      }
    })
    expect(target.textContent).toBe('slot content')
    dispose?.()
    expect(target.textContent).toBe('')
  })
})
