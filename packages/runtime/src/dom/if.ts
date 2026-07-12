import { effect } from '../effect.js'

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
    const mount = (node: Node): void => {
      nodes.push(node)
      anchor.parentNode?.insertBefore(node, anchor.nextSibling)
    }
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
    const mount = (node: Node): void => {
      nodes.push(node)
      anchor.parentNode?.insertBefore(node, anchor.nextSibling)
    }
    cleanup = render(mount)
  })

  return () => {
    run.dispose()
    clear()
  }
}
