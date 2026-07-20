import type { DependencyCell, OwnerNode } from '../context.js'
import type {
  BindingKind,
  BindingMeta,
  DevtoolsMeta,
  PulseBinding,
  PulseEdge,
  PulseGraphSnapshot,
  PulseNode,
  PulseNodeKind,
} from './types.js'

interface InternalNode {
  id: number
  kind: PulseNodeKind
  name?: string
  file?: string
  line?: number
  value?: unknown
  stale?: boolean
  disposed: boolean
  subscribers: number
  cell?: DependencyCell
}

interface InternalBinding {
  id: number
  pulseId: number
  target: Node
  kind: BindingKind
  file?: string
  line?: number
}

let enabled = false
let nextId = 1
let nextBindingId = 1
const nodes = new Map<number, InternalNode>()
const cellToId = new WeakMap<DependencyCell, number>()
const ownerToId = new WeakMap<OwnerNode, number>()
const sourceToId = new WeakMap<object, number>()
const edges = new Set<string>()
const listeners = new Set<() => void>()
const bindings = new Map<number, InternalBinding>()
const bindingsByPulse = new Map<number, Set<number>>()
let highlightStyleInjected = false
const highlighted = new Set<Element>()

function emit(): void {
  if (!enabled) return
  for (const listener of listeners) {
    listener()
  }
}

function edgeKey(from: number, to: number): string {
  return `${from}:${to}`
}

function applyMeta(node: InternalNode, meta?: DevtoolsMeta): void {
  if (!meta) return
  if (meta.name) node.name = meta.name
  if (meta.file) node.file = meta.file
  if (meta.line != null) node.line = meta.line
}

export function enableDevtools(): void {
  enabled = true
  ensureHighlightStyle()
  emit()
}

export function isDevtoolsEnabled(): boolean {
  return enabled
}

export function registerSignal(
  cell: DependencyCell,
  initial: unknown,
  meta?: DevtoolsMeta,
): number {
  const id = nextId++
  const node: InternalNode = {
    id,
    kind: 'signal',
    value: initial,
    disposed: false,
    subscribers: 0,
    cell,
  }
  applyMeta(node, meta)
  nodes.set(id, node)
  cellToId.set(cell, id)
  emit()
  return id
}

export function registerComputed(
  cell: DependencyCell,
  owner: OwnerNode,
  initial?: unknown,
  meta?: DevtoolsMeta,
): number {
  const id = nextId++
  const node: InternalNode = {
    id,
    kind: 'computed',
    ...(initial !== undefined ? { value: initial } : {}),
    stale: false,
    disposed: false,
    subscribers: 0,
    cell,
  }
  applyMeta(node, meta)
  nodes.set(id, node)
  cellToId.set(cell, id)
  ownerToId.set(owner, id)
  emit()
  return id
}

export function registerEffect(owner: OwnerNode, meta?: DevtoolsMeta): number {
  const id = nextId++
  const node: InternalNode = {
    id,
    kind: 'effect',
    disposed: false,
    subscribers: 0,
  }
  applyMeta(node, meta)
  nodes.set(id, node)
  ownerToId.set(owner, id)
  emit()
  return id
}

export function attachPulseSource(source: object, id: number): void {
  sourceToId.set(source, id)
}

export function resolvePulseId(source: unknown): number | undefined {
  if (source == null) return undefined
  if (typeof source === 'function' || typeof source === 'object') {
    return sourceToId.get(source as object)
  }
  return undefined
}

export function namePulse(
  source: unknown,
  name: string,
  meta: Omit<DevtoolsMeta, 'name'> = {},
): void {
  const id = resolvePulseId(source)
  if (id == null) return
  const node = nodes.get(id)
  if (!node) return
  node.name = name
  if (meta.file) node.file = meta.file
  if (meta.line != null) node.line = meta.line
  emit()
}

export function linkDependency(cell: DependencyCell, owner: OwnerNode): void {
  const from = cellToId.get(cell)
  const to = ownerToId.get(owner)
  if (from == null || to == null || from === to) return
  edges.add(edgeKey(from, to))
  syncSubscriberCount(cell)
  emit()
}

export function recordValue(cell: DependencyCell, value: unknown): void {
  const id = cellToId.get(cell)
  if (id == null) return
  const node = nodes.get(id)
  if (!node) return
  node.value = value
  node.stale = false
  syncSubscriberCount(cell)
  if (enabled) {
    flashBindings(id)
  }
  emit()
}

export function recordStale(cell: DependencyCell): void {
  const id = cellToId.get(cell)
  if (id == null) return
  const node = nodes.get(id)
  if (!node || node.kind !== 'computed') return
  node.stale = true
  emit()
}

export function recordEffectRun(owner: OwnerNode): void {
  const id = ownerToId.get(owner)
  if (id == null) return
  const node = nodes.get(id)
  if (!node || node.kind !== 'effect') return
  node.value = { ranAt: Date.now() }
  emit()
}

