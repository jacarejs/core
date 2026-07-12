export function readBracedExpression(source: string, openBrace: number): { expr: string; end: number } {
  if (source[openBrace] !== '{') {
    throw new Error('Jacaré: expected {')
  }

  const exprEnd = scanBraceEnd(source, openBrace + 1)
  return {
    expr: source.slice(openBrace + 1, exprEnd).trim(),
    end: exprEnd + 1,
  }
}

export function readDollarExpression(source: string, dollarPos: number): { expr: string; end: number } {
  if (source[dollarPos] !== '$' || source[dollarPos + 1] !== '{') {
    throw new Error('Jacaré: expected ${')
  }

  const exprEnd = scanBraceEnd(source, dollarPos + 2)
  return {
    expr: source.slice(dollarPos + 2, exprEnd).trim(),
    end: exprEnd + 1,
  }
}

function scanBraceEnd(source: string, start: number): number {
  let depth = 1
  let pos = start
  let inString: string | null = null

  while (pos < source.length && depth > 0) {
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

    if (char === '"' || char === "'" || char === '`') {
      inString = char
      pos++
      continue
    }

    if (char === '{') {
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0) {
        return pos
      }
    }

    pos++
  }

  throw new Error('Jacaré: unclosed expression')
}
