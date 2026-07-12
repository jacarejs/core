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
  if ((handler as LazyScreen)[LAZY]) return true
  return handler.length === 0
}
