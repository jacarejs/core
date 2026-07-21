import type { TemplateAST } from './types.js'
import { CodegenContext } from './codegen-shared.js'
import { emitContractLinks } from './codegen-links.js'
import type { StyleAST } from './parse-style.js'
import { emitStyleBuild } from './codegen-style.js'
import { emitComponentPropEntrySSR } from './ir/lower-component.js'
import type { CaseFlowPlan, IfFlowPlan, ListFlowPlan } from './ir/lower-flow.js'
import { emitSSRElementOpen, emitSSRLoweredText } from './ir/emit-ssr-leaf.js'
import {
  lowerMountAst,
  type MountPlan,
} from './ir/mount-plan.js'
import type { OptimizedIf } from './ir/optimize.js'
import type { TemplateContract } from './parse-contract.js'

export function emitSSR(
  ast: TemplateAST,
  props: string[],
  runtimeImports?: Set<string>,
  signals?: ReadonlySet<string>,
  scopeId?: string,
  scopedStyle?: string,
  styleAst?: StyleAST,
  importedNames?: ReadonlySet<string>,
  contract?: TemplateContract,
): string[] {
  const ctx = new CodegenContext(
    0,
    1,
    runtimeImports,
    undefined,
    signals,
    false,
    true,
    undefined,
    importedNames,
  )

  if (props.length > 0) {
    ctx.line('export function render(props = {}) {')
    ctx.indent()
    for (const prop of props) {
      ctx.line(`const ${prop} = props[${JSON.stringify(prop)}]`)
    }
    ctx.blank()
  } else {
    ctx.line('export function render() {')
    ctx.indent()
  }

  emitContractLinks(ctx, contract)

  ctx.line('let _html = ""')
  ctx.line('const _bindings = []')

  if (styleAst && scopeId) {
    ctx.useRuntime('scopeCss')
    ctx.line('let _css = ""')
    emitStyleBuild(ctx, styleAst)
    ctx.line(
      `_html += '<style data-jacare-s="${scopeId}">' + scopeCss(_css, ${JSON.stringify(scopeId)}) + '</style>'`,
    )
  } else if (scopedStyle && scopeId) {
    ctx.line(`_html += '<style data-jacare-s="${scopeId}">' + ${JSON.stringify(scopedStyle)} + '</style>'`)
  }

  const forest = lowerMountAst(ast, ctx.leafContext())
  for (const plan of forest) {
    emitSSRPlan(ctx, plan)
  }

  ctx.line('return { html: _html, state: { bindings: _bindings } }')
  ctx.dedent()
  ctx.line('}')

  return ctx.join()
}

export function emitResume(ast: TemplateAST, props: string[], runtimeImports?: Set<string>): string[] {
  const ctx = new CodegenContext(0, 1, runtimeImports)

  if (props.length > 0) {
    ctx.line('export function resume(target, state, props = {}) {')
    ctx.indent()
    for (const prop of props) {
      ctx.line(`const ${prop} = props[${JSON.stringify(prop)}]`)
    }
    ctx.blank()
  } else {
    ctx.line('export function resume(target, state) {')
    ctx.indent()
  }

  ctx.useRuntime('resumeBindings')
  ctx.line('const _cleanups = resumeBindings(target, state)')
  ctx.line('return () => { for (const c of _cleanups) c() }')
  ctx.dedent()
  ctx.line('}')

  return ctx.join()
}

function emitSSRPlan(ctx: CodegenContext, plan: MountPlan): void {
  switch (plan.kind) {
    case 'text':
      emitSSRLoweredText(ctx, plan.lowered)
      return
    case 'element':
      emitSSRElementOpen(ctx, plan.tag, plan.bindings)
      for (const child of plan.children) emitSSRPlan(ctx, child)
      ctx.line(`_html += ${JSON.stringify(`</${plan.tag}>`)}`)
      return
    case 'component': {
      const propsArg =
        plan.plan.props.length > 0
          ? `{ ${plan.plan.props.map(emitComponentPropEntrySSR).join(', ')} }`
          : '{}'
      ctx.line(
        `_html += ${plan.plan.name}.render ? ${plan.plan.name}.render(${propsArg}).html : ""`,
      )
      return
    }
    case 'slot':
      ctx.line(`_html += '<span data-jacare-slot="default"></span>'`)
      return
    case 'if':
      emitSSROptimizedIf(ctx, plan.optimized)
      return
    case 'case':
      emitSSRCasePlan(ctx, plan.plan)
      return
    case 'list':
      emitSSREachPlan(ctx, plan.plan)
      return
    case 'debug':
      return
  }
}

function emitSSROptimizedIf(ctx: CodegenContext, optimized: OptimizedIf): void {
  if (optimized.kind === 'static') {
    const children = lowerMountAst(
      { children: optimized.children },
      ctx.leafContext(),
    )
    for (const child of children) emitSSRPlan(ctx, child)
    return
  }
  emitSSRIfPlan(ctx, optimized.plan)
}

function emitSSRIfPlan(ctx: CodegenContext, plan: IfFlowPlan): void {
  for (let i = 0; i < plan.branches.length; i++) {
    const branch = plan.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (${branch.test}) {`)
    ctx.indent()
    for (const child of lowerMountAst({ children: branch.children }, ctx.leafContext())) {
      emitSSRPlan(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  if (plan.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of lowerMountAst({ children: plan.elseChildren }, ctx.leafContext())) {
      emitSSRPlan(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }
}

function emitSSRCasePlan(ctx: CodegenContext, plan: CaseFlowPlan): void {
  const match = ctx.nextId('cv')
  ctx.line(`{`)
  ctx.indent()
  ctx.line(`const ${match} = (${plan.scrutinee})`)

  for (let i = 0; i < plan.branches.length; i++) {
    const branch = plan.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (Object.is(${match}, (${branch.value}))) {`)
    ctx.indent()
    for (const child of lowerMountAst({ children: branch.children }, ctx.leafContext())) {
      emitSSRPlan(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  if (plan.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of lowerMountAst({ children: plan.elseChildren }, ctx.leafContext())) {
      emitSSRPlan(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  ctx.dedent()
  ctx.line(`}`)
}

function emitSSREachPlan(ctx: CodegenContext, plan: ListFlowPlan): void {
  ctx.line(
    `for (let ${plan.indexName} = 0; ${plan.indexName} < (${plan.sourceExpr}).length; ${plan.indexName}++) {`,
  )
  ctx.indent()
  ctx.line(`const ${plan.itemName} = (${plan.sourceExpr})[${plan.indexName}]`)
  for (const child of lowerMountAst({ children: plan.children }, ctx.leafContext())) {
    emitSSRPlan(ctx, child)
  }
  ctx.dedent()
  ctx.line('}')
}
