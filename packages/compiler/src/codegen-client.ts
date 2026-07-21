import type { TemplateAST } from './types.js'
import { append, CodegenContext, type EmitTarget } from './codegen-shared.js'
import { emitContractLinks } from './codegen-links.js'
import type { TemplateContract } from './parse-contract.js'
import type { StyleAST } from './parse-style.js'
import { emitStyleBuild } from './codegen-style.js'
import { emitLeafOp } from './ir/emit-leaf.js'
import type { CaseFlowPlan, IfFlowPlan, ListFlowPlan } from './ir/lower-flow.js'
import {
  emitComponentPropEntry,
  type ComponentPlan,
} from './ir/lower-component.js'
import { lowerMountAst, lowerMountForest, type MountPlan } from './ir/mount-plan.js'
import { markCpwOps, markCpwText, type OptimizedIf } from './ir/optimize.js'
import type { LoweredText } from './ir/types.js'

export function emitClient(
  ast: TemplateAST,
  props: string[],
  ctx: CodegenContext,
  scopeId?: string,
  scopedStyle?: string,
  contract?: TemplateContract,
  styleAst?: StyleAST,
): void {
  const needsPropsObject =
    props.length > 0 || (contract != null && Object.keys(contract.emits).length > 0)

  if (needsPropsObject) {
    ctx.line('export function mount(target, props = {}) {')
    ctx.indent()
    for (const prop of props) {
      const def = contract?.props[prop]
      if (def && 'default' in def) {
        ctx.line(
          `const ${prop} = props[${JSON.stringify(prop)}] ?? ${literalJs(def.default)}`,
        )
      } else {
        ctx.line(`const ${prop} = props[${JSON.stringify(prop)}]`)
      }
    }
    if (contract && Object.keys(contract.emits).length > 0) {
      ctx.line('function emit(name, ...payload) {')
      ctx.indent()
      ctx.line('const handler = props[name]')
      ctx.line('if (typeof handler === "function") handler(...payload)')
      ctx.dedent()
      ctx.line('}')
    }
    ctx.blank()
  } else {
    ctx.line('export function mount(target) {')
    ctx.indent()
  }

  emitContractLinks(ctx, contract)

  if (scopeId || styleAst) {
    if (styleAst) {
      ctx.useRuntime('bindStyleSheet')
      ctx.line('const _cleanups = []')
      ctx.line(
        `${ctx.cleanupVar}.push(bindStyleSheet(target, ${JSON.stringify(scopeId ?? 'local')}, () => {`,
      )
      ctx.indent()
      ctx.line('let _css = ""')
      emitStyleBuild(ctx, styleAst)
      ctx.line('return _css')
      ctx.dedent()
      ctx.line('}))')
    } else if (scopeId) {
      ctx.line(`target.setAttribute('data-jacare-s', ${JSON.stringify(scopeId)})`)
      if (scopedStyle) {
        ctx.useRuntime('ensureScopedStyle')
        ctx.line(`ensureScopedStyle(${JSON.stringify(scopeId)}, ${JSON.stringify(scopedStyle)})`)
      }
      ctx.line('const _cleanups = []')
    } else {
      ctx.line('const _cleanups = []')
    }
  } else {
    ctx.line('const _cleanups = []')
  }

  ctx.line('const _frag = document.createDocumentFragment()')

  for (const plan of lowerMountAst(ast, ctx.leafContext())) {
    emitClientPlan(ctx, plan, { kind: 'parent', name: '_frag' })
  }

  ctx.line('target.appendChild(_frag)')
  ctx.line('return () => { for (const c of _cleanups) c() }')
  ctx.dedent()
  ctx.line('}')
}

function emitClientPlan(ctx: CodegenContext, plan: MountPlan, target: EmitTarget): void {
  switch (plan.kind) {
    case 'text':
      emitLoweredText(ctx, plan.lowered, target)
      return
    case 'element':
      emitElementPlan(ctx, plan, target)
      return
    case 'component':
      emitComponentPlan(ctx, plan.plan, target)
      return
    case 'slot':
      emitSlotPlan(ctx, plan, target)
      return
    case 'if':
      emitOptimizedIf(ctx, plan.optimized, target)
      return
    case 'case':
      emitCasePlan(ctx, plan.plan, target)
      return
    case 'list':
      emitEachPlan(ctx, plan.plan, target)
      return
    case 'debug':
      emitDebugPlan(ctx, plan, target)
      return
  }
}

function emitForest(
  ctx: CodegenContext,
  children: MountPlan[],
  target: EmitTarget,
): void {
  for (const child of children) emitClientPlan(ctx, child, target)
}

function emitNodesAsForest(
  ctx: CodegenContext,
  nodes: Parameters<typeof lowerMountForest>[0],
  target: EmitTarget,
): void {
  emitForest(ctx, lowerMountForest(nodes, ctx.leafContext()), target)
}

