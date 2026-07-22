export const defineBagCode = `import { createBag, pulse, derive, ripple } from '@jacare/core'

export const studio = createBag('studio', () => {
  const items = pulse([])
  const count = derive(() =>
    items().reduce((n, line) => n + line.qty, 0),
  )
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
})`

export const useBagCode = `import { studio } from '../bags/studio.js'

export view
  <span class="badge">\${studio.count()}</span>
  <button type="button" on-click=\${() => studio.add(product)}>
    Add
  </button>
</view>`

export const linksCode = `export contract
  links: {
    count: { from: 'studio.count', mode: 'read' }
    add: { from: 'studio.add', mode: 'write' }
  }
</contract>

export view
  <span>\${count}</span>
  <button type="button" on-click=\${() => add(product)}>+</button>
</view>`

export const architectureNotes = {
  mesh: {
    title: 'Pulse Mesh',
    body: 'Addressable fabric of the same cells Jacaré already uses. Writes hit one DependencyCell; only readers update.',
  },
  bag: {
    title: 'Pulse Bag',
    body: 'createBag publishes a named group of ports. Lazy factory, tree-shakeable, no Provider tree.',
  },
  port: {
    title: 'Mesh Port',
    body: 'Compile wires studio.count / @studio/count to bindText or CPW. The cell pointer is fixed at mount.',
  },
}
