import {
  emitCpwAttribute,
  emitCpwClass,
  emitCpwStyleVar,
  emitCpwText,
} from '../codegen-cpw.js'
import type { CodegenContext } from '../codegen-shared.js'
import type { LeafBindingOp, MixedTextPart } from './types.js'

/** Emit a leaf binding op onto an element or text node. */
export function emitLeafOp(
  ctx: CodegenContext,
  target: string,
  op: LeafBindingOp,
): void {
  switch (op.op) {
    case 'staticAttr':
      if (op.name === 'class') {
        ctx.line(`${target}.className = ${JSON.stringify(op.value)}`)
      } else {
        ctx.line(
          `${target}.setAttribute(${JSON.stringify(op.name)}, ${JSON.stringify(op.value)})`,
        )
      }
      return

    case 'setClassName':
      ctx.line(`${target}.className = String(${op.code})`)
      return

    case 'event': {
      const handler = ctx.nextId('handler')
      ctx.line(`const ${handler} = ${op.handler}`)
      ctx.line(`${ctx.cleanupVar}.push((() => {`)
      ctx.indent()
      ctx.line(`${target}.addEventListener(${JSON.stringify(op.name)}, ${handler})`)
      ctx.line(
        `return () => ${target}.removeEventListener(${JSON.stringify(op.name)}, ${handler})`,
      )
      ctx.dedent()
      ctx.line('})())')
      return
    }

    case 'text':
      emitTextOp(ctx, target, op)
      return

    case 'attr':
      emitAttrOp(ctx, target, op)
      return

    case 'classToggle':
      emitClassOp(ctx, target, op)
      return

    case 'styleVar':
      emitStyleOp(ctx, target, op)
      return

    case 'model':
      emitModelOp(ctx, target, op)
      return
  }
}

function emitTextOp(
  ctx: CodegenContext,
  textNode: string,
  op: Extract<LeafBindingOp, { op: 'text' }>,
): void {
  if (op.mixed) {
    const template = op.parts.map((p) => mixedPartToTemplate(ctx, p)).join('')
    ctx.pushCleanup(`effect(() => { ${textNode}.data = \`${template}\` }).dispose`)
    return
  }

  const { source, mode } = op
  if (mode === 'cpw' && source.kind === 'signal') {
    emitCpwText(ctx, textNode, source.name)
    return
  }
  if (mode === 'bindText' && source.kind === 'signal') {
    ctx.pushCleanup(`bindText(${textNode}, ${source.name})`)
    ctx.pushDevtoolsBind(source.name, textNode, 'text')
    return
  }
  if (mode === 'bindPropText' && (source.kind === 'signal' || source.kind === 'prop')) {
    ctx.pushCleanup(`bindPropText(${textNode}, ${source.name})`)
    if (source.kind === 'signal') {
      ctx.pushDevtoolsBind(source.name, textNode, 'text')
    }
    return
  }
  const raw = source.kind === 'expr' ? source.code : source.kind === 'static' ? JSON.stringify(source.value) : source.name
  ctx.pushCleanup(
    `effect(() => { const _v = (${ctx.rewriteExprForEffect(raw)}); ${textNode}.data = String(typeof _v === 'function' ? _v() : _v) }).dispose`,
  )
}

function mixedPartToTemplate(ctx: CodegenContext, p: MixedTextPart): string {
  if (p.type === 'static') return p.value
  const { source } = p
  if (source.kind === 'prop') {
    return `\${typeof ${source.name} === 'function' ? ${source.name}() : ${source.name} ?? ''}`
  }
  if (source.kind === 'signal') {
    if (source.local) return `\${${source.name}()}`
    return `\${typeof ${source.name} === 'function' ? ${source.name}() : ${source.name} ?? ''}`
  }
  return `\${(() => { const _v = (${ctx.rewriteExprForEffect(p.raw)}); return typeof _v === 'function' ? _v() : _v })()}`
}

