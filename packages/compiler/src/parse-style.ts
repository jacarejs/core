import { JacareCompileError } from './errors.js'

export interface StyleStaticNode {
  type: 'static'
  value: string
}

export interface StyleInterpNode {
  type: 'interp'
  expr: string
}

export interface StyleIfBranch {
  condition: string
  children: StyleNode[]
}

export interface StyleIfNode {
  type: 'if'
  branches: StyleIfBranch[]
  elseChildren: StyleNode[]
}

export interface StyleCaseBranch {
  value: string
  children: StyleNode[]
}

export interface StyleCaseNode {
  type: 'case'
  scrutinee: string
  branches: StyleCaseBranch[]
  elseChildren: StyleNode[]
}

export interface StyleForNode {
  type: 'for'
  source: string
  itemName: string
  indexName?: string
  children: StyleNode[]
}

export type StyleNode =
  | StyleStaticNode
  | StyleInterpNode
  | StyleIfNode
  | StyleCaseNode
  | StyleForNode

export interface StyleAST {
  children: StyleNode[]
}

const IF_OPEN_RE = /^#if[ \t]+([^\n]+)/
const ELSE_IF_RE = /^#elif[ \t]+([^\n]+)/
const ELSE_RE = /^#else\b/
const END_RE = /^#end\b/
const CASE_OPEN_RE = /^#case[ \t]+([^\n]+)/
const WHEN_RE = /^#when[ \t]+([^\n]+)/
const FOR_OPEN_RE =
  /^#for\s+(.+?)\s+as\s+([\w$]+)(?:\s*,\s*([\w$]+))?(?:\s*\(([^)]+)\))?/

export function parseStyle(
  source: string,
  options: { filename?: string } = {},
): StyleAST {
  activeStyleParse = {
    source,
    ...(options.filename ? { filename: options.filename } : {}),
  }
  try {
    const { nodes, pos } = parseStyleNodes(source, 0, [])
    if (pos < source.length) {
      const rest = source.slice(pos).trim()
      if (rest) fail(`unexpected style content near ${JSON.stringify(rest.slice(0, 40))}`, pos)
    }
    return { children: nodes }
  } finally {
    activeStyleParse = null
  }
}

export function isReactiveStyle(ast: StyleAST): boolean {
  return styleNodesReactive(ast.children)
}

function styleNodesReactive(nodes: StyleNode[]): boolean {
  for (const node of nodes) {
    if (node.type === 'interp' || node.type === 'if' || node.type === 'case' || node.type === 'for') {
      return true
    }
  }
  return false
}

interface ActiveStyleParse {
  source: string
  filename?: string
}

let activeStyleParse: ActiveStyleParse | null = null

function fail(message: string, pos: number): never {
  const ctx = activeStyleParse!
  const before = ctx.source.slice(0, pos)
  const line = before.split('\n').length
  const column = pos - before.lastIndexOf('\n')
  throw new JacareCompileError(message, {
    ...(ctx.filename ? { filename: ctx.filename } : {}),
    line,
    column,
    source: ctx.source,
  })
}

