import type {
  TemplateCaseNode,
  TemplateEachNode,
  TemplateIfNode,
  TemplateNode,
} from '../types.js'
import { lowerBindingSource } from './source.js'
import type { BindingSource, LowerSourceContext } from './types.js'

/** Control-flow IR — shared test/key/source for client + SSR. */
export type IfFlowPlan = {
  kind: 'if'
  branches: { test: string; children: TemplateNode[] }[]
  elseChildren: TemplateNode[]
  sourceLine?: number | undefined
}

export type CaseFlowPlan = {
  kind: 'case'
  scrutinee: string
  branches: { value: string; children: TemplateNode[] }[]
  elseChildren: TemplateNode[]
  sourceLine?: number | undefined
}

export type ListFlowPlan = {
  kind: 'list'
  sourceExpr: string
  sourceBinding: Extract<BindingSource, { kind: 'signal' }> | null
  itemName: string
  indexName: string
  keyExpr: string | null
  /** Client `getKey` callback source. */
  getKey: string
  children: TemplateNode[]
  sourceLine?: number | undefined
}

export type FlowPlan = IfFlowPlan | CaseFlowPlan | ListFlowPlan

export function lowerIf(node: TemplateIfNode): IfFlowPlan {
  return {
    kind: 'if',
    branches: node.branches.map((b) => ({
      test: b.condition,
      children: b.children,
    })),
    elseChildren: node.elseChildren,
    sourceLine: node.sourceLine,
  }
}

export function lowerCase(node: TemplateCaseNode): CaseFlowPlan {
  return {
    kind: 'case',
    scrutinee: node.scrutinee,
    branches: node.branches.map((b) => ({
      value: b.value,
      children: b.children,
    })),
    elseChildren: node.elseChildren,
    sourceLine: node.sourceLine,
  }
}

export function lowerEach(
  node: TemplateEachNode,
  ctx: LowerSourceContext,
): ListFlowPlan {
  const indexName = node.indexName ?? '_index'
  const keyExpr = node.keyExpr ?? null
  const getKey = keyExpr
    ? `(${node.itemName}, ${indexName}) => ${keyExpr}`
    : `(${node.itemName}, ${indexName}) => ${indexName}`

  const source = lowerBindingSource(node.source, ctx)
  const sourceBinding = source.kind === 'signal' ? source : null

  return {
    kind: 'list',
    sourceExpr: node.source,
    sourceBinding,
    itemName: node.itemName,
    indexName,
    keyExpr,
    getKey,
    children: node.children,
    sourceLine: node.sourceLine,
  }
}
