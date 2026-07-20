import { runScreenLifecycle, type ScreenLifecycle } from '../lifecycle.js'
import { screenProps } from './route.js'
import type { NavContext, NavMount } from './types.js'

export type ScreenModuleMount = (
  target: HTMLElement,
  props?: Record<string, unknown>,
) => () => void

export type ScreenTitle = string | ((ctx: NavContext) => string)

export interface ScreenModule {
  mount?: ScreenModuleMount
  default?: ScreenModuleMount
  lifecycle?: ScreenLifecycle
  /** Document title applied when the screen activates. */
  title?: ScreenTitle
}

export function adaptScreen(mount: ScreenModuleMount): NavMount {
  return (host, ctx) => mount(host, screenProps(ctx))
}

export function applyScreenTitle(title: ScreenTitle | undefined, ctx: NavContext): void {
  if (title == null) return
  const next = typeof title === 'function' ? title(ctx) : title
  if (typeof next === 'string' && next.length > 0) {
    document.title = next
  }
}

export function screen(mod: ScreenModuleMount | ScreenModule): NavMount {
  const raw = typeof mod === 'function' ? mod : (mod.mount ?? mod.default)
  if (!raw) {
    throw new Error('Jacaré nav: screen module has no mount export')
  }
  const lifecycle = typeof mod === 'function' ? undefined : mod.lifecycle
  const title = typeof mod === 'function' ? undefined : mod.title
  const adapted = adaptScreen(raw)

  return (host, ctx) => {
    const cleanups: Array<() => void> = []

    applyScreenTitle(title, ctx)

    const activateCleanup = runScreenLifecycle(lifecycle, 'activate', ctx)
    if (typeof activateCleanup === 'function') cleanups.push(activateCleanup)

    const mountCleanup = runScreenLifecycle(lifecycle, 'mount')
    if (typeof mountCleanup === 'function') cleanups.push(mountCleanup)

    cleanups.push(adapted(host, ctx))

    return () => {
      runScreenLifecycle(lifecycle, 'deactivate')
      runScreenLifecycle(lifecycle, 'unmount')
      for (const cleanup of cleanups) cleanup()
    }
  }
}
