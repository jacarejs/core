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
cart.reset()  // restore factory defaults (bindings stay live)`

export const deepTreeCode = `// bags/cart.js — second bag for the depth demo
export const treeCart = createBag('lab-tree', () => { … })

// BagTreeParent.jcr
import { treeCart } from '../bags/cart.js'
import BagTreeChild from './BagTreeChild.jcr'

export <view>
  <p>Parent count: \${treeCart.count()}</p>
  <BagTreeChild />
</view>

// BagTreeChild.jcr — imports treeCart again
// BagTreeGrand.jcr — no bag import (pass-through)
// BagTreeLeaf.jcr — imports treeCart and calls add()

// Mesh shows @lab-cart/* (catalog) and @lab-tree/* (nesting) apart`

export const contractLinksCode = `export <contract>
  links: {
    count: { from: 'lab-cart.count', mode: 'read' }
    money: { from: 'lab-cart.money', mode: 'read' }
  }
</contract>

export <view>
  <p class="metric">linked · \${count} · \${money}</p>
</view>

// No import of the bag — getBag('lab-cart') at mount.
// jacare check fails if @lab-cart/count is not published.`

export const lazyPublishCode = `import { createBag, pulse } from '@jacare/core'

export const lazyFactoryRuns = pulse(0)

export const lazyBag = createBag('lab-lazy', () => {
  lazyFactoryRuns.update((n) => n + 1)
  const label = pulse('published')
  return { label }
})

// Import registers the id only — factory still idle.
// First lazyBag.label (or getBag('lab-lazy').label) publishes @lab-lazy/*.

// Compiled views that use Mesh Ports emit:
// /* jacare-mesh-ports: cart.count,cart.add */
// so unused bag modules stay out of the chunk when never imported.`

export const addressSugarCode = `export <view>
  <p class="metric">@lab-cart · \${@lab-cart/count} · \${@lab-cart/money}</p>
  <button type="button" on-click=\${@lab-cart/clear}>Clear</button>
</view>

// Same Mesh Ports as import { demoCart } — resolved by bag id:
// bindText(node, getBag("lab-cart")?.count)
// The bag must still be registered somewhere (this page imports demoCart).`

export const meshArchDiagram = `┌─────────────────────────────────────────────────────────┐
│                     PULSE MESH                          │
│  @cart/items  @cart/total  @session/user  @prefs/locale │
│              DependencyCell graph (Jacaré core)         │
└─────────────────────────────────────────────────────────┘
        ▲                ▲                 ▲
   Catalog.jcr      MiniCart.jcr      Checkout.jcr
   import | links | @bag/key  —  same cell, no Provider

┌─ DX ────────────────────────────────────────────────────┐
│  createBag('cart', factory)  →  publish ports          │
│  ripple(fn)  →  one flush wave                          │
│  Mesh Port compile  →  bindText / CPW on the cell       │
└─────────────────────────────────────────────────────────┘`

