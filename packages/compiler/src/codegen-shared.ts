import {
  bindingSignalName,
  desugarMeshAddresses,
  lowerBindingSource,
  matchLocalSignal,
} from './ir/source.js'
import type { BindingSource, LowerSourceOptions, LowerLeafContext } from './ir/types.js'

export type { BindingSource, LowerSourceOptions, LowerLeafContext }
export { lowerBindingSource, bindingSignalName, isLocalSignalSource, isDirectCellSource, meshPortExpr, desugarMeshAddresses, matchMeshAddress } from './ir/source.js'
export type { LowerSourceContext } from './ir/types.js'

export function resolveSignalExpr(
  expr: string,
  signals?: ReadonlySet<string>,
): string | null {
  return matchLocalSignal(expr, signals)
}

/** Like resolveSignalExpr, but also accepts imported pulse/derive names. */
export function resolveSignalBinding(
  expr: string,
  signals?: ReadonlySet<string>,
  importedNames?: ReadonlySet<string>,
): string | null {
  return bindingSignalName(lowerBindingSource(expr, { signals, importedNames }))
}

export function rewriteSignalsInExpr(
  expr: string,
  signals?: ReadonlySet<string>,
  extraNames?: ReadonlySet<string>,
): string {
  const names = new Set<string>([...(signals ?? []), ...(extraNames ?? [])])
  if (names.size === 0) return expr
  const sorted = [...names].sort((a, b) => b.length - a.length)
  return mapOutsideStrings(expr, (code) => rewriteBareSignals(code, sorted))
}

