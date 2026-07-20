import type {
  TemplateAST,
  TemplateAttr,
  TemplateCaseBranch,
  TemplateIfBranch,
  TemplateNode,
  TextPart,
} from './types.js'
import { readBracedExpression } from './braced-expr.js'
import { JacareCompileError } from './errors.js'

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr', 'slot',
])

const CLOSE_TAG_RE = /^<\/([a-zA-Z][\w-]*)>/
const IF_OPEN_RE = /^#if[ \t]+([^\n]+)|^@if[ \t]+([^\n]+)/
const ELSE_IF_RE = /^#elif[ \t]+([^\n]+)|^@elseif[ \t]+([^\n]+)/
const ELSE_RE = /^#else\b|^@else\b/
const IF_CLOSE_RE = /^#end\b|^@end\b/
const CASE_OPEN_RE = /^#case[ \t]+([^\n]+)/
const WHEN_RE = /^#when[ \t]+([^\n]+)/
const EACH_OPEN_RE = /^#for\s+(.+?)\s+as\s+([\w$]+)(?:\s*,\s*([\w$]+))?(?:\s*\(([^)]+)\))?|^@each\s+(.+?)\s+as\s+([\w$]+)(?:\s*,\s*([\w$]+))?(?:\s*\(([^)]+)\))?/
const EACH_CLOSE_RE = /^#end\b|^@end\b/

function directiveCondition(match: RegExpMatchArray): string {
  return (match[1] ?? match[2] ?? '').trim()
}

function eachGroups(match: RegExpMatchArray): {
  source: string
  itemName: string
  indexName?: string
  keyExpr?: string
} {
  if (match[1] !== undefined) {
    const result: {
      source: string
      itemName: string
      indexName?: string
      keyExpr?: string
    } = {
      source: match[1]!.trim(),
      itemName: match[2]!,
    }
    if (match[3]) result.indexName = match[3]
    if (match[4]?.trim()) result.keyExpr = match[4]!.trim()
    return result
  }
  const result: {
    source: string
    itemName: string
    indexName?: string
    keyExpr?: string
  } = {
    source: match[5]!.trim(),
    itemName: match[6]!,
  }
  if (match[7]) result.indexName = match[7]
  if (match[8]?.trim()) result.keyExpr = match[8]!.trim()
  return result
}

export function parseTemplate(
  source: string,
  options: { filename?: string; baseLine?: number } = {},
): TemplateAST {
  activeParse = {
    source,
    baseLine: options.baseLine ?? 1,
    ...(options.filename ? { filename: options.filename } : {}),
  }
  try {
    const { nodes } = parseNodes(source, 0)
    return { children: nodes }
  } finally {
    activeParse = null
  }
}

interface ActiveParse {
  source: string
  filename?: string
  baseLine: number
}

let activeParse: ActiveParse | null = null

function fail(message: string, pos: number): never {
  const ctx = activeParse!
  const before = ctx.source.slice(0, pos)
  const line = ctx.baseLine + before.split('\n').length - 1
  const column = pos - before.lastIndexOf('\n')
  throw new JacareCompileError(message, {
    ...(ctx.filename ? { filename: ctx.filename } : {}),
    line,
    column,
    source: ctx.source,
  })
}

function templateLineAt(pos: number): number {
  return activeParse!.source.slice(0, pos).split('\n').length
}

function parseNodes(
  source: string,
  pos: number,
  stops: RegExp[] = [],
): { nodes: TemplateNode[]; pos: number } {
  const nodes: TemplateNode[] = []

  while (pos < source.length) {
    while (pos < source.length && /\s/.test(source[pos]!)) {
      pos++
    }

    for (const stop of stops) {
      if (stop.test(source.slice(pos))) {
        return { nodes, pos }
      }
    }

    if (source.startsWith('</', pos)) {
      return { nodes, pos }
    }

    if (source[pos] === '<') {
      const parsed = parseElement(source, pos)
      nodes.push(parsed.node)
      pos = parsed.pos
      continue
    }

    if (source.startsWith('#if', pos) || source.startsWith('@if', pos)) {
      const parsed = parseIfBlock(source, pos)
      nodes.push(parsed.node)
      pos = parsed.pos
      continue
    }

    if (source.startsWith('#case', pos)) {
      const parsed = parseCaseBlock(source, pos)
      nodes.push(parsed.node)
      pos = parsed.pos
      continue
    }

    if (source.startsWith('#when', pos)) {
      fail('unexpected #when outside #case', pos)
    }

    if (
      source.startsWith('#for', pos) ||
      source.startsWith('@each', pos)
    ) {
      const parsed = parseEachBlock(source, pos)
      nodes.push(parsed.node)
      pos = parsed.pos
      continue
    }

    const nextSpecial = findNextSpecial(source, pos, stops)
    const raw = nextSpecial === -1 ? source.slice(pos) : source.slice(pos, nextSpecial)
    pos = nextSpecial === -1 ? source.length : nextSpecial
    const parts = parseTextParts(raw)
    if (parts.length > 0) {
      nodes.push({ type: 'text', parts })
    }
  }

  return { nodes, pos }
}

