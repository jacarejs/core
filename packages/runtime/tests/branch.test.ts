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

  it('mounts multiple siblings in source order', () => {
    const parent = document.createElement('div')
    const before = document.createElement('span')
    before.textContent = 'before'
    const anchor = document.createComment('if')
    const after = document.createElement('span')
    after.textContent = 'after'
    parent.append(before, anchor, after)

    const open = signal(true)
    branch(anchor, (mount) => {
      if (!open()) return () => {}
      const label = document.createElement('p')
      label.textContent = 'label'
      const list = document.createElement('ul')
      list.textContent = 'list'
      const action = document.createElement('button')
      action.textContent = 'clear'
      mount(label)
      mount(list)
      mount(action)
      return () => {}
    })

    expect(
      [...parent.childNodes].map((n) =>
        n.nodeType === Node.COMMENT_NODE ? '#comment' : n.textContent,
      ),
    ).toEqual(['before', '#comment', 'label', 'list', 'clear', 'after'])
    expect(parent.textContent).toBe('beforelabellistclearafter')

    open.set(false)
    expect(parent.textContent).toBe('beforeafter')
    open.set(true)
    expect(parent.textContent).toBe('beforelabellistclearafter')
  })

  it('mounts document fragments in child order', () => {
    const parent = document.createElement('div')
    const anchor = document.createComment('if')
    parent.appendChild(anchor)

    branch(anchor, (mount) => {
      const frag = document.createDocumentFragment()
      const a = document.createElement('span')
      a.textContent = 'a'
      const b = document.createElement('span')
      b.textContent = 'b'
      frag.append(a, b)
      mount(frag)
      const c = document.createElement('span')
      c.textContent = 'c'
      mount(c)
      return () => {}
    })

    expect([...parent.querySelectorAll('span')].map((el) => el.textContent)).toEqual(['a', 'b', 'c'])
  })
})
