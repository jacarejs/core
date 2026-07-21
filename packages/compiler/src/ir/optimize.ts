import type { TemplateNode, TextPart } from '../types.js'
import type { IfFlowPlan } from './lower-flow.js'
import type { LeafBindingOp, LoweredText } from './types.js'

/** Upgrade bind* modes to cpw when production CPW is enabled. */
export function markCpwOps(ops: LeafBindingOp[], cpw: boolean): LeafBindingOp[] {
  if (!cpw) return ops
  return ops.map((op) => markCpwOp(op))
}

export function markCpwText(lowered: LoweredText, cpw: boolean): LoweredText {
  if (!cpw || lowered.kind !== 'binding') return lowered
  return { kind: 'binding', op: markCpwOp(lowered.op) as Extract<LeafBindingOp, { op: 'text' }> }
}

function markCpwOp(op: LeafBindingOp): LeafBindingOp {
  if (op.op === 'text' && !op.mixed && op.mode === 'bindText' && op.source.kind === 'signal' && op.source.local) {
    return { ...op, mode: 'cpw' }
  }
  if (op.op === 'classToggle' && op.mode === 'bindClass' && op.source.kind === 'signal') {
    return { ...op, mode: 'cpw' }
  }
  if (op.op === 'styleVar' && op.mode === 'bindStyleVar' && op.source.kind === 'signal') {
    return { ...op, mode: 'cpw' }
  }
  if (op.op === 'attr' && op.mode === 'bindAttribute' && (op.source.kind === 'signal' || op.source.kind === 'prop')) {
    return { ...op, mode: 'cpw' }
  }
  return op
}

export type OptimizedIf =
  | { kind: 'branch'; plan: IfFlowPlan }
  | { kind: 'static'; children: TemplateNode[] }

/**
 * Drop constant-false `#if` / `#elif` arms; unwrap when a constant-true arm wins.
 */
export function optimizeIfPlan(plan: IfFlowPlan): OptimizedIf {
  const kept: IfFlowPlan['branches'] = []
  for (const branch of plan.branches) {
    const flag = constBool(branch.test)
    if (flag === true) {
      return { kind: 'static', children: branch.children }
    }
    if (flag === false) continue
    kept.push(branch)
  }
  if (kept.length === 0) {
    return { kind: 'static', children: plan.elseChildren }
  }
  if (kept.length === plan.branches.length) {
    return { kind: 'branch', plan }
  }
  return {
    kind: 'branch',
    plan: { ...plan, branches: kept, elseChildren: plan.elseChildren },
  }
}

function constBool(test: string): boolean | null {
  const t = test.trim()
  if (t === 'true') return true
  if (t === 'false') return false
  return null
}

/** Merge adjacent static text parts (pre-lower convenience). */
export function mergeStaticTextParts(parts: TextPart[]): TextPart[] {
  if (parts.length <= 1) return parts
  const out: TextPart[] = []
  for (const part of parts) {
    const last = out[out.length - 1]
    if (part.type === 'static' && last?.type === 'static') {
      out[out.length - 1] = { type: 'static', value: last.value + part.value }
    } else {
      out.push(part)
    }
  }
  return out
}
