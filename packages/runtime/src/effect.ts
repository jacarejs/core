import { batch as runBatch, OwnerNode, runTracked } from './context.js'
import * as devtools from './devtools/registry.js'
import type { Effect, EffectOptions } from './types.js'

export function effect(fn: () => void | (() => void), options?: EffectOptions): Effect {
  const owner = new OwnerNode()
  let userCleanup: (() => void) | void
  let disposed = false
  const meta =
    options?.name || options?.file || options?.line != null
      ? {
          ...(options.name ? { name: options.name } : {}),
          ...(options.file ? { file: options.file } : {}),
          ...(options.line != null ? { line: options.line } : {}),
        }
      : undefined

  const run = (): void => {
    if (disposed) return
    if (userCleanup) {
      userCleanup()
      userCleanup = undefined
    }
    owner.clearDependencies()
    try {
      runTracked(owner, () => {
        userCleanup = fn() ?? undefined
      })
      devtools.recordEffectRun(owner)
    } catch (error) {
      owner.clearDependencies()
      if (options?.onError) {
        options.onError(error)
        return
      }
      throw error
    }
  }

  owner.run = run
  const id = devtools.registerEffect(owner, meta)
  const handle = {
    dispose: () => {
      if (disposed) return
      disposed = true
      if (userCleanup) {
        userCleanup()
        userCleanup = undefined
      }
      devtools.disposeOwner(owner)
      owner.dispose()
    },
  }
  devtools.attachPulseSource(handle, id)

  if (options?.defer) {
    queueMicrotask(() => {
      try {
        run()
      } catch (error) {
        handle.dispose()
        throw error
      }
    })
  } else {
    try {
      run()
    } catch (error) {
      handle.dispose()
      throw error
    }
  }

  return handle
}

export function batch<T>(fn: () => T): T {
  return runBatch(fn)
}

export {
  flushSync,
  enablePatience,
  disablePatience,
  isPatienceEnabled,
  runAsLane,
} from './context.js'
export type { PatienceLane } from './context.js'

export { isTracking, runUntracked, startTracking, stopTracking, trackDependency } from './context.js'
