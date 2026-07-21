import { batch } from './effect.js'
import { getBindingsForPulse, namePulse, resolvePulseId } from './devtools/index.js'
import type { ReadonlySignal, Signal } from './types.js'

type CellLike = ReadonlySignal<unknown> | Signal<unknown>

export type BagSnap = Record<string, unknown>

export type BagApi<T extends object> = T & {
  readonly id: string
  /** Snapshot writable pulse values published by this bag. */
  snap(): BagSnap
  /** Write snapshot values into published pulses (one ripple). */
  hydrate(data: BagSnap): void
  /** Drop published cells and rebuild on next access. */
  reset(): void
}

export type MeshCellKind = 'pulse' | 'derive'

export interface MeshCellSnapshot {
  address: string
  bagId: string
  key: string
  kind: MeshCellKind
  value: unknown
  pulseId?: number
  /** DOM binding count when DevTools registry knows the pulse. */
  bindings: number
  /** Unique source files from DOM bindings (stand-in until Mesh Ports). */
  boundFrom: string[]
}

export interface MeshPortSnapshot {
  address: string
  bagId: string
  key: string
  kind: 'intent'
}

export interface MeshBagSnapshot {
  id: string
  published: boolean
  cells: MeshCellSnapshot[]
  ports: MeshPortSnapshot[]
}

export interface MeshRippleSnapshot {
  at: number
  bagIds: string[]
  addresses: string[]
}

export interface MeshSnapshot {
  bags: MeshBagSnapshot[]
  lastRipple: MeshRippleSnapshot | null
  updatedAt: number
}

type BagRecord = {
  id: string
  ensure: () => object
  cells: () => Map<string, CellLike>
  api: () => object | null
  handle: BagApi<object>
}

const bags = new Map<string, BagRecord>()
const meshListeners = new Set<() => void>()
let lastRipple: MeshRippleSnapshot | null = null

function emitMesh(): void {
  for (const listener of meshListeners) {
    listener()
  }
}

/** Coalesce mesh writes into a single notification wave. */
export function ripple<T>(fn: () => T): T {
  const before = bags.size > 0 ? capturePublishedPeeks() : null
  const result = batch(fn)
  lastRipple = before
    ? diffRipple(before)
    : { at: Date.now(), bagIds: [], addresses: [] }
  if (meshListeners.size > 0) emitMesh()
  return result
}

/** Look up a published bag by id (runs the factory on first use). */
export function getBag<T extends object = object>(id: string): BagApi<T> | undefined {
  const record = bags.get(id)
  if (!record) return undefined
  record.ensure()
  return record.handle as BagApi<T>
}

/** List bag ids that have been registered (factory may still be lazy). */
export function listBags(): string[] {
  return [...bags.keys()]
}

/**
 * Register a named bag on the pulse mesh.
 * Cells are published lazily on first property access as `@id/key`.
 */
export function createBag<T extends object>(id: string, factory: () => T): BagApi<T> {
  if (!id || typeof id !== 'string') {
    throw new Error('createBag: id must be a non-empty string')
  }
  if (bags.has(id)) {
    throw new Error(`createBag: bag "${id}" is already registered`)
  }
  if (typeof factory !== 'function') {
    throw new Error('createBag: factory must be a function')
  }

  let api: T | null = null
  let cellMap = new Map<string, CellLike>()

  function ensure(): T {
    if (api) return api
    api = factory()
    cellMap = publishCells(id, api)
    emitMesh()
    return api
  }

  function snap(): BagSnap {
    ensure()
    const out: BagSnap = {}
    for (const [key, cell] of cellMap) {
      if (isWritablePulse(cell)) {
        out[key] = cell.peek
      }
    }
    return out
  }

  function hydrate(data: BagSnap): void {
    ensure()
    ripple(() => {
      for (const [key, value] of Object.entries(data)) {
        const cell = cellMap.get(key)
        if (cell && isWritablePulse(cell)) {
          cell.set(value)
        }
      }
    })
  }

  function reset(): void {
    api = null
    cellMap = new Map()
    emitMesh()
  }

  const handle = new Proxy({} as BagApi<T>, {
    get(_target, prop) {
      if (prop === 'id') return id
      if (prop === 'snap') return snap
      if (prop === 'hydrate') return hydrate
      if (prop === 'reset') return reset
      if (prop === Symbol.toStringTag) return 'Bag'
      if (prop === 'then') return undefined

      const target = ensure()
      const value = Reflect.get(target as object, prop, target)
      if (typeof value === 'function' && !isPulseCell(value)) {
        return (value as (...args: unknown[]) => unknown).bind(target)
      }
      return value
    },
    set(_target, prop, value) {
      const target = ensure()
      return Reflect.set(target as object, prop, value, target)
    },
    has(_target, prop) {
      if (prop === 'id' || prop === 'snap' || prop === 'hydrate' || prop === 'reset') return true
      return Reflect.has(ensure() as object, prop)
    },
    ownKeys() {
      return Reflect.ownKeys(ensure() as object)
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (prop === 'id') {
        return { configurable: true, enumerable: false, value: id }
      }
      if (prop === 'snap') {
        return { configurable: true, enumerable: false, value: snap }
      }
      if (prop === 'hydrate') {
        return { configurable: true, enumerable: false, value: hydrate }
      }
      if (prop === 'reset') {
        return { configurable: true, enumerable: false, value: reset }
      }
      return Reflect.getOwnPropertyDescriptor(ensure() as object, prop)
    },
  })

  bags.set(id, {
    id,
    ensure: () => ensure(),
    cells: () => cellMap,
    api: () => api,
    handle: handle as BagApi<object>,
  })
  emitMesh()

  return handle
}

