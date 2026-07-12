import type { DependencyCell, OwnerNode } from '../context.js'
import type { PulseEdge, PulseGraphSnapshot, PulseNode, PulseNodeKind } from './types.js'

interface InternalNode {
  id: number
  kind: PulseNodeKind
  value?: unknown
  stale?: boolean
  disposed: boolean
  subscribers: number
  cell?: DependencyCell
}

let enabled = false
let nextId = 1
const nodes = new Map<number, InternalNode>()
const cellToId = new WeakMap<DependencyCell, number>()
const ownerToId = new WeakMap<OwnerNode, number>()
const edges = new Set<string>()
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) {
    listener()
  }
}

function edgeKey(from: number, to: number): string {
  return `${from}:${to}`
}

export function enableDevtools(): void {
  enabled = true
  emit()
}

export function isDevtoolsEnabled(): boolean {
  return enabled
}

export function registerSignal(cell: DependencyCell, initial: unknown): void {
  if (!enabled) return
  const id = nextId++
  nodes.set(id, {
    id,
    kind: 'signal',
    value: initial,
    disposed: false,
    subscribers: 0,
    cell,
  })
  cellToId.set(cell, id)
  emit()
}

export function registerComputed(cell: DependencyCell, owner: OwnerNode, initial?: unknown): void {
  if (!enabled) return
  const id = nextId++
  nodes.set(id, {
    id,
    kind: 'computed',
    ...(initial !== undefined ? { value: initial } : {}),
    stale: false,
    disposed: false,
    subscribers: 0,
    cell,
  })
  cellToId.set(cell, id)
  ownerToId.set(owner, id)
  emit()
}

export function registerEffect(owner: OwnerNode): void {
  if (!enabled) return
  const id = nextId++
  nodes.set(id, {
    id,
    kind: 'effect',
    disposed: false,
    subscribers: 0,
  })
  ownerToId.set(owner, id)
  emit()
}

export function linkDependency(cell: DependencyCell, owner: OwnerNode): void {
  if (!enabled) return
  const from = cellToId.get(cell)
  const to = ownerToId.get(owner)
  if (from == null || to == null || from === to) return
  edges.add(edgeKey(from, to))
  syncSubscriberCount(cell)
  emit()
}

export function recordValue(cell: DependencyCell, value: unknown): void {
  if (!enabled) return
  const id = cellToId.get(cell)
  if (id == null) return
  const node = nodes.get(id)
  if (!node) return
  node.value = value
  node.stale = false
  syncSubscriberCount(cell)
  emit()
}

export function recordStale(cell: DependencyCell): void {
  if (!enabled) return
  const id = cellToId.get(cell)
  if (id == null) return
  const node = nodes.get(id)
  if (!node || node.kind !== 'computed') return
  node.stale = true
  emit()
}

export function recordEffectRun(owner: OwnerNode): void {
  if (!enabled) return
  const id = ownerToId.get(owner)
  if (id == null) return
  const node = nodes.get(id)
  if (!node || node.kind !== 'effect') return
  node.value = { ranAt: Date.now() }
  emit()
}

export function disposeOwner(owner: OwnerNode): void {
  if (!enabled) return
  const id = ownerToId.get(owner)
  if (id == null) return
  const node = nodes.get(id)
  if (!node) return
  node.disposed = true
  emit()
}

function syncSubscriberCount(cell: DependencyCell): void {
  const id = cellToId.get(cell)
  if (id == null) return
  const node = nodes.get(id)
  if (!node) return
  node.subscribers = cell.subscriberCount
}

export function getPulseGraph(): PulseGraphSnapshot {
  const snapshotNodes: PulseNode[] = []
  for (const node of nodes.values()) {
    if (node.cell) {
      node.subscribers = node.cell.subscriberCount
    }
    snapshotNodes.push({
      id: node.id,
      kind: node.kind,
      ...(node.value !== undefined ? { value: node.value } : {}),
      ...(node.stale !== undefined ? { stale: node.stale } : {}),
      disposed: node.disposed,
      subscribers: node.subscribers,
    })
  }

  const snapshotEdges: PulseEdge[] = []
  for (const key of edges) {
    const [from, to] = key.split(':').map(Number)
    if (from == null || to == null) continue
    snapshotEdges.push({ from, to })
  }

  return {
    nodes: snapshotNodes,
    edges: snapshotEdges,
    updatedAt: Date.now(),
  }
}

export function subscribePulseGraph(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function resetDevtoolsForTests(): void {
  enabled = false
  nextId = 1
  nodes.clear()
  edges.clear()
  listeners.clear()
}
