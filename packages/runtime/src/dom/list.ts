import { effect } from '../effect.js'

export interface KeyedListOptions<T> {
  parent: Node
  anchor?: Comment | null
  items: () => readonly T[]
  getKey: (item: T, index: number) => string | number
  render: (item: T, index: number, mount: (node: Node) => void) => () => void
}

interface ListEntry<T> {
  item: T
  nodes: Node[]
  dispose: () => void
}

export function reconcileKeyedList<T>(options: KeyedListOptions<T>): () => void {
  const entries = new Map<string | number, ListEntry<T>>()

  const insertBefore = (node: Node, before: Node | null): void => {
    options.parent.insertBefore(node, before)
  }

  const run = effect(() => {
    const items = options.items()
    const next = new Map<string | number, ListEntry<T>>()
    const seen = new Set<string | number>()

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const key = options.getKey(item, i)
      seen.add(key)

      let entry = entries.get(key)
      if (!entry) {
        const nodes: Node[] = []
        const mount = (node: Node): void => {
          nodes.push(node)
        }
        const dispose = options.render(item, i, mount)
        entry = { item, nodes, dispose }
      } else if (entry.item !== item) {
        entry.dispose()
        for (const node of entry.nodes) {
          node.parentNode?.removeChild(node)
        }
        const nodes: Node[] = []
        const mount = (node: Node): void => {
          nodes.push(node)
        }
        const dispose = options.render(item, i, mount)
        entry = { item, nodes, dispose }
      }

      next.set(key, entry)
    }

    for (const [key, entry] of entries) {
      if (!seen.has(key)) {
        entry.dispose()
        for (const node of entry.nodes) {
          node.parentNode?.removeChild(node)
        }
      }
    }

    let before: Node | null = options.anchor?.nextSibling ?? null
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!
      const key = options.getKey(item, i)
      const entry = next.get(key)!
      for (let j = entry.nodes.length - 1; j >= 0; j--) {
        insertBefore(entry.nodes[j]!, before)
        before = entry.nodes[j]!
      }
    }

    entries.clear()
    for (const [key, entry] of next) {
      entries.set(key, entry)
    }
  })

  return () => {
    run.dispose()
    for (const entry of entries.values()) {
      entry.dispose()
      for (const node of entry.nodes) {
        node.parentNode?.removeChild(node)
      }
    }
    entries.clear()
  }
}
