import { effect } from '../effect.js'

function createOrderedMount(anchor: Comment, nodes: Node[]): (node: Node) => void {
  let cursor: Node = anchor

  return (node: Node): void => {
    const parent = anchor.parentNode
    if (!parent) return

    if (node instanceof DocumentFragment) {
      const children = Array.from(node.childNodes)
      if (children.length === 0) return
      parent.insertBefore(node, cursor.nextSibling)
      for (const child of children) {
        nodes.push(child)
        cursor = child
      }
      return
    }

    parent.insertBefore(node, cursor.nextSibling)
    nodes.push(node)
    cursor = node
  }
}

export function branch(
  anchor: Comment,
  render: (mount: (node: Node) => void) => () => void,
): () => void {
  let cleanup: (() => void) | null = null
  let nodes: Node[] = []

  const clear = (): void => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    for (const node of nodes) {
      node.parentNode?.removeChild(node)
    }
    nodes = []
  }

  const run = effect(() => {
    clear()
    const mount = createOrderedMount(anchor, nodes)
    cleanup = render(mount)
  })

  return () => {
    run.dispose()
    clear()
  }
}

export function showIf(
  anchor: Comment,
  condition: () => boolean,
  render: (mount: (node: Node) => void) => () => void,
): () => void {
  let cleanup: (() => void) | null = null
  let nodes: Node[] = []

  const clear = (): void => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    for (const node of nodes) {
      node.parentNode?.removeChild(node)
    }
    nodes = []
  }

  const run = effect(() => {
    clear()
    if (!condition()) return
    const mount = createOrderedMount(anchor, nodes)
    cleanup = render(mount)
  })

  return () => {
    run.dispose()
    clear()
  }
}
