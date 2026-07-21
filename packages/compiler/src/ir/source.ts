import type { BindingSource, LowerSourceContext, LowerSourceOptions } from './types.js'

const SIGNAL_CALL_RE = /^([A-Za-z_$][\w$]*)\(\)$/
const SIGNAL_REF_RE = /^([A-Za-z_$][\w$]*)$/
const ARROW_RE = /=>/

/**
 * Classify a template expression into a BindingSource.
 * Fatia 0 — single place for “signal / prop / expr?” (no MountPlan yet).
 */
export function lowerBindingSource(
  expr: string,
  ctx: LowerSourceContext,
  options?: LowerSourceOptions,
): BindingSource {
  const trimmed = expr.trim()
  const preferProp = options?.preferProp === true

  if (preferProp) {
    const prop = bareProp(trimmed, ctx)
    if (prop) return prop
  }

  const local = matchLocalSignal(trimmed, ctx.signals)
  if (local) return { kind: 'signal', name: local, local: true }

  const imported = matchImportedSignal(trimmed, ctx.signals, ctx.importedNames)
  if (imported) return { kind: 'signal', name: imported, local: false }

  if (!preferProp) {
    const prop = bareProp(trimmed, ctx)
    if (prop) return prop
  }

  return {
    kind: 'expr',
    code: expr,
    arrow: ARROW_RE.test(expr),
  }
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

function bareProp(trimmed: string, ctx: LowerSourceContext): BindingSource | null {
  const ref = SIGNAL_REF_RE.exec(trimmed)
  if (ref && ctx.componentProps?.has(ref[1]!)) {
    return { kind: 'prop', name: ref[1]! }
  }
  return null
}

/** Signal / import name if source is a signal; otherwise null. */
export function bindingSignalName(source: BindingSource): string | null {
  return source.kind === 'signal' ? source.name : null
}

/** True when source is a locally declared signal (CPW-eligible path). */
export function isLocalSignalSource(source: BindingSource): boolean {
  return source.kind === 'signal' && source.local
}
