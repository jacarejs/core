import { readDollarExpression } from './braced-expr.js'
import { JacareCompileError } from './errors.js'
import type { FlattenedView } from './flatten-literal.js'

const VIEW_CLOSE_RE = /^<\/view\s*>/i

export function flattenViewBlock(
  source: string,
  openIndex: number,
  filename?: string,
): FlattenedView {
  if (!source.slice(openIndex).toLowerCase().startsWith('<view')) {
    throw new JacareCompileError('Jacaré: expected <view> block', {
      ...(filename ? { filename } : {}),
      line: lineAt(source, openIndex),
      column: columnAt(source, openIndex),
      source,
    })
  }

  let pos = openIndex + '<view'.length
  pos = skipViewOpenTag(source, pos, openIndex, filename)

  let html = ''
  while (pos < source.length) {
    const close = VIEW_CLOSE_RE.exec(source.slice(pos))
    if (close?.index === 0) {
      return { html, start: openIndex, end: pos + close[0].length }
    }

    const char = source[pos]!

    if (char === '\\') {
      if (pos + 1 < source.length) {
        html += source[pos + 1]
        pos += 2
        continue
      }
    }

    if (char === '$' && source[pos + 1] === '{') {
      const { expr, end } = readDollarExpression(source, pos)
      html += `{${expr}}`
      pos = end
      continue
    }

    html += char
    pos++
  }

  throw new JacareCompileError('Jacaré: unclosed <view> block', {
    ...(filename ? { filename } : {}),
    line: lineAt(source, openIndex),
    column: columnAt(source, openIndex),
    source,
  })
}

function skipViewOpenTag(
  source: string,
  pos: number,
  openIndex: number,
  filename?: string,
): number {
  while (pos < source.length) {
    const char = source[pos]!
    if (char === '>') {
      return pos + 1
    }
    if (char === '"' || char === "'") {
      pos = skipQuoted(source, pos)
      continue
    }
    pos++
  }

  throw new JacareCompileError('Jacaré: unclosed <view> opening tag', {
    ...(filename ? { filename } : {}),
    line: lineAt(source, openIndex),
    column: columnAt(source, openIndex),
    source,
  })
}

function skipQuoted(source: string, pos: number): number {
  const quote = source[pos]!
  pos++
  while (pos < source.length) {
    const char = source[pos]!
    if (char === '\\') {
      pos += 2
      continue
    }
    if (char === quote) {
      return pos + 1
    }
    pos++
  }
  return pos
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function columnAt(source: string, index: number): number {
  const before = source.slice(0, index)
  return index - before.lastIndexOf('\n')
}

export function findViewBlocks(source: string, filename?: string): FlattenedView[] {
  const blocks: FlattenedView[] = []
  const re = /(?:export(?:\s+default)?|return)\s+<view\b/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(source)) !== null) {
    const openIndex = source.indexOf('<view', match.index)
    if (openIndex < 0) continue
    const flat = flattenViewBlock(source, openIndex, filename)
    blocks.push(flat)
    re.lastIndex = flat.end
  }

  return blocks
}