function emitDebugPlan(
  ctx: CodegenContext,
  plan: Extract<MountPlan, { kind: 'debug' }>,
  target: EmitTarget,
): void {
  if (!ctx.debug) return

  const host = ctx.nextId('dbg')
  ctx.line(`const ${host} = document.createElement('div')`, plan.sourceLine)
  append(ctx, target, host)
  ctx.useRuntime('bindDebug')
  const readExpr = ctx.rewriteExprForEffect(plan.expr)
  const opts: string[] = []
  if (plan.label) opts.push(`label: ${JSON.stringify(plan.label)}`)
  if (plan.copy) opts.push('copy: true')
  const optsArg = opts.length > 0 ? `{ ${opts.join(', ')} }` : '{}'
  ctx.pushCleanup(`bindDebug(${host}, () => (${readExpr}), ${optsArg})`)
  const signalSrc = ctx.resolveBindingSignal(plan.expr)
  if (signalSrc) {
    ctx.pushDevtoolsBind(signalSrc, host, 'debug', plan.sourceLine)
  }
}

function emitElementPlan(
  ctx: CodegenContext,
  plan: Extract<MountPlan, { kind: 'element' }>,
  target: EmitTarget,
): void {
  const el = ctx.nextId('el')
  ctx.line(`const ${el} = document.createElement('${plan.tag}')`, plan.sourceLine)

  for (const op of markCpwOps(plan.bindings, ctx.cpw)) {
    emitLeafOp(ctx, el, op)
  }

  emitForest(ctx, plan.children, { kind: 'parent', name: el })
  append(ctx, target, el)
}

function emitSlotPlan(
  ctx: CodegenContext,
  plan: Extract<MountPlan, { kind: 'slot' }>,
  target: EmitTarget,
): void {
  const anchor = ctx.nextId('slot')
  ctx.line(`const ${anchor} = document.createElement('span')`, plan.sourceLine)
  append(ctx, target, anchor)
  ctx.useRuntime('mountSlot')
  const slotKey = plan.name ? JSON.stringify(plan.name) : 'undefined'
  ctx.line(`if (typeof children === 'function') {`)
  ctx.indent()
  const dispose = ctx.nextId('slotDispose')
  ctx.line(`const ${dispose} = mountSlot(${anchor}, children, ${slotKey})`)
  ctx.line(`if (${dispose}) _cleanups.push(${dispose})`)
  ctx.dedent()
  ctx.line('}')
}

function emitComponentPlan(
  ctx: CodegenContext,
  plan: ComponentPlan,
  target: EmitTarget,
): void {
  const host = ctx.nextId('cmp')
  ctx.line(`const ${host} = document.createElement('div')`)
  append(ctx, target, host)

  const propsList: string[] = plan.props.map(emitComponentPropEntry)

  if (plan.hasSlots) {
    const slotFn = ctx.nextId('slotFn')
    const slotScope = ctx.nextId('slotCleanups')
    ctx.line(`const ${slotFn} = (slotTarget) => {`)
    ctx.indent()
    ctx.line(`const ${slotScope} = []`)
    ctx.pushCleanupScope(slotScope)
    emitNodesAsForest(ctx, plan.children, { kind: 'parent', name: 'slotTarget' })
    ctx.popCleanupScope()
    ctx.line(`return () => { for (const c of ${slotScope}) c() }`)
    ctx.dedent()
    ctx.line('}')
    propsList.push(`children: ${slotFn}`)
  }

  const propsArg = propsList.length > 0 ? `{ ${propsList.join(', ')} }` : '{}'
  const dispose = ctx.nextId('cmpDispose')
  ctx.useRuntime('runUntracked')
  ctx.line(`let ${dispose}`)
  ctx.line(`runUntracked(() => { ${dispose} = ${plan.name}(${host}, ${propsArg}) })`)
  ctx.pushCleanup(dispose)
}

function emitOptimizedIf(
  ctx: CodegenContext,
  optimized: OptimizedIf,
  target: EmitTarget,
): void {
  if (optimized.kind === 'static') {
    emitNodesAsForest(ctx, optimized.children, target)
    return
  }
  emitIfPlan(ctx, optimized.plan, target)
}

