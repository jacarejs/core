import {
  DependencyCell,
  isTracking,
  OwnerNode,
  runTracked,
  trackDependency,
} from './context.js'
import * as devtools from './devtools/registry.js'
import type { Computed } from './types.js'

export function computed<T>(fn: () => T): Computed<T> {
  const cell = new DependencyCell()
  const owner = new OwnerNode()
  let value: T
  let stale = true

  const markStale = (): void => {
    if (!stale) {
      stale = true
      devtools.recordStale(cell)
      cell.notify()
    }
  }

  owner.run = markStale

  devtools.registerComputed(cell, owner)

  const refresh = (): void => {
    owner.clearDependencies()
    value = runTracked(owner, fn)
    stale = false
    devtools.recordValue(cell, value)
  }

  refresh()

  const read = (): T => {
    if (isTracking()) {
      trackDependency(cell)
    }
    if (stale) {
      refresh()
    }
    return value
  }

  const comp = read as unknown as Computed<T>

  Object.defineProperties(comp, {
    peek: {
      get: () => {
        if (stale) refresh()
        return value
      },
    },
    subscribe: {
      value: (sub: () => void) => cell.subscribe(sub),
    },
  })

  return comp
}