function findNextSpecial(source: string, pos: number, stops: RegExp[]): number {
  const slice = source.slice(pos)
  const candidates = [
    source.indexOf('<', pos),
    indexOfAny(source, pos, ['#if', '@if', '#case', '#when', '#for', '@each']),
    ...stops.map((stop) => {
      const match = stop.exec(slice)
      return match ? pos + match.index! : -1
    }),
  ].filter((i) => i !== -1 && i >= pos)

  return candidates.length === 0 ? -1 : Math.min(...candidates)
}

function parseElement(source: string, pos: number): { node: TemplateNode; pos: number } {
  if (source[pos] !== '<') {
    fail('invalid tag', pos)
  }

  const closeMatch = CLOSE_TAG_RE.exec(source.slice(pos))
  if (closeMatch) {
    fail(`unexpected closing tag </${closeMatch[1]}>`, pos)
  }

  let cursor = pos + 1
  const tagStart = cursor
  while (cursor < source.length && /[a-zA-Z0-9-]/.test(source[cursor]!)) {
    cursor++
  }

  const tag = source.slice(tagStart, cursor)
  if (!tag) {
    fail('invalid tag', pos)
  }

  const attrStart = cursor
  const tagEnd = findTagClose(source, cursor)
  const attrSource = source.slice(attrStart, tagEnd).trim()
  const selfClosing = attrSource.endsWith('/')
  const attrsText = selfClosing ? attrSource.slice(0, -1).trim() : attrSource

  const isComponent = /^[A-Z]/.test(tag)
  const tagName = isComponent ? tag : tag.toLowerCase()
  const attrs = parseAttrs(attrsText, isComponent)
  const isVoid = !isComponent && (VOID_TAGS.has(tagName) || selfClosing)
  const afterOpen = tagEnd + 1

  if (isComponent) {
    if (selfClosing) {
      return {
        node: { type: 'component', name: tagName, attrs, children: [], selfClosing: true },
        pos: afterOpen,
      }
    }

    const inner = parseNodes(source, afterOpen)
    const closeTag = `</${tagName}>`
    if (!source.startsWith(closeTag, inner.pos)) {
      fail(`expected </${tagName}>`, pos)
    }

    return {
      node: {
        type: 'component',
        name: tagName,
        attrs,
        children: inner.nodes,
        selfClosing: false,
      },
      pos: inner.pos + closeTag.length,
    }
  }

  if (tagName === 'slot') {
    const slotName = attrs.find((a) => a.name === 'name' && a.kind === 'static')?.value
    return {
      node: {
        type: 'slot',
        ...(slotName ? { name: slotName } : {}),
        sourceLine: templateLineAt(pos),
      },
      pos: afterOpen,
    }
  }

  if (isVoid) {
    return {
      node: {
        type: 'element',
        tag: tagName,
        attrs,
        children: [],
        selfClosing: true,
        sourceLine: templateLineAt(pos),
      },
      pos: afterOpen,
    }
  }

  const inner = parseNodes(source, afterOpen)
  const closeTag = `</${tagName}>`
  if (!source.startsWith(closeTag, inner.pos)) {
    fail(`expected </${tagName}>`, pos)
  }

  return {
    node: {
      type: 'element',
      tag: tagName,
      attrs,
      children: inner.nodes,
      selfClosing: false,
      sourceLine: templateLineAt(pos),
    },
    pos: inner.pos + closeTag.length,
  }
}

function findTagClose(source: string, start: number): number {
  let pos = start
  let inString: string | null = null
  let braceDepth = 0

  while (pos < source.length) {
    const char = source[pos]!

    if (inString) {
      if (char === '\\') {
        pos += 2
        continue
      }
      if (char === inString) {
        inString = null
      }
      pos++
      continue
    }

    if (char === '"' || char === "'") {
      inString = char
      pos++
      continue
    }

    if (char === '{') {
      braceDepth++
      pos++
      continue
    }

    if (char === '}') {
      braceDepth--
      pos++
      continue
    }

    if (char === '>' && braceDepth === 0) {
      return pos
    }

    pos++
  }

  fail('unclosed tag', pos)
}

