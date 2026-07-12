export function scopeIdFromFilename(filename: string): string {
  let hash = 0
  for (let i = 0; i < filename.length; i++) {
    hash = (hash * 31 + filename.charCodeAt(i)) >>> 0
  }
  return hash.toString(36).slice(0, 8)
}

export function scopeCss(css: string, scopeId: string): string {
  const scope = `[data-jacare-s="${scopeId}"]`
  const blocks = splitCssBlocks(css)
  return blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('@keyframes')) {
        return trimmed
      }
      if (trimmed.startsWith('@media') || trimmed.startsWith('@supports')) {
        const brace = trimmed.indexOf('{')
        if (brace === -1) return trimmed
        const prelude = trimmed.slice(0, brace + 1)
        const inner = trimmed.slice(brace + 1, trimmed.lastIndexOf('}'))
        return prelude + scopeCss(inner, scopeId) + '}'
      }
      const brace = trimmed.indexOf('{')
      if (brace === -1) return trimmed
      const selector = trimmed.slice(0, brace).trim()
      const body = trimmed.slice(brace)
      if (selector.startsWith('@')) return trimmed
      const scoped = selector
        .split(',')
        .map((part) => scopeSelector(part.trim(), scope))
        .join(', ')
      return `${scoped} ${body}`
    })
    .filter(Boolean)
    .join('\n')
}

function scopeSelector(selector: string, scope: string): string {
  if (!selector || selector === ':root' || selector === 'html' || selector === 'body') {
    return scope
  }
  if (selector.startsWith(':global(') && selector.endsWith(')')) {
    return selector.slice(8, -1)
  }
  return `${scope} ${selector}`
}

function splitCssBlocks(css: string): string[] {
  const blocks: string[] = []
  let depth = 0
  let start = 0

  for (let i = 0; i < css.length; i++) {
    const char = css[i]!
    if (char === '{') depth++
    if (char === '}') {
      depth--
      if (depth === 0) {
        blocks.push(css.slice(start, i + 1))
        start = i + 1
      }
    }
  }

  const tail = css.slice(start).trim()
  if (tail) blocks.push(tail)
  return blocks
}
