import type { BindingSource, LowerSourceContext, LowerSourceOptions } from './types.js'

const SIGNAL_CALL_RE = /^([A-Za-z_$][\w$]*)\(\)$/
const SIGNAL_REF_RE = /^([A-Za-z_$][\w$]*)$/
/** `cart.count` or `cart.count()` — Mesh Port candidate. */
const MESH_MEMBER_RE = /^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)(?:\(\))?$/
/** `@cart/total` or `@lab-cart/count()` — address Mesh Port sugar. */
const MESH_ADDRESS_RE = /^@([A-Za-z_$][\w$-]*)\/([A-Za-z_$][\w$]*)(?:\(\))?$/
/** `@bag/key` anywhere inside a larger expression. */
const MESH_ADDRESS_IN_EXPR_RE = /@([A-Za-z_$][\w$-]*)\/([A-Za-z_$][\w$]*)/g
const ARROW_RE = /=>/

/**
 * Classify a template expression into a BindingSource.
 * single place for “signal / prop / expr?” (no MountPlan yet).
 */
export function lowerBindingSource(
  expr: string,
  ctx: LowerSourceContext = {},
  options?: LowerSourceOptions,
): BindingSource {
  const trimmed = expr.trim()
  const preferProp = options?.preferProp === true

  if (preferProp) {
    const prop = bareProp(trimmed, ctx)
    if (prop) return prop
  }

  const address = matchMeshAddress(trimmed)
  if (address) return address

  const local = matchLocalSignal(trimmed, ctx.signals)
  if (local) return { kind: 'signal', name: local, local: true }

  const imported = matchImportedSignal(trimmed, ctx.signals, ctx.importedNames)
  if (imported) return { kind: 'signal', name: imported, local: false }

  const mesh = matchMeshMember(trimmed, ctx.signals, ctx.importedNames)
  if (mesh) return mesh

  if (!preferProp) {
    const prop = bareProp(trimmed, ctx)
    if (prop) return prop
  }

  if (MESH_ADDRESS_IN_EXPR_RE.test(trimmed)) {
    MESH_ADDRESS_IN_EXPR_RE.lastIndex = 0
    const { code } = desugarMeshAddresses(expr)
    return {
      kind: 'expr',
      code,
      arrow: ARROW_RE.test(expr),
    }
  }

  return {
    kind: 'expr',
    code: expr,
    arrow: ARROW_RE.test(expr),
  }
}

/** `@cart/total` / `@cart/total()` — bag id Mesh Port (no import). */
export function matchMeshAddress(expr: string): BindingSource | null {
  const match = MESH_ADDRESS_RE.exec(expr.trim())
  if (!match) return null
  return { kind: 'mesh', bag: match[1]!, key: match[2]!, address: true }
}

/**
 * Rewrite `@bag/key` / `@bag/key(...)` inside an expression to `getBag('bag')?.key`.
 * Used for events, `#if`, and mixed exprs.
 */
export function desugarMeshAddresses(expr: string): { code: string; usesGetBag: boolean } {
  let usesGetBag = false
  const code = expr.replace(MESH_ADDRESS_IN_EXPR_RE, (_m, bag: string, key: string) => {
    usesGetBag = true
    return `getBag(${JSON.stringify(bag)})?.${key}`
  })
  return { code, usesGetBag }
}

/** Local signal name — same rules as resolveSignalExpr. */
export function matchLocalSignal(
  expr: string,
  signals?: ReadonlySet<string> | undefined,
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

/** Imported pulse/derive — import arm of resolveSignalBinding. */
export function matchImportedSignal(
  expr: string,
  signals?: ReadonlySet<string> | undefined,
  importedNames?: ReadonlySet<string> | undefined,
): string | null {
  if (!importedNames || importedNames.size === 0) return null
  const trimmed = expr.trim()
  const call = SIGNAL_CALL_RE.exec(trimmed)
  if (call && importedNames.has(call[1]!)) return call[1]!
  const ref = SIGNAL_REF_RE.exec(trimmed)
  if (ref && importedNames.has(ref[1]!) && !signals?.has(ref[1]!)) {
    return ref[1]!
  }
  return null
}

/**
 * Imported bag member — Mesh Port.
 * `cart.count` / `cart.count()` when `cart` is an import (not a local signal).
 */
export function matchMeshMember(
  expr: string,
  signals?: ReadonlySet<string> | undefined,
  importedNames?: ReadonlySet<string> | undefined,
): BindingSource | null {
  if (!importedNames || importedNames.size === 0) return null
  const trimmed = expr.trim()
  const match = MESH_MEMBER_RE.exec(trimmed)
  if (!match) return null
  const bag = match[1]!
  const key = match[2]!
  if (!importedNames.has(bag)) return null
  if (signals?.has(bag)) return null
  return { kind: 'mesh', bag, key }
}

function bareProp(trimmed: string, ctx: LowerSourceContext): BindingSource | null {
  const ref = SIGNAL_REF_RE.exec(trimmed)
  if (ref && ctx.componentProps?.has(ref[1]!)) {
    return { kind: 'prop', name: ref[1]! }
  }
  return null
}

/** Signal / import / mesh port expression used at emit sites. */
export function bindingSignalName(source: BindingSource): string | null {
  if (source.kind === 'signal') return source.name
  if (source.kind === 'mesh') return meshPortExpr(source)
  return null
}

/**
 * Cell capture expression for Mesh Port emit.
 * Import form: `cart.count` — address sugar: `getBag("cart")?.count`.
 */
export function meshPortExpr(source: Extract<BindingSource, { kind: 'mesh' }>): string {
  if (source.address) {
    return `getBag(${JSON.stringify(source.bag)})?.${source.key}`
  }
  return `${source.bag}.${source.key}`
}

/** True when source is a locally declared signal (CPW-eligible path). */
export function isLocalSignalSource(source: BindingSource): boolean {
  return source.kind === 'signal' && source.local
}

/** True when hot path can capture a DependencyCell once (local pulse or Mesh Port). */
export function isDirectCellSource(source: BindingSource): boolean {
  return isLocalSignalSource(source) || source.kind === 'mesh'
}
