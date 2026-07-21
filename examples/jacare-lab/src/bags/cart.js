import { createBag, pulse, derive, ripple } from '@jacare/core'

export const demoCart = createBag('lab-cart', () => {
  const items = pulse([])
  const count = derive(() => items().reduce((n, line) => n + line.qty, 0))
  const total = derive(() =>
    items().reduce((sum, line) => sum + line.price * line.qty, 0),
  )
  const money = derive(() => `$${total().toFixed(2)}`)

  function add(product) {
    ripple(() => {
      items.update((list) => {
        const i = list.findIndex((line) => line.id === product.id)
        if (i === -1) return [...list, { ...product, qty: 1 }]
        return list.map((line, idx) =>
          idx === i ? { ...line, qty: line.qty + 1 } : line,
        )
      })
    })
  }

  function remove(id) {
    ripple(() => {
      items.update((list) => list.filter((line) => line.id !== id))
    })
  }

  function clear() {
    ripple(() => items.set([]))
  }

  return { items, count, total, money, add, remove, clear }
})
