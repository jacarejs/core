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
  key: string | number
  nodes: Node[]
  dispose: () => void
}

function isDocumentFragment(node: Node): node is DocumentFragment {
  return node.nodeType === 11
}

function collectMountNode(nodes: Node[], node: Node): void {
  if (isDocumentFragment(node)) {
    nodes.push(...Array.from(node.childNodes))
    return
  }
  nodes.push(node)
}

function insertNode(parent: Node, node: Node, before: Node | null): Node | null {
  if (isDocumentFragment(node)) {
    const first = node.firstChild
    if (!first) return before
    parent.insertBefore(node, before)
    return first
  }
  if (before !== null && before.parentNode !== parent) {
    before = null
  }
  if (node.parentNode !== parent || node.nextSibling !== before) {
    parent.insertBefore(node, before)
  }
  return node
}

function insertNodes(parent: Node, nodes: Node[], before: Node | null): Node | null {
  if (nodes.length === 0) return before
  if (nodes.length === 1) {
    return insertNode(parent, nodes[0]!, before)
  }
  const frag = document.createDocumentFragment()
  for (const node of nodes) {
    frag.appendChild(node)
  }
  return insertNode(parent, frag, before)
}

function renderEntry<T>(
  options: KeyedListOptions<T>,
  item: T,
  index: number,
  key: string | number,
): ListEntry<T> {
  const nodes: Node[] = []
  const mount = (node: Node): void => {
    collectMountNode(nodes, node)
  }
  const dispose = options.render(item, index, mount)
  return { item, key, nodes, dispose }
}

export function reconcileKeyedList<T>(options: KeyedListOptions<T>): () => void {
  const entries = new Map<string | number, ListEntry<T>>()
  /** Reused across runs to avoid allocating a new Map/Set every update. */
  const next = new Map<string | number, ListEntry<T>>()
  const seen = new Set<string | number>()
  const order: ListEntry<T>[] = []

  const run = effect(() => {
    const parent = options.anchor?.parentNode ?? options.parent
    if (!parent) return

    const items = options.items()
    const cold = entries.size === 0
    next.clear()
    seen.clear()
    order.length = 0

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const key = options.getKey(item, i)
      seen.add(key)

      let entry = entries.get(key)
      if (!entry) {
        entry = renderEntry(options, item, i, key)
      } else if (entry.item !== item) {
        entry.dispose()
        for (const node of entry.nodes) {
          node.parentNode?.removeChild(node)
        }
        entry = renderEntry(options, item, i, key)
      } else {
        entry.key = key
      }

      next.set(key, entry)
      order.push(entry)
    }

    for (const [key, entry] of entries) {
      if (!seen.has(key)) {
        entry.dispose()
        for (const node of entry.nodes) {
          node.parentNode?.removeChild(node)
        }
      }
    }

    const beforeAnchor: Node | null = options.anchor?.nextSibling ?? null

    if (cold && order.length > 0) {
      // One insert for the whole list — avoids N layout touches on first paint.
      const frag = document.createDocumentFragment()
      for (const entry of order) {
        for (const node of entry.nodes) {
          frag.appendChild(node)
        }
      }
      parent.insertBefore(frag, beforeAnchor)
    } else {
      let before: Node | null = beforeAnchor
      for (let i = order.length - 1; i >= 0; i--) {
        const entry = order[i]!
        const inserted = insertNodes(parent, entry.nodes, before)
        if (inserted) before = inserted
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
    next.clear()
    seen.clear()
    order.length = 0
  }
}