function indexOfAny(source: string, pos: number, needles: string[]): number {
  const hits = needles
    .map((needle) => source.indexOf(needle, pos))
    .filter((index) => index !== -1)
  return hits.length === 0 ? -1 : Math.min(...hits)
}

function parseIfBlock(source: string, pos: number): { node: TemplateNode; pos: number } {
  const open = IF_OPEN_RE.exec(source.slice(pos))
  if (!open) {
    fail('invalid #if', pos)
  }

  const branches: TemplateIfBranch[] = []
  let cursor = pos + open[0].length
  let currentCondition = directiveCondition(open)

  while (true) {
    const chunk = parseNodes(source, cursor, [ELSE_IF_RE, ELSE_RE, IF_CLOSE_RE])
    branches.push({ condition: currentCondition, children: chunk.nodes })
    cursor = chunk.pos
    const rest = source.slice(cursor)

    const closeMatch = IF_CLOSE_RE.exec(rest)
    if (closeMatch) {
      return {
        node: { type: 'if', branches, elseChildren: [], sourceLine: templateLineAt(pos) },
        pos: cursor + closeMatch[0].length,
      }
    }

    const elseIfMatch = ELSE_IF_RE.exec(rest)
    if (elseIfMatch) {
      currentCondition = directiveCondition(elseIfMatch)
      cursor += elseIfMatch[0].length
      continue
    }

    const elseMatch = ELSE_RE.exec(rest)
    if (elseMatch) {
      cursor += elseMatch[0].length
      const elseChunk = parseNodes(source, cursor, [IF_CLOSE_RE])
      const finalClose = IF_CLOSE_RE.exec(source.slice(elseChunk.pos))
      if (!finalClose) {
        fail('expected #end', pos)
      }
      return {
        node: { type: 'if', branches, elseChildren: elseChunk.nodes, sourceLine: templateLineAt(pos) },
        pos: elseChunk.pos + finalClose[0].length,
      }
    }

    fail('unclosed #if block', pos)
  }
}

function parseCaseBlock(source: string, pos: number): { node: TemplateNode; pos: number } {
  const open = CASE_OPEN_RE.exec(source.slice(pos))
  if (!open) {
    fail('invalid #case', pos)
  }

  const scrutinee = open[1]!.trim()
  if (!scrutinee) {
    fail('invalid #case', pos)
  }

  let cursor = pos + open[0].length
  const afterOpen = parseNodes(source, cursor, [WHEN_RE, ELSE_RE, IF_CLOSE_RE])
  if (afterOpen.nodes.length > 0) {
    fail('expected #when after #case', pos)
  }
  cursor = afterOpen.pos

  const branches: TemplateCaseBranch[] = []
  const rest = source.slice(cursor)
  const firstWhen = WHEN_RE.exec(rest)
  if (!firstWhen) {
    fail('expected #when after #case', pos)
  }

  let currentValue = firstWhen[1]!.trim()
  cursor += firstWhen[0].length

  while (true) {
    const chunk = parseNodes(source, cursor, [WHEN_RE, ELSE_RE, IF_CLOSE_RE])
    branches.push({ value: currentValue, children: chunk.nodes })
    cursor = chunk.pos
    const tail = source.slice(cursor)

    const closeMatch = IF_CLOSE_RE.exec(tail)
    if (closeMatch) {
      return {
        node: {
          type: 'case',
          scrutinee,
          branches,
          elseChildren: [],
          sourceLine: templateLineAt(pos),
        },
        pos: cursor + closeMatch[0].length,
      }
    }

    const whenMatch = WHEN_RE.exec(tail)
    if (whenMatch) {
      currentValue = whenMatch[1]!.trim()
      cursor += whenMatch[0].length
      continue
    }

    const elseMatch = ELSE_RE.exec(tail)
    if (elseMatch) {
      cursor += elseMatch[0].length
      const elseChunk = parseNodes(source, cursor, [IF_CLOSE_RE])
      const finalClose = IF_CLOSE_RE.exec(source.slice(elseChunk.pos))
      if (!finalClose) {
        fail('expected #end', pos)
      }
      return {
        node: {
          type: 'case',
          scrutinee,
          branches,
          elseChildren: elseChunk.nodes,
          sourceLine: templateLineAt(pos),
        },
        pos: elseChunk.pos + finalClose[0].length,
      }
    }

    fail('unclosed #case block', pos)
  }
}

