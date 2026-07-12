import type { NavLoader, NavMount, ScreenEntry, ScreenMatch } from './types.js'
import { isLoader } from './lazy.js'

export function joinPaths(base: string, segment: string): string {
  if (!segment) return base || '/'
  if (segment.startsWith('/')) return normalizePath(segment)
  const left = base === '/' ? '' : base
  return normalizePath(`${left}/${segment}`)
}

export function normalizePath(path: string): string {
  if (!path) return '/'
  const value = path.split('?')[0]!.split('#')[0]!
  const collapsed = value.replace(/\/+/g, '/')
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1)
  }
  return collapsed || '/'
}

export function normalizeScreens(
  screens: Record<string, NavMount | NavLoader>,
  base = '',
): ScreenEntry[] {
  return Object.entries(screens).map(([path, handler]) => {
    const pattern = joinPaths(base, path)
    if (isLoader(handler)) {
      return { pattern, load: handler }
    }
    return { pattern, mount: handler }
  })
}

export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = splitSegments(pattern)
  const pathParts = splitSegments(path)

  if (patternParts.length !== pathParts.length) {
    return null
  }

  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i++) {
    const token = patternParts[i]!
    const value = pathParts[i]!

    if (token.startsWith(':')) {
      params[token.slice(1)] = decodeURIComponent(value)
      continue
    }

    if (token !== value) {
      return null
    }
  }

  return params
}

export function matchScreen(entries: ScreenEntry[], path: string): ScreenMatch | null {
  let best: ScreenMatch | null = null
  let bestScore = -1

  for (const entry of entries) {
    const params = matchPath(entry.pattern, path)
    if (!params) continue

    const score = entry.pattern.length
    if (score >= bestScore) {
      best = { entry, params }
      bestScore = score
    }
  }

  return best
}

function splitSegments(path: string): string[] {
  const normalized = normalizePath(path)
  if (normalized === '/') return []
  return normalized.slice(1).split('/')
}

export function parseSearch(search: string): Record<string, string> {
  const result: Record<string, string> = {}
  const value = search.startsWith('?') ? search.slice(1) : search
  if (!value) return result

  for (const part of value.split('&')) {
    if (!part) continue
    const [rawKey, rawValue = ''] = part.split('=')
    const key = decodeURIComponent(rawKey ?? '')
    if (!key) continue
    result[key] = decodeURIComponent(rawValue)
  }

  return result
}

export function buildPath(path: string, search?: Record<string, string>): string {
  if (!search || Object.keys(search).length === 0) {
    return path
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    params.set(key, value)
  }
  return `${path}?${params.toString()}`
}
