import { createBag, pulse, derive, ripple } from '@jacare/core'

export const cart = createBag('cart', () => {
  const items = pulse([])

  const total = derive(() =>
    items().reduce((sum, line) => sum + line.price * line.qty, 0),
  )
  const count = derive(() => items().reduce((sum, line) => sum + line.qty, 0))
  const money = derive(() => `$${total().toFixed(2)}`)

  function add(product) {
    ripple(() => {
      items.update((list) => {
        const index = list.findIndex((line) => line.id === product.id)
        if (index === -1) return [...list, { ...product, qty: 1 }]
        return list.map((line, i) =>
          i === index ? { ...line, qty: line.qty + 1 } : line,
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
    ripple(() => {
      items.set([])
    })
  }

  return { items, total, count, money, add, remove, clear }
})