function rewriteBareSignals(code: string, sortedNames: string[]): string {
  let out = code
  for (const name of sortedNames) {
    // `{ clicks, fruits }` → `{ clicks: clicks(), fruits: fruits() }`
    const shorthand = new RegExp(`(?<=[{,]\\s*)${escapeRegExp(name)}(?=\\s*[,}])`, 'g')
    out = out.replace(shorthand, `${name}: ${name}()`)

    // Bare reads → `name()`, but skip calls `name(` and object keys `name:`
    // (ternary consequent `? name :` must still rewrite — colon alone is not enough to skip)
    const bare = new RegExp(`(?<![.\\w$])${escapeRegExp(name)}(?![\\w$])`, 'g')
    out = out.replace(bare, (match, offset, full) => {
      const after = full.slice(offset + match.length)
      if (/^\s*\(/.test(after)) return match
      if (/^\s*:/.test(after)) {
        const before = full.slice(0, offset)
        if (/[{,]\s*$/.test(before)) return match
      }
      return `${name}()`
    })
  }
  return out
}

/** Rewrite only code regions; leave quotes / templates / comments intact. */
function mapOutsideStrings(source: string, map: (code: string) => string): string {
  let result = ''
  let i = 0
  let codeStart = 0

  const flush = (end: number) => {
    if (end > codeStart) result += map(source.slice(codeStart, end))
  }

  while (i < source.length) {
    const c = source[i]!

    if (c === "'" || c === '"') {
      flush(i)
      const end = scanQuoted(source, i, c)
      result += source.slice(i, end)
      i = end
      codeStart = i
      continue
    }

    if (c === '`') {
      flush(i)
      const { end, text } = scanTemplate(source, i, map)
      result += text
      i = end
      codeStart = i
      continue
    }

    if (c === '/' && source[i + 1] === '/') {
      flush(i)
      const nl = source.indexOf('\n', i)
      const end = nl === -1 ? source.length : nl
      result += source.slice(i, end)
      i = end
      codeStart = i
      continue
    }

    if (c === '/' && source[i + 1] === '*') {
      flush(i)
      const close = source.indexOf('*/', i + 2)
      const end = close === -1 ? source.length : close + 2
      result += source.slice(i, end)
      i = end
      codeStart = i
      continue
    }

    i++
  }

  flush(source.length)
  return result
}

function scanQuoted(source: string, start: number, quote: string): number {
  let i = start + 1
  while (i < source.length) {
    const c = source[i]!
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === quote) return i + 1
    i++
  }
  return source.length
}

function scanTemplate(
  source: string,
  start: number,
  map: (code: string) => string,
): { end: number; text: string } {
  let text = '`'
  let i = start + 1
  while (i < source.length) {
    const c = source[i]!
    if (c === '\\') {
      text += source.slice(i, i + 2)
      i += 2
      continue
    }
    if (c === '`') {
      text += '`'
      return { end: i + 1, text }
    }
    if (c === '$' && source[i + 1] === '{') {
      const exprStart = i + 2
      const exprEnd = scanBalanced(source, exprStart)
      text += '${' + mapOutsideStrings(source.slice(exprStart, exprEnd), map) + '}'
      i = exprEnd + (exprEnd < source.length && source[exprEnd] === '}' ? 1 : 0)
      continue
    }
    text += c
    i++
  }
  return { end: source.length, text }
}

function scanBalanced(source: string, start: number): number {
  let depth = 1
  let i = start
  while (i < source.length) {
    const c = source[i]!
    if (c === "'" || c === '"') {
      i = scanQuoted(source, i, c)
      continue
    }
    if (c === '`') {
      i = skipTemplate(source, i)
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  return source.length
}

function skipTemplate(source: string, start: number): number {
  let i = start + 1
  while (i < source.length) {
    const c = source[i]!
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === '`') return i + 1
    if (c === '$' && source[i + 1] === '{') {
      const end = scanBalanced(source, i + 2)
      i = end + (end < source.length && source[end] === '}' ? 1 : 0)
      continue
    }
    i++
  }
  return source.length
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export class CodegenContext {
  private lines: string[] = []
  private depth = 0
  private varId = 0
  private cleanupStack = ['_cleanups']
  private mappings: CodegenMapping[] = []
  private readonly runtimeImports: Set<string>
  private readonly componentProps?: ReadonlySet<string> | undefined
  private readonly signals?: ReadonlySet<string> | undefined
  private readonly importedNames?: ReadonlySet<string> | undefined
  readonly cpw: boolean
  readonly debug: boolean
  readonly filename?: string
  bindingId = 0

  constructor(
    private readonly lineOffset = 0,
    private readonly viewStartLine = 1,
    runtimeImports?: Set<string>,
    componentProps?: ReadonlySet<string> | undefined,
    signals?: ReadonlySet<string> | undefined,
    cpw = false,
    debug = true,
    filename?: string,
    importedNames?: ReadonlySet<string> | undefined,
  ) {
    this.runtimeImports = runtimeImports ?? new Set()
    this.componentProps = componentProps
    this.signals = signals
    this.importedNames = importedNames
    this.cpw = cpw
    this.debug = debug
    if (filename) this.filename = filename
  }

  sourceFile(): string | undefined {
    if (!this.filename) return undefined
    const parts = this.filename.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1] || this.filename
  }

  /** Absolute path for editor links when available. */
  sourcePath(): string | undefined {
    return this.filename
  }

  pushDevtoolsBind(
    source: string,
    target: string,
    kind: string,
    templateLine?: number,
  ): void {
    if (!this.debug) return
    const parts = [`kind: ${JSON.stringify(kind)}`]
    const file = this.sourcePath() ?? this.sourceFile()
    if (file) parts.push(`file: ${JSON.stringify(file)}`)
    if (templateLine != null) {
      parts.push(`line: ${this.viewStartLine + templateLine - 1}`)
    }
    this.pushCleanup(`devtoolsBind(${source}, ${target}, { ${parts.join(', ')} })`)
  }

  isComponentProp(name: string): boolean {
    return this.componentProps?.has(name) ?? false
  }

  resolveSignal(expr: string): string | null {
    return resolveSignalExpr(expr, this.signals)
  }

  resolveBindingSignal(expr: string): string | null {
    return resolveSignalBinding(expr, this.signals, this.importedNames)
  }

  /** classify expr once (signal / prop / expr). */
  lowerSource(expr: string, options?: LowerSourceOptions): BindingSource {
    return lowerBindingSource(
      expr,
      {
        signals: this.signals,
        importedNames: this.importedNames,
        componentProps: this.componentProps,
      },
      options,
    )
  }

  /** context for leaf lowering (attrs / text). */
  leafContext(): LowerLeafContext {
    return {
      signals: this.signals,
      importedNames: this.importedNames,
      componentProps: this.componentProps,
      cpw: this.cpw,
    }
  }

  rewriteExprForEffect(expr: string): string {
    // Only rewrite known local signals. Imported names may be plain values
    // (snippet strings, helpers) — forcing `name()` would break those.
    const { code, usesGetBag, usesGetRouteParam } = desugarMeshAddresses(expr)
    if (usesGetBag) this.useRuntime('getBag')
    if (usesGetRouteParam) this.useRuntime('getRouteParam')
    return rewriteSignalsInExpr(code, this.signals)
  }

  useRuntime(name: string): void {
    this.runtimeImports.add(name)
  }

  getMappings(): CodegenMapping[] {
    return this.mappings
  }

  get cleanupVar(): string {
    return this.cleanupStack[this.cleanupStack.length - 1]!
  }

  pushCleanupScope(name: string): void {
    this.cleanupStack.push(name)
  }

  popCleanupScope(): void {
    this.cleanupStack.pop()
  }

  pushCleanup(expr: string): void {
    const match = /^([A-Za-z_$][\w$]*)\(/.exec(expr.trim())
    if (match) {
      this.useRuntime(match[1]!)
    }
    this.line(`${this.cleanupVar}.push(${expr})`)
  }

  nextId(prefix: string): string {
    this.varId++
    return `_${prefix}${this.varId}`
  }

  nextBinding(): string {
    this.bindingId++
    return `b${this.bindingId}`
  }

  line(code: string, templateLine?: number): void {
    const generatedLine = this.lines.length + 1 + this.lineOffset
    if (templateLine !== undefined) {
      this.mappings.push({
        generatedLine,
        originalLine: this.viewStartLine + templateLine - 1,
      })
    }
    this.lines.push(`${'  '.repeat(this.depth)}${code}`)
  }

  blank(): void {
    this.lines.push('')
  }

  indent(): void {
    this.depth++
  }

  dedent(): void {
    this.depth--
  }

  join(): string[] {
    return this.lines
  }
}

export type EmitTarget =
  | { kind: 'parent'; name: string }
  | { kind: 'mount'; fn: string }

export interface CodegenMapping {
  generatedLine: number
  originalLine: number
}

export function append(ctx: CodegenContext, target: EmitTarget, nodeVar: string): void {
  if (target.kind === 'parent') {
    ctx.line(`${target.name}.appendChild(${nodeVar})`)
    return
  }
  ctx.line(`${target.fn}(${nodeVar})`)
}
