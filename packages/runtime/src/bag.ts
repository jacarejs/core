import { batch } from './effect.js'
import { namePulse } from './devtools/index.js'
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

type BagRecord = {
  id: string
  ensure: () => object
  cells: () => Map<string, CellLike>
  handle: BagApi<object>
}

const bags = new Map<string, BagRecord>()

/** Coalesce mesh writes into a single notification wave. */
export function ripple<T>(fn: () => T): T {
  return batch(fn)
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
    handle: handle as BagApi<object>,
  })

  return handle
}

/** Clear the bag registry (tests). */
export function resetBagRegistry(): void {
  bags.clear()
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
  return (
    typeof cell.subscribe === 'function' &&
    'peek' in cell
  )
}

function isWritablePulse(value: CellLike): value is Signal<unknown> {
  return typeof (value as Signal<unknown>).set === 'function'
}
