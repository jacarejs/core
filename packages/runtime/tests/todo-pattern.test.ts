import { describe, expect, it } from 'vitest'
import { branch, computed, effect, reconcileKeyedList, signal } from '../src/index.js'

describe('todo pattern', () => {
  it('updates when filter changes via signal.set', () => {
    const items = signal([
      { id: '1', label: 'Learn Jacare' },
      { id: '2', label: 'Build apps' },
    ])
    const filter = signal('')
    const filtered = computed(() => {
      const q = filter().trim().toLowerCase()
      if (!q) return items()
      return items().filter((item) => item.label.toLowerCase().includes(q))
    })

    const parent = document.createElement('div')
    const anchor = document.createComment('if')
    parent.appendChild(anchor)

    const scope: Array<() => void> = []
    branch(anchor, (mount) => {
      if (filtered().length === 0) {
        const p = document.createElement('p')
        p.className = 'empty'
        p.textContent = 'No items'
        mount(p)
      } else {
        const ul = document.createElement('ul')
        const each = document.createComment('each')
        ul.appendChild(each)
        scope.push(
          reconcileKeyedList({
            parent: ul,
            anchor: each,
            items: () => filtered(),
            getKey: (item) => item.id,
            render: (item, _index, itemMount) => {
              const li = document.createElement('li')
              const text = document.createTextNode('')
              li.appendChild(text)
              scope.push(effect(() => { text.data = String(item.label) }).dispose)
              itemMount(li)
              return () => {}
            },
          }),
        )
        mount(ul)
      }
      return () => {
        for (const c of scope) c()
      }
    })

    const input = document.createElement('input')
    input.addEventListener('input', (e) => filter.set((e.target as HTMLInputElement).value))
    parent.appendChild(input)

    expect(parent.querySelectorAll('li')).toHaveLength(2)
    input.value = 'jacare'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(parent.querySelectorAll('li')).toHaveLength(1)
    filter.set('')
    expect(parent.querySelectorAll('li')).toHaveLength(2)
  })
})