/** Live mesh view for DevTools (bags, cell addresses, last ripple). */
export function getMeshSnapshot(): MeshSnapshot {
  const bagSnapshots: MeshBagSnapshot[] = []

  for (const record of bags.values()) {
    const api = record.api()
    const cellMap = record.cells()
    const cells: MeshCellSnapshot[] = []
    const ports: MeshPortSnapshot[] = []

    if (api) {
      for (const [key, cell] of cellMap) {
        const address = `@${record.id}/${key}`
        const pulseId = resolvePulseId(cell)
        const bindings = pulseId != null ? getBindingsForPulse(pulseId) : []
        const boundFrom = uniqueFiles(bindings.map((b) => b.file).filter(Boolean) as string[])
        cells.push({
          address,
          bagId: record.id,
          key,
          kind: isWritablePulse(cell) ? 'pulse' : 'derive',
          value: cell.peek,
          ...(pulseId != null ? { pulseId } : {}),
          bindings: bindings.length,
          boundFrom,
        })
      }

      for (const key of Object.keys(api)) {
        if (cellMap.has(key)) continue
        const value = (api as Record<string, unknown>)[key]
        if (typeof value !== 'function') continue
        ports.push({
          address: `@${record.id}/${key}`,
          bagId: record.id,
          key,
          kind: 'intent',
        })
      }
    }

    bagSnapshots.push({
      id: record.id,
      published: api != null,
      cells,
      ports,
    })
  }

  return {
    bags: bagSnapshots,
    lastRipple,
    updatedAt: Date.now(),
  }
}

export function subscribeMesh(listener: () => void): () => void {
  meshListeners.add(listener)
  return () => {
    meshListeners.delete(listener)
  }
}

/** Poll mesh values while DevTools Mesh panel is open. */
export function startMeshPulse(intervalMs = 120): () => void {
  const timer = setInterval(() => emitMesh(), intervalMs)
  return () => clearInterval(timer)
}

/** Clear the bag registry (tests). */
export function resetBagRegistry(): void {
  bags.clear()
  lastRipple = null
  emitMesh()
}

function capturePublishedPeeks(): Map<string, unknown> {
  const peeks = new Map<string, unknown>()
  for (const record of bags.values()) {
    for (const [key, cell] of record.cells()) {
      peeks.set(`@${record.id}/${key}`, cell.peek)
    }
  }
  return peeks
}

function diffRipple(before: Map<string, unknown>): MeshRippleSnapshot {
  const addresses: string[] = []
  const bagIds = new Set<string>()

  for (const record of bags.values()) {
    for (const [key, cell] of record.cells()) {
      const address = `@${record.id}/${key}`
      const prev = before.get(address)
      if (!Object.is(prev, cell.peek)) {
        addresses.push(address)
        bagIds.add(record.id)
      }
    }
  }

  return {
    at: Date.now(),
    bagIds: [...bagIds],
    addresses,
  }
}

function uniqueFiles(files: string[]): string[] {
  return [...new Set(files.map(basename))]
}

function basename(path: string): string {
  return path.replace(/\\/g, '/').split('/').pop() || path
}

function publishCells(bagId: string, api: object): Map<string, CellLike> {
  const map = new Map<string, CellLike>()
  for (const key of Object.keys(api)) {
    const value = (api as Record<string, unknown>)[key]
    if (!isPulseCell(value)) continue
    const address = `@${bagId}/${key}`
    namePulse(value, address)
    map.set(key, value)
  }
  return map
}

function isPulseCell(value: unknown): value is CellLike {
  if (typeof value !== 'function') return false
  const cell = value as CellLike
  return typeof cell.subscribe === 'function' && 'peek' in cell
}

function isWritablePulse(value: CellLike): value is Signal<unknown> {
  return typeof (value as Signal<unknown>).set === 'function'
}
