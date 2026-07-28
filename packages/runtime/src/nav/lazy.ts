import type { NavLoader } from './types.js'

const LAZY = Symbol.for('jacare.lazy')

export type LazyScreen = NavLoader & { [LAZY]?: true }

export function lazy(load: NavLoader): LazyScreen {
  const marker = load as LazyScreen
  marker[LAZY] = true
  return marker
}

export function isLoader(handler: unknown): handler is NavLoader {
  if (typeof handler !== 'function') return false
  // Only `lazy(...)` — never infer from arity (zero-arg mounts are valid NavMount).
  return Boolean((handler as LazyScreen)[LAZY])
}