export function disposeOwner(owner: OwnerNode): void {
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

export function registerBinding(
  source: unknown,
  target: Node,
  meta: BindingMeta = {},
): () => void {
  const pulseId = resolvePulseId(source)
  if (pulseId == null) return () => {}

  const id = nextBindingId++
  const entry: InternalBinding = {
    id,
    pulseId,
    target,
    kind: meta.kind ?? 'bind',
    ...(meta.file ? { file: meta.file } : {}),
    ...(meta.line != null ? { line: meta.line } : {}),
  }
  bindings.set(id, entry)
  let set = bindingsByPulse.get(pulseId)
  if (!set) {
    set = new Set()
    bindingsByPulse.set(pulseId, set)
  }
  set.add(id)

  return () => {
    bindings.delete(id)
    const group = bindingsByPulse.get(pulseId)
    group?.delete(id)
    if (group && group.size === 0) {
      bindingsByPulse.delete(pulseId)
    }
  }
}

/** Compiler-friendly alias — same as `registerBinding`. */
export function devtoolsBind(
  source: unknown,
  target: Node,
  meta: BindingMeta = {},
): () => void {
  return registerBinding(source, target, meta)
}

export function getBindingsForPulse(pulseId: number): PulseBinding[] {
  const ids = bindingsByPulse.get(pulseId)
  if (!ids) return []
  const out: PulseBinding[] = []
  for (const id of ids) {
    const entry = bindings.get(id)
    if (!entry) continue
    out.push({
      pulseId: entry.pulseId,
      target: entry.target,
      kind: entry.kind,
      ...(entry.file ? { file: entry.file } : {}),
      ...(entry.line != null ? { line: entry.line } : {}),
    })
  }
  return out
}

export function getPulsesForElement(el: Element): number[] {
  const ids = new Set<number>()
  for (const entry of bindings.values()) {
    const host = resolveHighlightTarget(entry.target)
    if (host === el || (host != null && el.contains(host)) || host?.contains(el)) {
      ids.add(entry.pulseId)
    }
  }
  return [...ids]
}

function resolveHighlightTarget(target: Node): Element | null {
  if (target.nodeType === Node.ELEMENT_NODE) return target as Element
  return target.parentElement
}

function ensureHighlightStyle(): void {
  if (highlightStyleInjected || typeof document === 'undefined') return
  highlightStyleInjected = true
  const style = document.createElement('style')
  style.setAttribute('data-jacare-devtools-highlight', '')
  style.textContent = `
    .jacare-devtools-highlight {
      outline: 3px solid #2563eb !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.28) !important;
      border-radius: 6px;
      position: relative;
      z-index: 2147483000;
    }
    .jacare-devtools-flash {
      animation: jacare-devtools-dom-flash 0.22s ease;
    }
    @keyframes jacare-devtools-dom-flash {
      0% { outline: 3px solid #22c55e; outline-offset: 3px; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.3); }
      100% { outline: 3px solid transparent; outline-offset: 3px; box-shadow: none; }
    }
  `
  document.head.appendChild(style)
}

export function clearHighlight(): void {
  for (const el of highlighted) {
    el.classList.remove('jacare-devtools-highlight')
  }
  highlighted.clear()
}

export function highlightBinding(pulseId: number): void {
  ensureHighlightStyle()
  clearHighlight()
  for (const binding of getBindingsForPulse(pulseId)) {
    const el = resolveHighlightTarget(binding.target)
    if (!el) continue
    el.classList.add('jacare-devtools-highlight')
    highlighted.add(el)
  }
}

export function flashDom(target: Node): void {
  ensureHighlightStyle()
  const el = resolveHighlightTarget(target)
  if (!el || !(el instanceof HTMLElement)) return
  el.classList.remove('jacare-devtools-flash')
  void el.offsetWidth
  el.classList.add('jacare-devtools-flash')
  window.setTimeout(() => {
    el.classList.remove('jacare-devtools-flash')
  }, 200)
}

function flashBindings(pulseId: number): void {
  for (const binding of getBindingsForPulse(pulseId)) {
    flashDom(binding.target)
  }
}

export function pickElement(): Promise<Element | null> {
  ensureHighlightStyle()
  return new Promise((resolve) => {
    const previous = document.body.style.cursor
    document.body.style.cursor = 'crosshair'

    const onMove = (event: MouseEvent): void => {
      clearHighlight()
      const el = event.target
      if (!(el instanceof Element) || el.closest('.jacare-devtools') || el.closest('.jacare-scope')) {
        return
      }
      el.classList.add('jacare-devtools-highlight')
      highlighted.add(el)
    }

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey, true)
      document.body.style.cursor = previous
    }

    const onClick = (event: MouseEvent): void => {
      event.preventDefault()
      event.stopPropagation()
      const el = event.target
      cleanup()
      clearHighlight()
      if (!(el instanceof Element) || el.closest('.jacare-devtools') || el.closest('.jacare-scope')) {
        resolve(null)
        return
      }
      resolve(el)
    }

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        cleanup()
        clearHighlight()
        resolve(null)
      }
    }

    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey, true)
  })
}

export function getPulseGraph(): PulseGraphSnapshot {
  if (!enabled) {
    return {
      nodes: [],
      edges: [],
      updatedAt: Date.now(),
    }
  }

  const snapshotNodes: PulseNode[] = []
  for (const node of nodes.values()) {
    if (node.cell) {
      node.subscribers = node.cell.subscriberCount
    }
    snapshotNodes.push({
      id: node.id,
      kind: node.kind,
      ...(node.name ? { name: node.name } : {}),
      ...(node.file ? { file: node.file } : {}),
      ...(node.line != null ? { line: node.line } : {}),
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
  nextBindingId = 1
  nodes.clear()
  edges.clear()
  listeners.clear()
  bindings.clear()
  bindingsByPulse.clear()
  clearHighlight()
}
