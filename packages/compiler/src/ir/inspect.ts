import type { TemplateAST, TemplateAttr, TemplateNode } from '../types.js'
import { lowerComponent } from './lower-component.js'
import { lowerCase, lowerEach, lowerIf } from './lower-flow.js'
import { lowerElementBindings, lowerTextParts } from './lower-leaf.js'
import type { LowerSourceContext } from './types.js'

/** Compact binding description for check / editor tooling. */
export type BindingSiteInfo = {
  kind:
    | 'text'
    | 'attr'
    | 'class'
    | 'style'
    | 'model'
    | 'event'
    | 'component'
    | 'if'
    | 'case'
    | 'list'
  label: string
  mode?: string
  sourceKind?: string
  lazy?: boolean
}

/**
 * Walk a template AST and summarize reactive / control-flow sites from IR.
 * Intended for `jacare check` enrichment and future LSP hover.
 */
export function inspectTemplateBindings(
  ast: TemplateAST,
  ctx: LowerSourceContext = {},
): BindingSiteInfo[] {
  const sites: BindingSiteInfo[] = []
  walk(ast.children, ctx, sites)
  return sites
}

function walk(
  nodes: TemplateNode[],
  ctx: LowerSourceContext,
  sites: BindingSiteInfo[],
): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const lowered = lowerTextParts(node.parts, { ...ctx, cpw: false })
        if (lowered.kind === 'binding') {
          const op = lowered.op
          sites.push({
            kind: 'text',
            label: op.mixed ? '(mixed)' : sourceLabel(op.source),
            mode: op.mode,
            sourceKind: op.mixed ? 'mixed' : op.source.kind,
          })
        }
        break
      }
      case 'element':
        for (const info of inspectAttrs(node.attrs, ctx)) sites.push(info)
        walk(node.children, ctx, sites)
        break
      case 'component': {
        const plan = lowerComponent(node, ctx)
        for (const prop of plan.props) {
          sites.push({
            kind: 'component',
            label: `${plan.name}.${prop.name}`,
            mode: prop.mode,
            sourceKind: prop.source.kind,
            ...(prop.lazy ? { lazy: true } : {}),
          })
        }
        if (plan.hasSlots) {
          sites.push({
            kind: 'component',
            label: `${plan.name}.children`,
            mode: 'slot',
          })
        }
        walk(plan.children, ctx, sites)
        break
      }
      case 'if': {
        const plan = lowerIf(node)
        for (const branch of plan.branches) {
          sites.push({ kind: 'if', label: branch.test })
          walk(branch.children, ctx, sites)
        }
        walk(plan.elseChildren, ctx, sites)
        break
      }
      case 'case': {
        const plan = lowerCase(node)
        sites.push({ kind: 'case', label: plan.scrutinee })
        for (const branch of plan.branches) {
          walk(branch.children, ctx, sites)
        }
        walk(plan.elseChildren, ctx, sites)
        break
      }
      case 'each': {
        const plan = lowerEach(node, ctx)
        const site: BindingSiteInfo = {
          kind: 'list',
          label: plan.sourceExpr,
          mode: plan.keyExpr ? `key:${plan.keyExpr}` : 'key:index',
        }
        if (plan.sourceBinding) site.sourceKind = plan.sourceBinding.kind
        sites.push(site)
        walk(plan.children, ctx, sites)
        break
      }
      case 'slot':
      case 'debug':
        break
    }
  }
}

function inspectAttrs(attrs: TemplateAttr[], ctx: LowerSourceContext): BindingSiteInfo[] {
  const leafCtx = { ...ctx, cpw: false }
  return lowerElementBindings(attrs, leafCtx)
    .filter((op) => op.op !== 'staticAttr' && op.op !== 'setClassName')
    .map((op) => {
      switch (op.op) {
        case 'attr':
          return {
            kind: 'attr' as const,
            label: op.name,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
        case 'classToggle':
          return {
            kind: 'class' as const,
            label: op.className,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
        case 'styleVar':
          return {
            kind: 'style' as const,
            label: op.cssVar,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
        case 'model':
          return {
            kind: 'model' as const,
            label: op.prop,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
        case 'event':
          return { kind: 'event' as const, label: op.name }
        default:
          return { kind: 'attr' as const, label: '?' }
      }
    })
}

function sourceLabel(source: {
  kind: string
  name?: string
  bag?: string
  key?: string
  code?: string
  value?: string
  address?: boolean
}): string {
  if (source.kind === 'mesh' && source.bag && source.key) {
    return source.address ? `@${source.bag}/${source.key}` : `${source.bag}.${source.key}`
  }
  if (source.kind === 'signal' || source.kind === 'prop') return source.name ?? source.kind
  if (source.kind === 'expr') return source.code ?? 'expr'
  if (source.kind === 'static') return JSON.stringify(source.value)
  return source.kind
}
