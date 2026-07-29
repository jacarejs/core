import { createBag, pulse, derive, ripple } from '@jacare/core'

export const mesh30 = createBag('lab-mesh30', () => {
  const items = pulse([])
  const count = derive(() => items().length)

  function add(label) {
    ripple(() => {
      items.update((list) => [...list, { id: String(Date.now()), label }])
    })
  }

  function clear() {
    ripple(() => items.set([]))
  }

  return { items, count, add, clear }
})
