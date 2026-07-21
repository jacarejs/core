/**
 * Scan JS/TS sources for `createBag('id', …)` and published return keys.
 * Used by `jacare check` to verify contract `links` against the mesh.
 */

export type PublishedBags = Map<string, Set<string>>

export function scanPublishedBags(source: string): PublishedBags {
  const bags: PublishedBags = new Map()
  const re = /\bcreateBag\s*\(\s*(['"])([^'"]+)\1/g
  for (const match of source.matchAll(re)) {
    const id = match[2]!
    const from = match.index ?? 0
    const factoryStart = source.indexOf('{', from + match[0].length)
    if (factoryStart < 0) {
      ensureBag(bags, id)
      continue
    }
    const body = sliceBalanced(source, factoryStart)
    if (!body) {
      ensureBag(bags, id)
      continue
    }
    const keys = extractReturnKeys(body)
    const set = ensureBag(bags, id)
    for (const key of keys) set.add(key)
  }
  return bags
}

export function mergePublishedBags(...maps: PublishedBags[]): PublishedBags {
  const out: PublishedBags = new Map()
  for (const map of maps) {
    for (const [id, keys] of map) {
      const set = ensureBag(out, id)
      for (const key of keys) set.add(key)
    }
  }
  return out
}

function ensureBag(bags: PublishedBags, id: string): Set<string> {
  let set = bags.get(id)
  if (!set) {
    set = new Set()
    bags.set(id, set)
  }
  return set
}

function sliceBalanced(source: string, openBrace: number): string | null {
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

function extractReturnKeys(body: string): string[] {
  const idx = body.lastIndexOf('return')
  if (idx < 0) return []
  let pos = idx + 6
  while (pos < body.length && /\s/.test(body[pos]!)) pos++
  if (body[pos] !== '{') return []
  const objectBody = sliceBalanced(body, pos)
  if (objectBody == null) return []
  return parseObjectKeys(objectBody)
}

function parseObjectKeys(objectBody: string): string[] {
  const keys: string[] = []
  let pos = 0
  while (pos < objectBody.length) {
    pos = skipWs(objectBody, pos)
    if (pos >= objectBody.length) break
    if (objectBody[pos] === ',') {
      pos++
      continue
    }
    const key = readIdent(objectBody, pos) ?? readStringKey(objectBody, pos)
    if (!key) break
    keys.push(key.value)
    pos = key.end
    pos = skipWs(objectBody, pos)
    if (objectBody[pos] === ':') {
      pos++
      pos = skipValue(objectBody, pos)
    }
    pos = skipWs(objectBody, pos)
    if (objectBody[pos] === ',') pos++
  }
  return keys
}

function skipValue(text: string, start: number): number {
  let pos = skipWs(text, start)
  const ch = text[pos]
  if (ch === '{' || ch === '[' || ch === '(') {
    const close = ch === '{' ? '}' : ch === '[' ? ']' : ')'
    let depth = 0
    let inStr: string | null = null
    let escaped = false
    for (let i = pos; i < text.length; i++) {
      const c = text[i]!
      if (inStr) {
        if (escaped) {
          escaped = false
          continue
        }
        if (c === '\\') {
          escaped = true
          continue
        }
        if (c === inStr) inStr = null
        continue
      }
      if (c === "'" || c === '"' || c === '`') {
        inStr = c
        continue
      }
      if (c === ch) depth++
      else if (c === close) {
        depth--
        if (depth === 0) return i + 1
      }
    }
    return text.length
  }
  if (ch === "'" || ch === '"' || ch === '`') {
    const quote = ch
    pos++
    let escaped = false
    while (pos < text.length) {
      const c = text[pos]!
      if (escaped) {
        escaped = false
        pos++
        continue
      }
      if (c === '\\') {
        escaped = true
        pos++
        continue
      }
      if (c === quote) return pos + 1
      pos++
    }
    return text.length
  }
  while (pos < text.length && !/[,}\]]/.test(text[pos]!)) pos++
  return pos
}

function readIdent(
  text: string,
  start: number,
): { value: string; end: number } | null {
  if (!/[A-Za-z_$]/.test(text[start] ?? '')) return null
  let end = start + 1
  while (end < text.length && /[\w$]/.test(text[end]!)) end++
  return { value: text.slice(start, end), end }
}

function readStringKey(
  text: string,
  start: number,
): { value: string; end: number } | null {
  const quote = text[start]
  if (quote !== "'" && quote !== '"') return null
  let pos = start + 1
  let value = ''
  while (pos < text.length) {
    const ch = text[pos]!
    if (ch === '\\' && pos + 1 < text.length) {
      value += text[pos + 1]!
      pos += 2
      continue
    }
    if (ch === quote) return { value, end: pos + 1 }
    value += ch
    pos++
  }
  return null
}

function skipWs(text: string, start: number): number {
  let pos = start
  while (pos < text.length && /\s/.test(text[pos]!)) pos++
  return pos
}
