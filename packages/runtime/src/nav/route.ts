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
  let path = pattern
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(value))
  }
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
