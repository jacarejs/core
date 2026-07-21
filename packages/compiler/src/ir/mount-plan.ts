import type { TemplateAST, TemplateNode, TextPart } from '../types.js'
import { lowerComponent, type ComponentPlan } from './lower-component.js'
import {
  lowerCase,
  lowerEach,
  lowerIf,
  type CaseFlowPlan,
  type IfFlowPlan,
  type ListFlowPlan,
} from './lower-flow.js'
import { lowerElementBindings, lowerTextParts } from './lower-leaf.js'
import { optimizeIfPlan, type OptimizedIf } from './optimize.js'
import type { LeafBindingOp, LowerLeafContext, LoweredText } from './types.js'

export type MountPlan =
  | { kind: 'text'; lowered: LoweredText; parts: TextPart[] }
  | {
      kind: 'element'
      tag: string
      bindings: LeafBindingOp[]
      children: MountPlan[]
      sourceLine?: number
    }
  | { kind: 'component'; plan: ComponentPlan }
  | { kind: 'slot'; name?: string; sourceLine?: number }
  | { kind: 'if'; optimized: OptimizedIf }
  | { kind: 'case'; plan: CaseFlowPlan }
  | { kind: 'list'; plan: ListFlowPlan }
  | {
      kind: 'debug'
      expr: string
      label?: string
      copy?: boolean
      sourceLine?: number
    }

/** Lower a template forest into a MountPlan list (shared client/SSR walk). */
export function lowerMountForest(
  nodes: TemplateNode[],
  ctx: LowerLeafContext,
): MountPlan[] {
  return nodes.map((node) => lowerMountNode(node, ctx))
}

export function lowerMountAst(ast: TemplateAST, ctx: LowerLeafContext): MountPlan[] {
  return lowerMountForest(ast.children, ctx)
}

function lowerMountNode(node: TemplateNode, ctx: LowerLeafContext): MountPlan {
  switch (node.type) {
    case 'text':
      return { kind: 'text', parts: node.parts, lowered: lowerTextParts(node.parts, ctx) }
    case 'element': {
      const plan: MountPlan = {
        kind: 'element',
        tag: node.tag,
        bindings: lowerElementBindings(node.attrs, ctx),
        children: lowerMountForest(node.children, ctx),
      }
      if (node.sourceLine != null) plan.sourceLine = node.sourceLine
      return plan
    }
    case 'component':
      return { kind: 'component', plan: lowerComponent(node, ctx) }
    case 'slot': {
      const plan: MountPlan = { kind: 'slot' }
      if (node.name != null) plan.name = node.name
      if (node.sourceLine != null) plan.sourceLine = node.sourceLine
      return plan
    }
    case 'if':
      return { kind: 'if', optimized: optimizeIfPlan(lowerIf(node)) }
    case 'case':
      return { kind: 'case', plan: lowerCase(node) }
    case 'each':
      return { kind: 'list', plan: lowerEach(node, ctx) }
    case 'debug': {
      const plan: MountPlan = { kind: 'debug', expr: node.expr }
      if (node.label != null) plan.label = node.label
      if (node.copy != null) plan.copy = node.copy
      if (node.sourceLine != null) plan.sourceLine = node.sourceLine
      return plan
    }
  }
}