function parseStyleNodes(
  source: string,
  pos: number,
  stops: RegExp[],
): { nodes: StyleNode[]; pos: number } {
  const nodes: StyleNode[] = []
  let cursor = pos

  while (cursor < source.length) {
    const stopPos = matchStop(source, cursor, stops)
    if (stopPos !== null) {
      return { nodes: mergeStatic(nodes), pos: stopPos }
    }

    const dirPos = matchDirectiveStart(source, cursor)
    if (dirPos === cursor || (dirPos !== -1 && onlyWhitespace(source, cursor, dirPos))) {
      cursor = dirPos === -1 ? cursor : dirPos
      if (source.startsWith('#if', cursor)) {
        const parsed = parseStyleIf(source, cursor)
        nodes.push(parsed.node)
        cursor = parsed.pos
        continue
      }
      if (source.startsWith('#case', cursor)) {
        const parsed = parseStyleCase(source, cursor)
        nodes.push(parsed.node)
        cursor = parsed.pos
        continue
      }
      if (source.startsWith('#for', cursor)) {
        const parsed = parseStyleFor(source, cursor)
        nodes.push(parsed.node)
        cursor = parsed.pos
        continue
      }
      if (
        source.startsWith('#when', cursor) ||
        source.startsWith('#elif', cursor) ||
        source.startsWith('#else', cursor) ||
        source.startsWith('#end', cursor)
      ) {
        return { nodes: mergeStatic(nodes), pos: cursor }
      }
    }

    if (source.startsWith('${', cursor)) {
      const end = findInterpEnd(source, cursor + 2)
      if (end === -1) fail('unclosed ${ in style', cursor)
      nodes.push({ type: 'interp', expr: source.slice(cursor + 2, end).trim() })
      cursor = end + 1
      continue
    }

    const interpAt = source.indexOf('${', cursor)
    const nextDir = matchDirectiveStart(source, cursor + 1)
    let next = source.length
    if (interpAt !== -1) next = Math.min(next, interpAt)
    if (nextDir !== -1) next = Math.min(next, nextDir)
    const nextStop = matchStop(source, cursor + 1, stops)
    if (nextStop !== null) next = Math.min(next, nextStop)

    if (next > cursor) {
      pushStatic(nodes, source.slice(cursor, next))
      cursor = next
      continue
    }

    pushStatic(nodes, source[cursor]!)
    cursor++
  }

  return { nodes: mergeStatic(nodes), pos: cursor }
}

function matchStop(source: string, pos: number, stops: RegExp[]): number | null {
  if (stops.length === 0) return null
  let p = pos
  while (p < source.length && (source[p] === ' ' || source[p] === '\t' || source[p] === '\n' || source[p] === '\r')) {
    p++
  }
  for (const stop of stops) {
    if (stop.test(source.slice(p))) return p
  }
  return null
}

function onlyWhitespace(source: string, from: number, to: number): boolean {
  for (let i = from; i < to; i++) {
    const ch = source[i]!
    if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') return false
  }
  return true
}

function matchDirectiveStart(source: string, pos: number): number {
  if (isStyleDirectiveAt(source, pos)) return pos

  let i = pos
  while (i < source.length) {
    const lineStart = i === 0 || source[i - 1] === '\n'
    if (lineStart) {
      let j = i
      while (j < source.length && (source[j] === ' ' || source[j] === '\t')) j++
      if (isStyleDirectiveAt(source, j) && j >= pos) return j
    }
    const nl = source.indexOf('\n', i)
    if (nl === -1) return -1
    i = nl + 1
  }
  return -1
}

function isStyleDirectiveAt(source: string, pos: number): boolean {
  return (
    source.startsWith('#if', pos) ||
    source.startsWith('#elif', pos) ||
    source.startsWith('#else', pos) ||
    source.startsWith('#end', pos) ||
    source.startsWith('#case', pos) ||
    source.startsWith('#when', pos) ||
    source.startsWith('#for', pos)
  )
}

function parseStyleIf(source: string, pos: number): { node: StyleIfNode; pos: number } {
  const open = IF_OPEN_RE.exec(source.slice(pos))
  if (!open) fail('invalid #if in style', pos)

  const branches: StyleIfBranch[] = []
  let cursor = pos + open[0].length
  let currentCondition = open[1]!.trim()

  while (true) {
    const chunk = parseStyleNodes(source, cursor, [ELSE_IF_RE, ELSE_RE, END_RE])
    branches.push({ condition: currentCondition, children: chunk.nodes })
    cursor = chunk.pos
    const rest = source.slice(cursor)

    const endMatch = END_RE.exec(rest)
    if (endMatch) {
      return { node: { type: 'if', branches, elseChildren: [] }, pos: cursor + endMatch[0].length }
    }

    const elseIfMatch = ELSE_IF_RE.exec(rest)
    if (elseIfMatch) {
      currentCondition = elseIfMatch[1]!.trim()
      cursor += elseIfMatch[0].length
      continue
    }

    const elseMatch = ELSE_RE.exec(rest)
    if (elseMatch) {
      cursor += elseMatch[0].length
      const elseChunk = parseStyleNodes(source, cursor, [END_RE])
      const finalClose = END_RE.exec(source.slice(elseChunk.pos))
      if (!finalClose) fail('expected #end in style', pos)
      return {
        node: { type: 'if', branches, elseChildren: elseChunk.nodes },
        pos: elseChunk.pos + finalClose[0].length,
      }
    }

    fail('unclosed #if in style', pos)
  }
}

