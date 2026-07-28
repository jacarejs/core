import { computed } from '../computed.js'
import type { Computed } from '../types.js'
import { buildPath } from './match.js'
import type { NavContext, NavPlace } from './types.js'

export function screenProps(ctx: NavContext): Record<string, unknown> {
  return {
    ...ctx.params,
    ...ctx.search,
    path: ctx.path,
    params: ctx.params,
    search: ctx.search,
  }
}

export function routeHref(
  pattern: string,
  params: Record<string, string> = {},
  search?: Record<string, string>,
): string {
  const path = pattern.replace(/:([A-Za-z_][\w]*)(\*)?/g, (segment, name: string, splat?: string) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) return segment
    const value = params[name]!
    if (splat) {
      return value
        .split('/')
        .filter(Boolean)
        .map((part) => encodeURIComponent(part))
        .join('/')
    }
    return encodeURIComponent(value)
  })
  return buildPath(path, search)
}

export function createRoute(place: () => NavPlace): {
  path: Computed<string>
  param: (name: string) => Computed<string | undefined>
  search: (name: string) => Computed<string | undefined>
} {
  return {
    path: computed(() => place().path),
    param: (name: string) => computed(() => place().params[name]),
    search: (name: string) => computed(() => place().search[name]),
  }
}

export function routeParam(ctx: NavContext, name: string): string | undefined {
  return ctx.params[name]
}

export function routeSearch(ctx: NavContext, name: string): string | undefined {
  return ctx.search[name]
}

/**
 * Template sugar `${@route/id}` — returns a getter that tracks the active nav place.
 * Compatible with createRoute(nav.where); does not replace it.
 */
export function getRouteParam(name: string): () => string | undefined {
  return () => {
    try {
      const g = globalThis as typeof globalThis & {
        __JACARE_NAV__?: { nav: { where: () => NavPlace } }
      }
      return g.__JACARE_NAV__?.nav.where().params[name]
    } catch {
      return undefined
    }
  }
}