function emitIfPlan(ctx: CodegenContext, plan: IfFlowPlan, target: EmitTarget): void {
  const anchor = ctx.nextId('if')
  ctx.line(`const ${anchor} = document.createComment('if')`, plan.sourceLine)
  append(ctx, target, anchor)

  const scope = ctx.nextId('bc')
  ctx.useRuntime('branch')
  ctx.line(`${ctx.cleanupVar}.push(branch(${anchor}, (mount) => {`)
  ctx.indent()
  ctx.line(`const ${scope} = []`)
  ctx.pushCleanupScope(scope)

  for (let i = 0; i < plan.branches.length; i++) {
    const branch = plan.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (${branch.test}) {`)
    ctx.indent()
    emitNodesAsForest(ctx, branch.children, { kind: 'mount', fn: 'mount' })
    ctx.dedent()
    ctx.line('}')
  }

  if (plan.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    emitNodesAsForest(ctx, plan.elseChildren, { kind: 'mount', fn: 'mount' })
    ctx.dedent()
    ctx.line('}')
  }

  ctx.popCleanupScope()
  ctx.line(`return () => { for (const c of ${scope}) c() }`)
  ctx.dedent()
  ctx.line('}))')
}

function emitCasePlan(ctx: CodegenContext, plan: CaseFlowPlan, target: EmitTarget): void {
  const anchor = ctx.nextId('case')
  ctx.line(`const ${anchor} = document.createComment('case')`, plan.sourceLine)
  append(ctx, target, anchor)

  const scope = ctx.nextId('bc')
  const match = ctx.nextId('cv')
  ctx.useRuntime('branch')
  ctx.line(`${ctx.cleanupVar}.push(branch(${anchor}, (mount) => {`)
  ctx.indent()
  ctx.line(`const ${scope} = []`)
  ctx.line(`const ${match} = (${plan.scrutinee})`)
  ctx.pushCleanupScope(scope)

  for (let i = 0; i < plan.branches.length; i++) {
    const branch = plan.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (Object.is(${match}, (${branch.value}))) {`)
    ctx.indent()
    emitNodesAsForest(ctx, branch.children, { kind: 'mount', fn: 'mount' })
    ctx.dedent()
    ctx.line('}')
  }

  if (plan.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    emitNodesAsForest(ctx, plan.elseChildren, { kind: 'mount', fn: 'mount' })
    ctx.dedent()
    ctx.line('}')
  }

  ctx.popCleanupScope()
  ctx.line(`return () => { for (const c of ${scope}) c() }`)
  ctx.dedent()
  ctx.line('}))')
}

function emitEachPlan(ctx: CodegenContext, plan: ListFlowPlan, target: EmitTarget): void {
  const anchor = ctx.nextId('each')
  ctx.line(`const ${anchor} = document.createComment('each')`, plan.sourceLine)
  append(ctx, target, anchor)

  const parentExpr = target.kind === 'parent' ? target.name : `${anchor}.parentNode`
  ctx.useRuntime('reconcileKeyedList')
  if (plan.sourceBinding && target.kind === 'parent') {
    ctx.pushDevtoolsBind(plan.sourceBinding.name, target.name, 'list', plan.sourceLine)
  }
  ctx.line(`${ctx.cleanupVar}.push(reconcileKeyedList({`)
  ctx.indent()
  ctx.line(`parent: ${parentExpr},`)
  ctx.line(`anchor: ${anchor},`)
  ctx.line(`items: () => ${plan.sourceExpr},`)
  ctx.line(`getKey: ${plan.getKey},`)
  ctx.line(`render: (${plan.itemName}, ${plan.indexName}, mount) => {`)
  ctx.indent()

  const itemScope = ctx.nextId('ic')
  ctx.line(`const ${itemScope} = []`)
  ctx.pushCleanupScope(itemScope)

  const children = lowerMountForest(plan.children, ctx.leafContext())
  const root = ctx.nextId('item')
  const singleChild = children.length === 1 ? children[0]! : null

  if (singleChild?.kind === 'element') {
    ctx.line(`const ${root} = document.createElement('${singleChild.tag}')`)
    for (const op of markCpwOps(singleChild.bindings, ctx.cpw)) {
      emitLeafOp(ctx, root, op)
    }
    emitForest(ctx, singleChild.children, { kind: 'parent', name: root })
    ctx.line(`mount(${root})`)
  } else if (singleChild?.kind === 'component') {
    emitClientPlan(ctx, singleChild, { kind: 'mount', fn: 'mount' })
  } else {
    ctx.line(`const ${root} = document.createDocumentFragment()`)
    emitForest(ctx, children, { kind: 'parent', name: root })
    ctx.line(`mount(${root})`)
  }

  ctx.popCleanupScope()
  ctx.line(`return () => { for (const c of ${itemScope}) c() }`)
  ctx.dedent()
  ctx.line('},')
  ctx.dedent()
  ctx.line('}))')
}

function emitLoweredText(
  ctx: CodegenContext,
  lowered: LoweredText,
  target: EmitTarget,
): void {
  const marked = markCpwText(lowered, ctx.cpw)
  if (marked.kind === 'skip') return

  if (marked.kind === 'static') {
    const text = ctx.nextId('text')
    ctx.line(`const ${text} = document.createTextNode(${JSON.stringify(marked.value)})`)
    append(ctx, target, text)
    return
  }

  const textNode = ctx.nextId('text')
  ctx.line(`const ${textNode} = document.createTextNode('')`)
  append(ctx, target, textNode)
  emitLeafOp(ctx, textNode, marked.op)
}

function literalJs(value: unknown): string {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value)
}
