/**
 * Static route graph helpers for `jacare check --routes`.
 * Additive — does not change runtime navigation.
 */

const SCREEN_KEY_RE = /(['"])(\/[^'"]*)\1\s*:/g
const GO_ATTR_RE = /\bjacare-go\s*=\s*(['"])(\/[^'"]*)\1/g
const GO_EXPR_RE = /\bjacare-go\s*=\s*\{\s*(['"])(\/[^'"]*)\1\s*\}/g

export function scanNavScreenPatterns(source: string): string[] {
  const patterns: string[] = []
  const marker = /\bscreens\s*:\s*\{/g
  for (const match of source.matchAll(marker)) {
    const open = (match.index ?? 0) + match[0].length - 1
    const body = sliceBalancedObject(source, open)
    if (!body) continue
    SCREEN_KEY_RE.lastIndex = 0
    for (const key of body.matchAll(SCREEN_KEY_RE)) {
      patterns.push(normalizeRoutePath(key[2]!))
    }
  }
  return patterns
}

export function scanStaticGoLinks(source: string): string[] {
  const links: string[] = []
  for (const re of [GO_ATTR_RE, GO_EXPR_RE]) {
    re.lastIndex = 0
    for (const match of source.matchAll(re)) {
      const raw = match[2]!
      if (raw.includes('${') || raw.includes('`')) continue
      if (/^https?:\/\//i.test(raw)) continue
      links.push(normalizeRoutePath(raw.split('?')[0]!.split('#')[0]!))
    }
  }
  return links
}

/** Match a path against a createNav screen pattern (`:param`, `:param*`). */
export function matchScreenPattern(pattern: string, path: string): boolean {
  const patternParts = splitSegments(normalizeRoutePath(pattern))
  const pathParts = splitSegments(normalizeRoutePath(path))
  let pathIndex = 0

  for (let i = 0; i < patternParts.length; i++) {
    const token = patternParts[i]!
    if (token.startsWith(':') && token.endsWith('*')) {
      return i === patternParts.length - 1 && pathIndex < pathParts.length
    }
    if (pathIndex >= pathParts.length) return false
    if (token.startsWith(':')) {
      pathIndex++
      continue
    }
    if (token !== pathParts[pathIndex]) return false
    pathIndex++
  }

  return pathIndex === pathParts.length
}

export function normalizeRoutePath(path: string): string {
  if (!path) return '/'
  const value = path.split('?')[0]!.split('#')[0]!
  const collapsed = value.replace(/\/+/g, '/')
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1)
  }
  return collapsed || '/'
}

function splitSegments(path: string): string[] {
  return normalizeRoutePath(path).split('/').filter(Boolean)
}

function sliceBalancedObject(source: string, openBrace: number): string | null {
  if (source[openBrace] !== '{') return null
  let depth = 0
  let inStr: string | null = null
  let escaped = false
  for (let i = openBrace; i < source.length; i++) {
    const ch = source[i]!
    if (inStr) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === inStr) inStr = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return source.slice(openBrace + 1, i)
    }
  }
  return null
}