function emitAttrOp(
  ctx: CodegenContext,
  el: string,
  op: Extract<LeafBindingOp, { op: 'attr' }>,
): void {
  const { source, mode, name } = op

  if (mode === 'once' && source.kind === 'prop') {
    ctx.line(`${el}.setAttribute(${JSON.stringify(name)}, String(${source.name}))`)
    return
  }

  if (mode === 'bindAttribute' && (source.kind === 'signal' || source.kind === 'prop')) {
    ctx.pushCleanup(`bindAttribute(${el}, ${JSON.stringify(name)}, ${source.name})`)
    ctx.pushDevtoolsBind(source.name, el, 'attr')
    return
  }

  if (mode === 'cpw' && (source.kind === 'signal' || source.kind === 'prop')) {
    emitCpwAttribute(ctx, el, name, source.name)
    return
  }

  // effect
  ctx.useRuntime('effect')
  if (source.kind === 'expr' && source.arrow) {
    ctx.line(`${ctx.cleanupVar}.push(effect(() => {`)
    ctx.indent()
    ctx.line(`const _v = (${source.code})()`)
    ctx.line(
      `if (_v === null || _v === undefined || _v === false) ${el}.removeAttribute(${JSON.stringify(name)})`,
    )
    ctx.line(`else if (_v === true) ${el}.setAttribute(${JSON.stringify(name)}, '')`)
    ctx.line(`else ${el}.setAttribute(${JSON.stringify(name)}, String(_v))`)
    ctx.dedent()
    ctx.line('}).dispose)')
    return
  }

  const raw = source.kind === 'expr' ? source.code : source.kind === 'static' ? JSON.stringify(source.value) : source.name
  const rewritten = ctx.rewriteExprForEffect(raw)
  ctx.line(`${ctx.cleanupVar}.push(effect(() => {`)
  ctx.indent()
  ctx.line(`const _v = ${rewritten}`)
  ctx.line(
    `if (_v === null || _v === undefined || _v === false) ${el}.removeAttribute(${JSON.stringify(name)})`,
  )
  ctx.line(`else if (_v === true) ${el}.setAttribute(${JSON.stringify(name)}, '')`)
  ctx.line(`else ${el}.setAttribute(${JSON.stringify(name)}, String(_v))`)
  ctx.dedent()
  ctx.line('}).dispose)')
}

function emitClassOp(
  ctx: CodegenContext,
  el: string,
  op: Extract<LeafBindingOp, { op: 'classToggle' }>,
): void {
  const { source, mode, className } = op
  if (mode === 'cpw' && source.kind === 'signal') {
    emitCpwClass(ctx, el, className, source.name)
    return
  }
  if (mode === 'bindClass' && source.kind === 'signal') {
    ctx.pushCleanup(`bindClass(${el}, ${JSON.stringify(className)}, ${source.name})`)
    ctx.pushDevtoolsBind(source.name, el, 'class')
    return
  }
  if (source.kind === 'expr' && source.arrow) {
    ctx.pushCleanup(
      `effect(() => { ${el}.classList.toggle(${JSON.stringify(className)}, !!(${source.code})()) }).dispose`,
    )
    return
  }
  const raw = source.kind === 'expr' ? source.code : source.kind === 'static' ? JSON.stringify(source.value) : source.name
  ctx.pushCleanup(
    `effect(() => { ${el}.classList.toggle(${JSON.stringify(className)}, !!(${raw})) }).dispose`,
  )
}

function emitStyleOp(
  ctx: CodegenContext,
  el: string,
  op: Extract<LeafBindingOp, { op: 'styleVar' }>,
): void {
  const { source, mode, cssVar } = op
  if (mode === 'cpw' && source.kind === 'signal') {
    emitCpwStyleVar(ctx, el, cssVar, source.name)
    return
  }
  if (mode === 'bindStyleVar' && source.kind === 'signal') {
    ctx.pushCleanup(`bindStyleVar(${el}, ${JSON.stringify(cssVar)}, ${source.name})`)
    ctx.pushDevtoolsBind(source.name, el, 'style')
    return
  }
  if (source.kind === 'expr' && source.arrow) {
    ctx.pushCleanup(
      `effect(() => { ${el}.style.setProperty(${JSON.stringify(cssVar)}, String((${source.code})())) }).dispose`,
    )
    return
  }
  const raw = source.kind === 'expr' ? source.code : source.kind === 'static' ? JSON.stringify(source.value) : source.name
  ctx.pushCleanup(
    `effect(() => { ${el}.style.setProperty(${JSON.stringify(cssVar)}, String(${raw})) }).dispose`,
  )
}

function emitModelOp(
  ctx: CodegenContext,
  el: string,
  op: Extract<LeafBindingOp, { op: 'model' }>,
): void {
  const { source, mode, prop } = op
  if (mode === 'bindModel' && (source.kind === 'signal' || source.kind === 'prop')) {
    ctx.pushCleanup(`bindModel(${el}, ${JSON.stringify(prop)}, ${source.name})`)
    ctx.pushDevtoolsBind(source.name, el, 'model')
    return
  }
  const raw = source.kind === 'expr' ? source.code : source.kind === 'static' ? JSON.stringify(source.value) : source.name
  ctx.pushCleanup(
    `effect(() => { ${el}[${JSON.stringify(prop)}] = (${ctx.rewriteExprForEffect(raw)}) }).dispose`,
  )
}
