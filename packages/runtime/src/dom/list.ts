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

export function reconcileKeyedList<T>(options: KeyedListOptions<T>): () => void {
  const entries = new Map<string | number, ListEntry<T>>()

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
          collectMountNode(nodes, node)
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
          collectMountNode(nodes, node)
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
      const inserted = insertNodes(options.parent, entry.nodes, before)
      if (inserted) {
        before = inserted
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
