import {
  DependencyCell,
  isTracking,
  startTracking,
  stopTracking,
  trackDependency,
} from './context.js'
import * as devtools from './devtools/registry.js'
import type { DevtoolsMeta } from './devtools/types.js'
import type { Signal } from './types.js'

export function signal<T>(initial: T, options?: DevtoolsMeta): Signal<T> {
  const cell = new DependencyCell()
  let value = initial
  const id = devtools.registerSignal(cell, value, options)

  const read = (): T => {
    if (isTracking()) {
      trackDependency(cell)
    }
    return value
  }

  const sig = read as unknown as Signal<T>
  devtools.attachPulseSource(sig, id)

  Object.defineProperties(sig, {
    peek: {
      get: () => value,
    },
    set: {
      value: (next: T) => {
        if (Object.is(value, next)) return
        value = next
        cell.notify()
        devtools.recordValue(cell, value)
      },
    },
    update: {
      value: (fn: (prev: T) => T) => {
        const next = fn(value)
        if (Object.is(value, next)) return
        value = next
        cell.notify()
        devtools.recordValue(cell, value)
      },
    },
    subscribe: {
      value: (fn: () => void) => cell.subscribe(fn),
    },
  })

  return sig
}

export function untrack<T>(fn: () => T): T {
  const wasTracking = isTracking()
  stopTracking()
  try {
    return fn()
  } finally {
    if (wasTracking) startTracking()
  }
}