function parseEachBlock(source: string, pos: number): { node: TemplateNode; pos: number } {
  const open = EACH_OPEN_RE.exec(source.slice(pos))
  if (!open) {
    fail('invalid #for', pos)
  }

  const groups = eachGroups(open)
  const cursor = pos + open[0].length
  const chunk = parseNodes(source, cursor, [EACH_CLOSE_RE])
  const close = EACH_CLOSE_RE.exec(source.slice(chunk.pos))
  if (!close) {
    fail('expected #end', pos)
  }

  const node: TemplateNode = {
    type: 'each',
    source: groups.source,
    itemName: groups.itemName,
    children: chunk.nodes,
    sourceLine: templateLineAt(pos),
  }

  if (groups.indexName) {
    ;(node as { indexName: string }).indexName = groups.indexName
  }
  if (groups.keyExpr) {
    ;(node as { keyExpr: string }).keyExpr = groups.keyExpr
  }

  return {
    node,
    pos: chunk.pos + close[0].length,
  }
}

function parseTextParts(raw: string): TextPart[] {
  if (!raw) return []

  const parts: TextPart[] = []
  let pos = 0
  let last = 0

  while (pos < raw.length) {
    if (raw[pos] === '{') {
      if (pos > last) {
        parts.push({ type: 'static', value: raw.slice(last, pos) })
      }
      const { expr, end } = readBracedExpression(raw, pos)
      parts.push({ type: 'expr', value: expr })
      pos = end
      last = pos
      continue
    }
    pos++
  }

  if (last < raw.length) {
    parts.push({ type: 'static', value: raw.slice(last) })
  }

  return parts
}

function parseAttrs(source: string, isComponent: boolean): TemplateAttr[] {
  const attrs: TemplateAttr[] = []
  const s = source.trim()
  let pos = 0

  while (pos < s.length) {
    while (pos < s.length && /\s/.test(s[pos]!)) {
      pos++
    }
    if (pos >= s.length) break

    let nameEnd = pos
    while (nameEnd < s.length && !/[\s=>]/.test(s[nameEnd]!)) {
      nameEnd++
    }

    const rawName = s.slice(pos, nameEnd)
    pos = nameEnd

    let value = ''
    let valueIsExpr = false
    while (pos < s.length && /\s/.test(s[pos]!)) {
      pos++
    }

    if (s[pos] === '=') {
      pos++
      while (pos < s.length && /\s/.test(s[pos]!)) {
        pos++
      }

      const quote = s[pos]
      if (quote === '"' || quote === "'") {
        pos++
        const close = s.indexOf(quote, pos)
        value = s.slice(pos, close)
        pos = close + 1
      } else if (s[pos] === '{') {
        const braced = readBracedExpression(s, pos)
        value = braced.expr
        valueIsExpr = true
        pos = braced.end
      }
    }

    if (rawName.startsWith('on-')) {
      attrs.push({ name: rawName.slice(3), kind: 'event', value })
      continue
    }

    if (rawName.startsWith('@')) {
      attrs.push({ name: rawName.slice(1), kind: 'event', value })
      continue
    }

    if (rawName.startsWith('bind-')) {
      attrs.push({
        name: rawName.slice(5),
        kind: 'bind',
        value,
      })
      continue
    }

    if (rawName.startsWith('class-')) {
      attrs.push({ name: rawName.slice(6), kind: 'class', value })
      continue
    }

    if (rawName.startsWith('class:')) {
      attrs.push({ name: rawName.slice(6), kind: 'class', value })
      continue
    }

    if (rawName.startsWith('style---')) {
      attrs.push({ name: rawName.slice(8), kind: 'style', value })
      continue
    }

    if (rawName.startsWith('style:')) {
      attrs.push({ name: rawName.slice(6), kind: 'style', value })
      continue
    }

    if (rawName.startsWith(':')) {
      attrs.push({
        name: rawName.slice(1),
        kind: isComponent ? 'prop' : 'bind',
        value,
      })
      continue
    }

    if (valueIsExpr) {
      attrs.push({ name: rawName, kind: 'expr', value })
      continue
    }

    attrs.push({ name: rawName, kind: 'static', value })
  }

  return attrs
}
