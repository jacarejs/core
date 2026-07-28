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
  /** Absolute source line when known (viewStartLine + template offset). */
  line?: number
}

/**
 * Walk a template AST and summarize reactive / control-flow sites from IR.
 * Intended for `jacare check` enrichment, `jacare why file:line`, and LSP hover.
 */
export function inspectTemplateBindings(
  ast: TemplateAST,
  ctx: LowerSourceContext = {},
): BindingSiteInfo[] {
  const sites: BindingSiteInfo[] = []
  walk(ast.children, ctx, sites, undefined)
  return sites
}

function walk(
  nodes: TemplateNode[],
  ctx: LowerSourceContext,
  sites: BindingSiteInfo[],
  parentLine: number | undefined,
): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const lowered = lowerTextParts(node.parts, { ...ctx, cpw: false })
        if (lowered.kind === 'binding') {
          const op = lowered.op
          const site: BindingSiteInfo = {
            kind: 'text',
            label: op.mixed ? '(mixed)' : sourceLabel(op.source),
            mode: op.mode,
            sourceKind: op.mixed ? 'mixed' : op.source.kind,
          }
          if (parentLine != null) site.line = parentLine
          sites.push(site)
        }
        break
      }
      case 'element': {
        const line = node.sourceLine ?? parentLine
        for (const info of inspectAttrs(node.attrs, ctx, line)) sites.push(info)
        walk(node.children, ctx, sites, line)
        break
      }
      case 'component': {
        const plan = lowerComponent(node, ctx)
        for (const prop of plan.props) {
          sites.push({
            kind: 'component',
            label: `${plan.name}.${prop.name}`,
            mode: prop.mode,
            sourceKind: prop.source.kind,
            ...(prop.lazy ? { lazy: true } : {}),
            ...(parentLine != null ? { line: parentLine } : {}),
          })
        }
        if (plan.hasSlots) {
          sites.push({
            kind: 'component',
            label: `${plan.name}.children`,
            mode: 'slot',
            ...(parentLine != null ? { line: parentLine } : {}),
          })
        }
        walk(plan.children, ctx, sites, parentLine)
        break
      }
      case 'if': {
        const plan = lowerIf(node)
        const line = node.sourceLine ?? parentLine
        for (const branch of plan.branches) {
          const site: BindingSiteInfo = { kind: 'if', label: branch.test }
          if (line != null) site.line = line
          sites.push(site)
          walk(branch.children, ctx, sites, line)
        }
        walk(plan.elseChildren, ctx, sites, line)
        break
      }
      case 'case': {
        const plan = lowerCase(node)
        const line = node.sourceLine ?? parentLine
        const site: BindingSiteInfo = { kind: 'case', label: plan.scrutinee }
        if (line != null) site.line = line
        sites.push(site)
        for (const branch of plan.branches) {
          walk(branch.children, ctx, sites, line)
        }
        walk(plan.elseChildren, ctx, sites, line)
        break
      }
      case 'each': {
        const plan = lowerEach(node, ctx)
        const line = node.sourceLine ?? parentLine
        const site: BindingSiteInfo = {
          kind: 'list',
          label: plan.sourceExpr,
          mode: plan.keyExpr ? `key:${plan.keyExpr}` : 'key:index',
        }
        if (plan.sourceBinding) site.sourceKind = plan.sourceBinding.kind
        if (line != null) site.line = line
        sites.push(site)
        walk(plan.children, ctx, sites, line)
        break
      }
      case 'slot':
      case 'debug':
        break
    }
  }
}

function inspectAttrs(
  attrs: TemplateAttr[],
  ctx: LowerSourceContext,
  line: number | undefined,
): BindingSiteInfo[] {
  const leafCtx = { ...ctx, cpw: false }
  return lowerElementBindings(attrs, leafCtx)
    .filter((op) => op.op !== 'staticAttr' && op.op !== 'setClassName')
    .map((op) => {
      let site: BindingSiteInfo
      switch (op.op) {
        case 'attr':
          site = {
            kind: 'attr',
            label: op.name,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
          break
        case 'classToggle':
          site = {
            kind: 'class',
            label: op.className,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
          break
        case 'styleVar':
          site = {
            kind: 'style',
            label: op.cssVar,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
          break
        case 'model':
          site = {
            kind: 'model',
            label: op.prop,
            mode: op.mode,
            sourceKind: op.source.kind,
          }
          break
        case 'event':
          site = { kind: 'event', label: op.name }
          break
        default:
          site = { kind: 'attr', label: '?' }
      }
      if (line != null) site.line = line
      return site
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
