const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'of',
  'in',
  'true',
  'false',
  'null',
  'undefined',
  'new',
  'typeof',
  'instanceof',
  'class',
  'extends',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'default',
  'as',
  'void',
  'delete',
  'yield',
])

const DIRECTIVES = new Set(['if', 'elif', 'else', 'end', 'for'])

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function span(kind, value) {
  return `<span class="pg-tok pg-tok-${kind}">${escapeHtml(value)}</span>`
}

function readWhile(source, start, test) {
  let end = start
  while (end < source.length && test(source[end], end)) end += 1
  return end
}

function skipString(source, start, quote) {
  let i = start + 1
  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === quote) return i + 1
    if (quote === '`' && ch === '$' && source[i + 1] === '{') {
      i = skipInterpolation(source, i)
      continue
    }
    i += 1
  }
  return i
}

function skipInterpolation(source, start) {
  let i = start + 2
  let depth = 1
  while (i < source.length && depth > 0) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(source, i, ch)
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return i + 1
    }
    i += 1
  }
  return i
}

function highlightInterpolation(source, start, push) {
  push(span('punct', '${'))
  let i = start + 2
  let depth = 1
  const exprStart = i
  while (i < source.length && depth > 0) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipString(source, i, ch)
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) break
    }
    i += 1
  }
  if (i > exprStart) highlightCode(source.slice(exprStart, i), push)
  if (source[i] === '}') {
    push(span('punct', '}'))
    i += 1
  }
  return i
}

function highlightTemplate(source, start, push) {
  let i = start
  push(span('string', '`'))
  i += 1

  while (i < source.length) {
    const ch = source[i]
    if (ch === '\\') {
      push(span('string', source.slice(i, Math.min(i + 2, source.length))))
      i += 2
      continue
    }
    if (ch === '`') {
      push(span('string', '`'))
      return i + 1
    }
    if (ch === '$' && source[i + 1] === '{') {
      i = highlightInterpolation(source, i, push)
      continue
    }
    const textEnd = readWhile(
      source,
      i,
      (c, idx) => c !== '`' && c !== '\\' && !(c === '$' && source[idx + 1] === '{'),
    )
    push(span('string', source.slice(i, textEnd)))
    i = textEnd
  }

  return i
}

function highlightTag(source, start, push) {
  let i = start
  push(span('punct', '<'))
  i += 1

  if (source[i] === '/') {
    push(span('punct', '/'))
    i += 1
  }

  const nameEnd = readWhile(source, i, (c) => /[\w:-]/.test(c))
  if (nameEnd > i) {
    push(span('tag', source.slice(i, nameEnd)))
    i = nameEnd
  }

  while (i < source.length) {
    const ch = source[i]

    if (ch === '>') {
      push(span('punct', '>'))
      return i + 1
    }

    if (ch === '/' && source[i + 1] === '>') {
      push(span('punct', '/>'))
      return i + 2
    }

    if (/\s/.test(ch)) {
      const wsEnd = readWhile(source, i, (c) => /\s/.test(c))
      push(escapeHtml(source.slice(i, wsEnd)))
      i = wsEnd
      continue
    }

    if (ch === "'" || ch === '"') {
      const next = skipString(source, i, ch)
      push(span('string', source.slice(i, next)))
      i = next
      continue
    }

    if (ch === '`') {
      i = highlightTemplate(source, i, push)
      continue
    }

    if (ch === '$' && source[i + 1] === '{') {
      i = highlightInterpolation(source, i, push)
      continue
    }

    if (ch === '=' || ch === ':' || ch === '@' || ch === '.') {
      push(span('punct', ch))
      i += 1
      continue
    }

    const attrEnd = readWhile(source, i, (c) => /[\w:-]/.test(c))
    if (attrEnd > i) {
      push(span('attr', source.slice(i, attrEnd)))
      i = attrEnd
      continue
    }

    push(span('punct', ch))
    i += 1
  }

  return i
}

function highlightCode(source, push) {
  let i = 0

  while (i < source.length) {
    const ch = source[i]

    if (ch === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      const next = end === -1 ? source.length : end
      push(span('comment', source.slice(i, next)))
      i = next
      continue
    }

    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      const next = end === -1 ? source.length : end + 2
      push(span('comment', source.slice(i, next)))
      i = next
      continue
    }

    if (ch === "'" || ch === '"') {
      const next = skipString(source, i, ch)
      push(span('string', source.slice(i, next)))
      i = next
      continue
    }

    if (ch === '`') {
      i = highlightTemplate(source, i, push)
      continue
    }

    if (ch === '<' && /[A-Za-z/]/.test(source[i + 1] || '')) {
      i = highlightTag(source, i, push)
      continue
    }

    if (ch === '#' && /[A-Za-z]/.test(source[i + 1] || '')) {
      const nameEnd = readWhile(source, i + 1, (c) => /[A-Za-z]/.test(c))
      const name = source.slice(i + 1, nameEnd)
      if (DIRECTIVES.has(name)) {
        push(span('directive', source.slice(i, nameEnd)))
        i = nameEnd
        continue
      }
    }

    if (ch === '$' && source[i + 1] === '{') {
      i = highlightInterpolation(source, i, push)
      continue
    }

    if (/[0-9]/.test(ch)) {
      const end = readWhile(source, i, (c) => /[0-9._]/.test(c))
      push(span('number', source.slice(i, end)))
      i = end
      continue
    }

    if (/[A-Za-z_$]/.test(ch)) {
      const end = readWhile(source, i, (c) => /[A-Za-z0-9_$]/.test(c))
      const word = source.slice(i, end)
      push(span(KEYWORDS.has(word) ? 'keyword' : 'ident', word))
      i = end
      continue
    }

    if (/[{}()[\];,.:?=<>!&|+\-*%~^]/.test(ch)) {
      push(span('punct', ch))
      i += 1
      continue
    }

    push(escapeHtml(ch))
    i += 1
  }
}

export function highlightJacare(source) {
  const parts = []
  highlightCode(String(source ?? ''), (chunk) => {
    parts.push(chunk)
  })
  return parts.join('')
}
