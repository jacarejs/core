import type { TemplateAST, TemplateAttr, TemplateNode } from '../types.js'
import type { TemplateContract } from '../parse-contract.js'
import { parseLinkFrom } from '../parse-contract.js'
import { lowerComponent } from './lower-component.js'
import { lowerCase, lowerEach, lowerIf } from './lower-flow.js'
import { lowerElementBindings, lowerTextParts } from './lower-leaf.js'
import type { LowerSourceContext } from './types.js'

/** One Mesh port referenced by a compiled module (IR and/or contract links). */
export type MeshPortUsage = {
  bag: string
  key: string
  /** `bag.key` for import Mesh Ports; `@id/key` for contract links. */
  ref: string
  source: 'mesh' | 'link'
}

/**
 * Collect Mesh ports used by a template + optional contract `links`.
 * Emitted as a bundler slice hint (`/* jacare-mesh-ports: … *​/`).
 */
export function collectMeshPorts(
  ast: TemplateAST,
  ctx: LowerSourceContext = {},
  contract?: TemplateContract,
): MeshPortUsage[] {
  const byRef = new Map<string, MeshPortUsage>()

  const add = (usage: MeshPortUsage) => {
    if (!byRef.has(usage.ref)) byRef.set(usage.ref, usage)
  }

  walk(ast.children, ctx, add)

  if (contract?.links) {
    for (const link of Object.values(contract.links)) {
      try {
        const { bag, key } = parseLinkFrom(link.from)
        add({ bag, key, ref: `@${bag}/${key}`, source: 'link' })
      } catch {
        // invalid links fail at parse time
      }
    }
  }

  return [...byRef.values()].sort((a, b) => a.ref.localeCompare(b.ref))
}

function walk(
  nodes: TemplateNode[],
  ctx: LowerSourceContext,
  add: (usage: MeshPortUsage) => void,
): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const lowered = lowerTextParts(node.parts, { ...ctx, cpw: false })
        if (lowered.kind === 'binding') {
          if (!lowered.op.mixed) noteSource(lowered.op.source, add)
        }
        for (const part of node.parts) {
          if (part.type === 'expr') scanExpr(part.value, ctx, add)
        }
        break
      }
      case 'element':
        for (const op of lowerElementBindings(node.attrs, { ...ctx, cpw: false })) {
          if ('source' in op && op.source) noteSource(op.source, add)
        }
        scanAttrs(node.attrs, ctx, add)
        walk(node.children, ctx, add)
        break
      case 'component': {
        const plan = lowerComponent(node, ctx)
        for (const prop of plan.props) noteSource(prop.source, add)
        scanAttrs(node.attrs, ctx, add)
        walk(plan.children, ctx, add)
        break
      }
      case 'if': {
        const plan = lowerIf(node)
        for (const branch of plan.branches) {
          scanExpr(branch.test, ctx, add)
          walk(branch.children, ctx, add)
        }
        walk(plan.elseChildren, ctx, add)
        break
      }
      case 'case': {
        const plan = lowerCase(node)
        scanExpr(plan.scrutinee, ctx, add)
        for (const branch of plan.branches) walk(branch.children, ctx, add)
        walk(plan.elseChildren, ctx, add)
        break
      }
      case 'each': {
        const plan = lowerEach(node, ctx)
        if (plan.sourceBinding) noteSource(plan.sourceBinding, add)
        scanExpr(plan.sourceExpr, ctx, add)
        walk(plan.children, ctx, add)
        break
      }
      case 'slot':
      case 'debug':
        break
    }
  }
}

function scanAttrs(
  attrs: TemplateAttr[],
  ctx: LowerSourceContext,
  add: (usage: MeshPortUsage) => void,
): void {
  for (const attr of attrs) {
    if (attr.kind === 'static') continue
    scanExpr(attr.value, ctx, add)
  }
}

function scanExpr(
  expr: string,
  ctx: LowerSourceContext,
  add: (usage: MeshPortUsage) => void,
): void {
  if (!ctx.importedNames || ctx.importedNames.size === 0) return
  const re = /\b([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\b/g
  for (const match of expr.matchAll(re)) {
    const bag = match[1]!
    const key = match[2]!
    if (!ctx.importedNames.has(bag)) continue
    if (ctx.signals?.has(bag)) continue
    add({ bag, key, ref: `${bag}.${key}`, source: 'mesh' })
  }
}

function noteSource(
  source: { kind: string; bag?: string; key?: string },
  add: (usage: MeshPortUsage) => void,
): void {
  if (source.kind !== 'mesh' || !source.bag || !source.key) return
  add({
    bag: source.bag,
    key: source.key,
    ref: `${source.bag}.${source.key}`,
    source: 'mesh',
  })
}
