import type {
  TemplateAST,
  TemplateCaseNode,
  TemplateEachNode,
  TemplateIfNode,
  TemplateNode,
  TextPart,
} from './types.js'
import { CodegenContext, escapeHtml } from './codegen-shared.js'
import type { StyleAST } from './parse-style.js'
import { emitStyleBuild } from './codegen-style.js'
import {
  lowerCase,
  lowerEach,
  lowerIf,
  type CaseFlowPlan,
  type IfFlowPlan,
  type ListFlowPlan,
} from './ir/lower-flow.js'

export function emitSSR(
  ast: TemplateAST,
  props: string[],
  runtimeImports?: Set<string>,
  signals?: ReadonlySet<string>,
  scopeId?: string,
  scopedStyle?: string,
  styleAst?: StyleAST,
  importedNames?: ReadonlySet<string>,
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

  for (const child of ast.children) {
    emitSSRNode(ctx, child)
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

function emitSSRNode(ctx: CodegenContext, node: TemplateNode): void {
  switch (node.type) {
    case 'text':
      emitSSRText(ctx, node.parts)
      break
    case 'element':
      emitSSRElement(ctx, node)
      break
    case 'component':
      ctx.line(`_html += ${node.name}.render ? ${node.name}.render().html : ""`)
      break
    case 'slot':
      ctx.line(`_html += '<span data-jacare-slot="default"></span>'`)
      break
    case 'if':
      emitSSRIf(ctx, node)
      break
    case 'case':
      emitSSRCase(ctx, node)
      break
    case 'each':
      emitSSREach(ctx, node)
      break
    case 'debug':
      break
  }
}

function emitSSRElement(
  ctx: CodegenContext,
  node: Extract<TemplateNode, { type: 'element' }>,
): void {
  const attrs = node.attrs
    .filter((a) => a.kind === 'static')
    .map((a) => `${a.name}="${escapeHtml(a.value)}"`)
    .join(' ')

  const open = attrs.length > 0 ? `<${node.tag} ${attrs}>` : `<${node.tag}>`
  ctx.line(`_html += ${JSON.stringify(open)}`)

  for (const child of node.children) {
    emitSSRNode(ctx, child)
  }

  ctx.line(`_html += ${JSON.stringify(`</${node.tag}>`)}`)
}

function emitSSRIf(ctx: CodegenContext, node: TemplateIfNode): void {
  emitSSRIfPlan(ctx, lowerIf(node))
}

function emitSSRIfPlan(ctx: CodegenContext, plan: IfFlowPlan): void {
  for (let i = 0; i < plan.branches.length; i++) {
    const branch = plan.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (${branch.test}) {`)
    ctx.indent()
    for (const child of branch.children) {
      emitSSRNode(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  if (plan.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of plan.elseChildren) {
      emitSSRNode(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }
}

function emitSSRCase(ctx: CodegenContext, node: TemplateCaseNode): void {
  emitSSRCasePlan(ctx, lowerCase(node))
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
    for (const child of branch.children) {
      emitSSRNode(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  if (plan.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of plan.elseChildren) {
      emitSSRNode(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  ctx.dedent()
  ctx.line(`}`)
}

function emitSSREach(ctx: CodegenContext, node: TemplateEachNode): void {
  emitSSREachPlan(ctx, lowerEach(node, ctx.leafContext()))
}

function emitSSREachPlan(ctx: CodegenContext, plan: ListFlowPlan): void {
  ctx.line(
    `for (let ${plan.indexName} = 0; ${plan.indexName} < (${plan.sourceExpr}).length; ${plan.indexName}++) {`,
  )
  ctx.indent()
  ctx.line(`const ${plan.itemName} = (${plan.sourceExpr})[${plan.indexName}]`)
  for (const child of plan.children) {
    emitSSRNode(ctx, child)
  }
  ctx.dedent()
  ctx.line('}')
}

function emitSSRText(ctx: CodegenContext, parts: TextPart[]): void {
  const onlyStatic = parts.length === 1 && parts[0]!.type === 'static'
  if (onlyStatic) {
    if (parts[0]!.value) {
      ctx.line(`_html += ${JSON.stringify(parts[0]!.value)}`)
    }
    return
  }

  if (parts.length === 1 && parts[0]!.type === 'expr') {
    const expr = parts[0]!.value
    const id = ctx.nextBinding()
    // No preferProp: bare props fall through to expr read (parity with pre-IR SSR).
    const source = ctx.lowerSource(expr)
    ctx.useRuntime('escapeHtml')
    if (source.kind === 'signal' && source.local) {
      ctx.line(
        `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${source.name}())) + '</span>'`,
      )
      ctx.line(`_bindings.push({ id: '${id}', kind: 'signal', read: ${source.name} })`)
    } else if (source.kind === 'signal') {
      const readExpr = `typeof ${source.name} === 'function' ? ${source.name}() : ${source.name}`
      ctx.line(
        `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${readExpr})) + '</span>'`,
      )
      ctx.line(
        `_bindings.push({ id: '${id}', kind: 'expr', read: () => ${readExpr} })`,
      )
    } else {
      const readExpr = `(() => { const _v = (${ctx.rewriteExprForEffect(expr)}); return typeof _v === 'function' ? _v() : _v })()`
      ctx.line(
        `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${readExpr})) + '</span>'`,
      )
      ctx.line(
        `_bindings.push({ id: '${id}', kind: 'expr', read: () => { const _v = (${ctx.rewriteExprForEffect(expr)}); return typeof _v === 'function' ? _v() : _v } })`,
      )
    }
    return
  }

  const hasDynamic = parts.some((p) => p.type === 'expr')
  if (hasDynamic) {
    ctx.useRuntime('escapeHtml')
  }

  const template = parts
    .map((p) => {
      if (p.type === 'static') return escapeHtml(p.value)
      const source = ctx.lowerSource(p.value)
      if (source.kind === 'signal') return `' + escapeHtml(String(${source.name}())) + '`
      return `' + escapeHtml(String(${ctx.rewriteExprForEffect(p.value)})) + '`
    })
    .join('')

  ctx.line(`_html += \`${template}\``)
}
