import { batch as runBatch, OwnerNode, runTracked } from './context.js'
import * as devtools from './devtools/registry.js'
import type { Effect, EffectOptions } from './types.js'

export function effect(fn: () => void | (() => void), options?: EffectOptions): Effect {
  const owner = new OwnerNode()
  let userCleanup: (() => void) | void

  const run = (): void => {
    if (userCleanup) {
      userCleanup()
      userCleanup = undefined
    }
    owner.clearDependencies()
    runTracked(owner, () => {
      userCleanup = fn() ?? undefined
    })
    devtools.recordEffectRun(owner)
  }

  owner.run = run
  devtools.registerEffect(owner)

  if (options?.defer) {
    queueMicrotask(run)
  } else {
    run()
  }

  return {
    dispose: () => {
      if (userCleanup) {
        userCleanup()
        userCleanup = undefined
      }
      devtools.disposeOwner(owner)
      owner.dispose()
    },
  }
}

export function batch<T>(fn: () => T): T {
  return runBatch(fn)
}

export { isTracking, runUntracked, startTracking, stopTracking, trackDependency } from './context.js'
