const SIGNAL_CALL_RE = /^([A-Za-z_$][\w$]*)\(\)$/
const SIGNAL_REF_RE = /^([A-Za-z_$][\w$]*)$/

export function resolveSignalExpr(
  expr: string,
  signals?: ReadonlySet<string>,
): string | null {
  const trimmed = expr.trim()
  const call = SIGNAL_CALL_RE.exec(trimmed)
  if (call) {
    const name = call[1]!
    if (!signals || signals.has(name)) return name
    return null
  }
  const ref = SIGNAL_REF_RE.exec(trimmed)
  if (ref) {
    const name = ref[1]!
    if (signals?.has(name)) return name
    return null
  }
  return null
}

/** Like resolveSignalExpr, but also accepts imported pulse/derive names. */
export function resolveSignalBinding(
  expr: string,
  signals?: ReadonlySet<string>,
  importedNames?: ReadonlySet<string>,
): string | null {
  const known = resolveSignalExpr(expr, signals)
  if (known) return known
  const trimmed = expr.trim()
  const call = SIGNAL_CALL_RE.exec(trimmed)
  if (call && importedNames?.has(call[1]!)) return call[1]!
  const ref = SIGNAL_REF_RE.exec(trimmed)
  if (ref && importedNames?.has(ref[1]!) && !signals?.has(ref[1]!)) {
    return ref[1]!
  }
  return null
}

export function rewriteSignalsInExpr(
  expr: string,
  signals?: ReadonlySet<string>,
  extraNames?: ReadonlySet<string>,
): string {
  const names = new Set<string>([...(signals ?? []), ...(extraNames ?? [])])
  if (names.size === 0) return expr
  let out = expr
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`(?<![.\\w$])${name}(?!\\s*\\()`, 'g')
    out = out.replace(re, `${name}()`)
  }
  return out
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

  rewriteExprForEffect(expr: string): string {
    return rewriteSignalsInExpr(expr, this.signals, this.importedNames)
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
