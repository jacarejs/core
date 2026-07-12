import { describe, expect, it } from 'vitest'
import { branch } from '../src/dom/if.js'
import { signal } from '../src/signal.js'

describe('branch', () => {
  it('re-renders when tracked values change', () => {
    const parent = document.createElement('div')
    const anchor = document.createComment('if')
    parent.appendChild(anchor)

    const show = signal(true)
    branch(anchor, (mount) => {
      if (show()) {
        const p = document.createElement('p')
        p.textContent = 'yes'
        mount(p)
      } else {
        const p = document.createElement('p')
        p.textContent = 'no'
        mount(p)
      }
      return () => {}
    })

    expect(parent.textContent).toBe('yes')
    show.set(false)
    expect(parent.textContent).toBe('no')
  })
})
