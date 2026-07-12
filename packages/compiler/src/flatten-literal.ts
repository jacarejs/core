import { readDollarExpression } from './braced-expr.js'
import { JacareCompileError } from './errors.js'

export interface FlattenedView {
  html: string
  start: number
  end: number
}

export function flattenViewLiteral(
  source: string,
  backtickStart: number,
  filename?: string,
): FlattenedView {
  let pos = backtickStart + 1
  let html = ''

  while (pos < source.length) {
    const char = source[pos]!

    if (char === '\\') {
      if (pos + 1 < source.length) {
        html += source[pos + 1]
        pos += 2
        continue
      }
    }

    if (char === '`') {
      return { html, start: backtickStart, end: pos + 1 }
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

  throw new JacareCompileError('Jacaré: unclosed view template literal', {
    ...(filename ? { filename } : {}),
    line: lineAt(source, backtickStart),
    column: columnAt(source, backtickStart),
    source,
  })
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function columnAt(source: string, index: number): number {
  const before = source.slice(0, index)
  return index - before.lastIndexOf('\n')
}

export function findViewTemplates(source: string): FlattenedView[] {
  const views: FlattenedView[] = []
  const re = /\bview\s*`/g
  let match: RegExpExecArray | null

  while ((match = re.exec(source)) !== null) {
    const backtick = match.index + match[0].length - 1
    const flat = flattenViewLiteral(source, backtick)
    views.push(flat)
    re.lastIndex = flat.end
  }

  return views
}
