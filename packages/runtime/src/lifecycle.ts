import type { NavContext } from './nav/types.js'

export interface ScreenLifecycle {
  onMount?: () => void | (() => void)
  onUnmount?: () => void
  onActivate?: (ctx: NavContext) => void | (() => void)
  onDeactivate?: () => void
}

export function createLifecycle(hooks: ScreenLifecycle): ScreenLifecycle {
  return hooks
}

export function runScreenLifecycle(
  hooks: ScreenLifecycle | undefined,
  phase: 'activate' | 'deactivate' | 'mount' | 'unmount',
  ctx?: NavContext,
): (() => void) | void {
  if (!hooks) return

  if (phase === 'activate' && hooks.onActivate) {
    return hooks.onActivate(ctx!)
  }
  if (phase === 'deactivate' && hooks.onDeactivate) {
    hooks.onDeactivate()
    return
  }
  if (phase === 'mount' && hooks.onMount) {
    return hooks.onMount()
  }
  if (phase === 'unmount' && hooks.onUnmount) {
    hooks.onUnmount()
  }
}
