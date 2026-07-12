import type { TemplateAST, TemplateEachNode, TemplateIfNode, TemplateNode, TextPart } from './types.js'
import { CodegenContext, escapeHtml, resolveSignalExpr } from './codegen-shared.js'

export function emitSSR(
  ast: TemplateAST,
  props: string[],
  runtimeImports?: Set<string>,
  signals?: ReadonlySet<string>,
): string[] {
  const ctx = new CodegenContext(0, 1, runtimeImports, undefined, signals)

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
    case 'if':
      emitSSRIf(ctx, node)
      break
    case 'each':
      emitSSREach(ctx, node)
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
  for (let i = 0; i < node.branches.length; i++) {
    const branch = node.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (${branch.condition}) {`)
    ctx.indent()
    for (const child of branch.children) {
      emitSSRNode(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }

  if (node.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of node.elseChildren) {
      emitSSRNode(ctx, child)
    }
    ctx.dedent()
    ctx.line('}')
  }
}

function emitSSREach(ctx: CodegenContext, node: TemplateEachNode): void {
  const index = node.indexName ?? '_index'
  ctx.line(`for (let ${index} = 0; ${index} < (${node.source}).length; ${index}++) {`)
  ctx.indent()
  ctx.line(`const ${node.itemName} = (${node.source})[${index}]`)
  for (const child of node.children) {
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
    const src = ctx.resolveSignal(expr)
    ctx.useRuntime('escapeHtml')
    ctx.line(`_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${expr})) + '</span>'`)
    if (src) {
      ctx.line(`_bindings.push({ id: '${id}', kind: 'signal', read: ${src} })`)
    } else {
      ctx.line(`_bindings.push({ id: '${id}', kind: 'expr', read: () => ${expr} })`)
    }
    return
  }

  const hasDynamic = parts.some((p) => p.type === 'expr')
  if (hasDynamic) {
    ctx.useRuntime('escapeHtml')
  }

  const template = parts
    .map((p) =>
      p.type === 'static' ? escapeHtml(p.value) : `' + escapeHtml(String(${p.value})) + '`,
    )
    .join('')

  ctx.line(`_html += \`${template}\``)
}
