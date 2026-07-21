import { viewSnippet, moduleSnippet } from '../utils/snippet.js'

export const defineBagCode = moduleSnippet(
  `import { createBag, pulse, derive, ripple } from '@jacare/core'

export const cart = createBag('cart', () => {
  const items = pulse([])
  const count = derive(() => items().reduce((n, line) => n + line.qty, 0))
  const total = derive(() =>
    items().reduce((sum, line) => sum + line.price * line.qty, 0),
  )

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

  return { items, count, total, add }
})`,
)

export const useBagCode = viewSnippet(
  `import { cart } from '../bags/cart.js'`,
  `  <a class="mini-cart" jacare-go="/checkout">
    Cart · \${cart.count()}
  </a>

  #for cart.items() as line (line.id)
    <div class="row">
      <span>\${line.name} × \${line.qty}</span>
      <button type="button" on-click=\${() => cart.remove(line.id)}>Remove</button>
    </div>
  #end`,
)

export const snapHydrateCode = `const snap = cart.snap()
// { items: [...] } — writable pulses only

cart.hydrate(snap)
cart.reset()  // next access re-runs the factory`
