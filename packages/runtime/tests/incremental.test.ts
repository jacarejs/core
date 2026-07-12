import { describe, expect, it, vi } from 'vitest'
import { effect, reconcileKeyedList, showIf, signal } from '../src/index.js'

describe('showIf', () => {
  it('renders and clears on dispose', () => {
    const parent = document.createElement('div')
    const anchor = document.createComment('if')
    parent.appendChild(anchor)

    const visible = signal(true)
    const dispose = showIf(
      anchor,
      () => visible(),
      (mount) => {
        const el = document.createElement('p')
        el.textContent = 'yes'
        mount(el)
        return () => {}
      },
    )

    expect(parent.querySelector('p')?.textContent).toBe('yes')
    dispose()
    expect(parent.querySelector('p')).toBeNull()
  })

  it('toggles with reactive condition', () => {
    const parent = document.createElement('div')
    const anchor = document.createComment('if')
    parent.appendChild(anchor)

    const visible = signal(true)
    const dispose = showIf(
      anchor,
      () => visible(),
      (mount) => {
        const el = document.createElement('p')
        el.textContent = 'yes'
        mount(el)
        return () => {}
      },
    )

    visible.set(false)
    expect(parent.querySelector('p')).toBeNull()
    visible.set(true)
    expect(parent.querySelector('p')?.textContent).toBe('yes')
    dispose()
  })
})

describe('reconcileKeyedList', () => {
  it('creates and removes items by key', () => {
    const parent = document.createElement('ul')
    const anchor = document.createComment('each')
    parent.appendChild(anchor)

    const items = signal<{ id: string; label: string }[]>([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ])

    const dispose = reconcileKeyedList({
      parent,
      anchor,
      items: () => items(),
      getKey: (item) => item.id,
      render: (item, _index, mount) => {
        const li = document.createElement('li')
        li.textContent = item.label
        li.dataset.id = item.id
        mount(li)
        return () => {}
      },
    })

    expect(parent.querySelectorAll('li')).toHaveLength(2)
    items.set([{ id: 'b', label: 'B' }])
    expect(parent.querySelectorAll('li')).toHaveLength(1)
    expect(parent.querySelector('li')?.dataset.id).toBe('b')
    dispose()
    expect(parent.querySelectorAll('li')).toHaveLength(0)
  })

  it('reorders nodes without recreating', () => {
    const parent = document.createElement('ul')
    const anchor = document.createComment('each')
    parent.appendChild(anchor)

    const spy = vi.fn()
    const a = { id: 'a' }
    const b = { id: 'b' }
    const c = { id: 'c' }
    const items = signal([a, b, c])
    const nodes = new Map<string, HTMLLIElement>()

    reconcileKeyedList({
      parent,
      anchor,
      items: () => items(),
      getKey: (item) => item.id,
      render: (item, _index, mount) => {
        spy(item.id)
        let li = nodes.get(item.id)
        if (!li) {
          li = document.createElement('li')
          li.dataset.id = item.id
          nodes.set(item.id, li)
        }
        mount(li)
        return () => {}
      },
    })

    expect(spy).toHaveBeenCalledTimes(3)
    spy.mockClear()

    items.set([c, a, b])
    const ids = [...parent.querySelectorAll('li')].map((li) => li.dataset.id)
    expect(ids).toEqual(['c', 'a', 'b'])
    expect(spy).not.toHaveBeenCalled()
  })

  it('mounts multiple fragment roots on first run', () => {
    const parent = document.createElement('div')
    const anchor = document.createComment('each')
    parent.appendChild(anchor)

    const items = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
    ]

    reconcileKeyedList({
      parent,
      anchor,
      items: () => items,
      getKey: (item) => item.id,
      render: (item, _index, mount) => {
        const frag = document.createDocumentFragment()
        const el = document.createElement('span')
        el.dataset.id = item.id
        frag.appendChild(el)
        mount(frag)
        return () => {}
      },
    })

    expect(parent.querySelectorAll('span')).toHaveLength(5)
  })

  it('supports document fragment roots across effect runs', () => {
    const parent = document.createElement('div')
    const anchor = document.createComment('each')
    parent.appendChild(anchor)

    const a = { id: 'a' }
    const b = { id: 'b' }
    const items = signal([a, b])
    const counter = signal(0)

    reconcileKeyedList({
      parent,
      anchor,
      items: () => items(),
      getKey: (item) => item.id,
      render: (item, _index, mount) => {
        counter.update((n) => n + 1)
        const frag = document.createDocumentFragment()
        const el = document.createElement('span')
        el.dataset.id = item.id
        frag.appendChild(el)
        mount(frag)
        return () => {}
      },
    })

    expect(parent.querySelectorAll('span')).toHaveLength(2)
    expect(counter()).toBe(2)

    items.set([a, b])
    expect(parent.querySelectorAll('span')).toHaveLength(2)
    expect(counter()).toBe(2)
  })

  it('re-renders when item identity changes at the same key', () => {
    const parent = document.createElement('ul')
    const anchor = document.createComment('each')
    parent.appendChild(anchor)

    const items = signal<{ id: string; label: string; done: boolean }[]>([
      { id: 'a', label: 'A', done: false },
    ])

    reconcileKeyedList({
      parent,
      anchor,
      items: () => items(),
      getKey: (item) => item.id,
      render: (item, _index, mount) => {
        const li = document.createElement('li')
        const dispose = effect(() => {
          li.classList.toggle('done', item.done)
        }).dispose
        li.textContent = item.label
        mount(li)
        return dispose
      },
    })

    const li = parent.querySelector('li')!
    expect(li.classList.contains('done')).toBe(false)

    items.set([{ id: 'a', label: 'A', done: true }])
    const updated = parent.querySelector('li')!
    expect(updated.classList.contains('done')).toBe(true)
  })
})
