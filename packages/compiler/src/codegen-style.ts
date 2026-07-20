import type {
  StyleAST,
  StyleCaseNode,
  StyleForNode,
  StyleIfNode,
  StyleNode,
} from './parse-style.js'
import type { CodegenContext } from './codegen-shared.js'

/** Emit statements that append into `_css` from a style AST. */
export function emitStyleBuild(ctx: CodegenContext, ast: StyleAST): void {
  for (const child of ast.children) {
    emitStyleNode(ctx, child)
  }
}

function emitStyleNode(ctx: CodegenContext, node: StyleNode): void {
  switch (node.type) {
    case 'static':
      if (node.value) {
        ctx.line(`_css += ${JSON.stringify(node.value)}`)
      }
      break
    case 'interp':
      ctx.line(`_css += String((${node.expr}))`)
      break
    case 'if':
      emitStyleIf(ctx, node)
      break
    case 'case':
      emitStyleCase(ctx, node)
      break
    case 'for':
      emitStyleFor(ctx, node)
      break
  }
}

function emitStyleIf(ctx: CodegenContext, node: StyleIfNode): void {
  for (let i = 0; i < node.branches.length; i++) {
    const branch = node.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (${branch.condition}) {`)
    ctx.indent()
    for (const child of branch.children) emitStyleNode(ctx, child)
    ctx.dedent()
    ctx.line('}')
  }
  if (node.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of node.elseChildren) emitStyleNode(ctx, child)
    ctx.dedent()
    ctx.line('}')
  }
}

function emitStyleCase(ctx: CodegenContext, node: StyleCaseNode): void {
  const match = ctx.nextId('cv')
  ctx.line(`{`)
  ctx.indent()
  ctx.line(`const ${match} = (${node.scrutinee})`)
  for (let i = 0; i < node.branches.length; i++) {
    const branch = node.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (Object.is(${match}, (${branch.value}))) {`)
    ctx.indent()
    for (const child of branch.children) emitStyleNode(ctx, child)
    ctx.dedent()
    ctx.line('}')
  }
  if (node.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of node.elseChildren) emitStyleNode(ctx, child)
    ctx.dedent()
    ctx.line('}')
  }
  ctx.dedent()
  ctx.line('}')
}

function emitStyleFor(ctx: CodegenContext, node: StyleForNode): void {
  const src = ctx.nextId('ss')
  const index = node.indexName ?? ctx.nextId('si')
  ctx.line(`{`)
  ctx.indent()
  ctx.line(`const ${src} = (${node.source})`)
  ctx.line(`for (let ${index} = 0; ${index} < ${src}.length; ${index}++) {`)
  ctx.indent()
  ctx.line(`const ${node.itemName} = ${src}[${index}]`)
  for (const child of node.children) emitStyleNode(ctx, child)
  ctx.dedent()
  ctx.line('}')
  ctx.dedent()
  ctx.line('}')
}