function parseStyleCase(source: string, pos: number): { node: StyleCaseNode; pos: number } {
  const open = CASE_OPEN_RE.exec(source.slice(pos))
  if (!open) fail('invalid #case in style', pos)

  const scrutinee = open[1]!.trim()
  let cursor = pos + open[0].length
  const preamble = parseStyleNodes(source, cursor, [WHEN_RE, ELSE_RE, END_RE])
  if (preamble.nodes.length > 0) fail('expected #when after #case in style', pos)
  cursor = preamble.pos

  const firstWhen = WHEN_RE.exec(source.slice(cursor))
  if (!firstWhen) fail('expected #when after #case in style', pos)

  const branches: StyleCaseBranch[] = []
  let currentValue = firstWhen[1]!.trim()
  cursor += firstWhen[0].length

  while (true) {
    const chunk = parseStyleNodes(source, cursor, [WHEN_RE, ELSE_RE, END_RE])
    branches.push({ value: currentValue, children: chunk.nodes })
    cursor = chunk.pos
    const rest = source.slice(cursor)

    const endMatch = END_RE.exec(rest)
    if (endMatch) {
      return {
        node: { type: 'case', scrutinee, branches, elseChildren: [] },
        pos: cursor + endMatch[0].length,
      }
    }

    const whenMatch = WHEN_RE.exec(rest)
    if (whenMatch) {
      currentValue = whenMatch[1]!.trim()
      cursor += whenMatch[0].length
      continue
    }

    const elseMatch = ELSE_RE.exec(rest)
    if (elseMatch) {
      cursor += elseMatch[0].length
      const elseChunk = parseStyleNodes(source, cursor, [END_RE])
      const finalClose = END_RE.exec(source.slice(elseChunk.pos))
      if (!finalClose) fail('expected #end in style', pos)
      return {
        node: { type: 'case', scrutinee, branches, elseChildren: elseChunk.nodes },
        pos: elseChunk.pos + finalClose[0].length,
      }
    }

    fail('unclosed #case in style', pos)
  }
}

function parseStyleFor(source: string, pos: number): { node: StyleForNode; pos: number } {
  const open = FOR_OPEN_RE.exec(source.slice(pos))
  if (!open) fail('invalid #for in style', pos)

  const cursor = pos + open[0].length
  const chunk = parseStyleNodes(source, cursor, [END_RE])
  const close = END_RE.exec(source.slice(chunk.pos))
  if (!close) fail('expected #end in style', pos)

  const node: StyleForNode = {
    type: 'for',
    source: open[1]!.trim(),
    itemName: open[2]!,
    children: chunk.nodes,
  }
  if (open[3]) node.indexName = open[3]

  return { node, pos: chunk.pos + close[0].length }
}

function findInterpEnd(source: string, pos: number): number {
  let depth = 1
  let i = pos
  let quote: string | null = null
  while (i < source.length) {
    const ch = source[i]!
    if (quote) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) quote = null
      i++
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      i++
      continue
    }
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  return -1
}

function pushStatic(nodes: StyleNode[], value: string): void {
  if (!value) return
  nodes.push({ type: 'static', value })
}

function mergeStatic(nodes: StyleNode[]): StyleNode[] {
  const out: StyleNode[] = []
  for (const node of nodes) {
    const prev = out[out.length - 1]
    if (node.type === 'static' && prev?.type === 'static') {
      prev.value += node.value
    } else {
      out.push(node)
    }
  }
  return out
}
