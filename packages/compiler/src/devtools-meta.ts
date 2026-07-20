/**
 * Injects DevTools metadata into pulse/signal/computed/derive/effect/watch calls:
 *   const count = pulse(0)  →  pulse(0, { name: 'count', file: '…', line: N })
 */
export function injectDevtoolsMeta(
  code: string,
  options: { filename?: string; enabled?: boolean; lineMap?: number[] } = {},
): string {
  if (options.enabled === false) return code

  const file = options.filename
  const displayFile = file ? basenamePath(file) : undefined
  const lines = code.split('\n')
  const out: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineNo = options.lineMap?.[i] ?? i + 1
    out.push(rewriteLine(line, lineNo, file, displayFile))
  }

  return out.join('\n')
}

function basenamePath(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || path
}

function rewriteLine(line: string, lineNo: number, file?: string, displayFile?: string): string {
  const reactive = rewriteReactiveDecl(line, lineNo, file, displayFile)
  if (reactive !== line) return reactive
  return rewriteEffectCall(line, lineNo, file, displayFile)
}

function rewriteReactiveDecl(
  line: string,
  lineNo: number,
  file?: string,
  displayFile?: string,
): string {
  const match =
    /^(\s*(?:export\s+)?(?:const|let|var)\s+)([\w$]+)(\s*=\s*)(signal|pulse|computed|derive)(\s*\()/.exec(
      line,
    )
  if (!match) return line

  const [, prefix, name, eq, fn, open] = match
  const callStart = match[0].length - 1
  const parsed = splitCallArgs(line, callStart)
  if (!parsed) return line
  if (parsed.args.length >= 2) return line

  const meta = buildMeta(name!, lineNo, file, displayFile)
  return `${prefix}${name}${eq}${fn}${open}${parsed.inner}, ${meta})${parsed.suffix}`
}

function rewriteEffectCall(
  line: string,
  lineNo: number,
  file?: string,
  displayFile?: string,
): string {
  const named =
    /^(\s*(?:export\s+)?(?:const|let|var)\s+)([\w$]+)(\s*=\s*)(effect|watch)(\s*\()/.exec(line)
  if (named) {
    const [, prefix, name, eq, fn, open] = named
    const callStart = named[0].length - 1
    const parsed = splitCallArgs(line, callStart)
    if (!parsed) return line
    if (parsed.args.length >= 2) return line
    const meta = buildMeta(name!, lineNo, file, displayFile)
    return `${prefix}${name}${eq}${fn}${open}${parsed.inner}, ${meta})${parsed.suffix}`
  }

  const anon = /^(\s*)(effect|watch)(\s*\()/.exec(line)
  if (!anon) return line
  const [, prefix, fn, open] = anon
  const callStart = anon[0].length - 1
  const parsed = splitCallArgs(line, callStart)
  if (!parsed) return line
  if (parsed.args.length >= 2) return line
  const meta = buildMeta(undefined, lineNo, file, displayFile)
  return `${prefix}${fn}${open}${parsed.inner}, ${meta})${parsed.suffix}`
}

function buildMeta(
  name: string | undefined,
  line: number,
  file?: string,
  _displayFile?: string,
): string {
  const parts: string[] = []
  if (name) parts.push(`name: ${JSON.stringify(name)}`)
  if (file) parts.push(`file: ${JSON.stringify(file)}`)
  parts.push(`line: ${line}`)
  return `{ ${parts.join(', ')} }`
}

/** Split a call starting at `(` — returns arg list (top-level commas) and trailing suffix. */
function splitCallArgs(
  source: string,
  openParen: number,
): { inner: string; args: string[]; suffix: string } | null {
  if (source[openParen] !== '(') return null

  let depth = 0
  let inString: string | null = null
  let i = openParen
  const commas: number[] = []

  while (i < source.length) {
    const ch = source[i]!

    if (inString) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === inString) inString = null
      i++
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      i++
      continue
    }

    if (ch === '(' || ch === '[' || ch === '{') {
      depth++
      i++
      continue
    }

    if (ch === ')' || ch === ']' || ch === '}') {
      depth--
      if (depth === 0 && ch === ')') {
        const inner = source.slice(openParen + 1, i).trim()
        const args = inner.length === 0 ? [] : splitTopLevelArgs(inner)
        return {
          inner: source.slice(openParen + 1, i),
          args,
          suffix: source.slice(i + 1),
        }
      }
      i++
      continue
    }

    if (ch === ',' && depth === 1) {
      commas.push(i)
    }

    i++
  }

  return null
}

function splitTopLevelArgs(inner: string): string[] {
  const args: string[] = []
  let depth = 0
  let inString: string | null = null
  let start = 0

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]!
    if (inString) {
      if (ch === '\\') {
        i++
        continue
      }
      if (ch === inString) inString = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      continue
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      depth++
      continue
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      depth--
      continue
    }
    if (ch === ',' && depth === 0) {
      args.push(inner.slice(start, i).trim())
      start = i + 1
    }
  }
  args.push(inner.slice(start).trim())
  return args.filter((a) => a.length > 0)
}
