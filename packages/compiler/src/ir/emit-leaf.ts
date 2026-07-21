import type { CodegenContext } from '../codegen-shared.js'
import {
  applyAttrEffect,
  applyAttribute,
  applyClass,
  applyModel,
  applyStyleVar,
  applyText,
} from './emit-apply.js'
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
  if ((mode === 'cpw' || mode === 'bindText') && source.kind === 'signal') {
    applyText(ctx, textNode, source.name, mode === 'cpw' ? 'cpw' : 'bind')
    return
  }
  if (mode === 'bindPropText' && (source.kind === 'signal' || source.kind === 'prop')) {
    ctx.pushCleanup(`bindPropText(${textNode}, ${source.name})`)
    if (source.kind === 'signal') {
      ctx.pushDevtoolsBind(source.name, textNode, 'text')
    }
    return
  }
  const raw =
    source.kind === 'expr'
      ? source.code
      : source.kind === 'static'
        ? JSON.stringify(source.value)
        : source.name
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

  if (
    (mode === 'bindAttribute' || mode === 'cpw') &&
    (source.kind === 'signal' || source.kind === 'prop')
  ) {
    applyAttribute(ctx, el, name, source.name, mode === 'cpw' ? 'cpw' : 'bind')
    return
  }

  if (source.kind === 'expr' && source.arrow) {
    applyAttrEffect(ctx, el, name, source.code, true)
    return
  }

  const raw =
    source.kind === 'expr'
      ? source.code
      : source.kind === 'static'
        ? JSON.stringify(source.value)
        : source.name
  applyAttrEffect(ctx, el, name, ctx.rewriteExprForEffect(raw), false)
}

function emitClassOp(
  ctx: CodegenContext,
  el: string,
  op: Extract<LeafBindingOp, { op: 'classToggle' }>,
): void {
  const { source, mode, className } = op
  if ((mode === 'cpw' || mode === 'bindClass') && source.kind === 'signal') {
    applyClass(ctx, el, className, source.name, mode === 'cpw' ? 'cpw' : 'bind')
    return
  }
  if (source.kind === 'expr' && source.arrow) {
    ctx.pushCleanup(
      `effect(() => { ${el}.classList.toggle(${JSON.stringify(className)}, !!(${source.code})()) }).dispose`,
    )
    return
  }
  const raw =
    source.kind === 'expr'
      ? source.code
      : source.kind === 'static'
        ? JSON.stringify(source.value)
        : source.name
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
  if ((mode === 'cpw' || mode === 'bindStyleVar') && source.kind === 'signal') {
    applyStyleVar(ctx, el, cssVar, source.name, mode === 'cpw' ? 'cpw' : 'bind')
    return
  }
  if (source.kind === 'expr' && source.arrow) {
    ctx.pushCleanup(
      `effect(() => { ${el}.style.setProperty(${JSON.stringify(cssVar)}, String((${source.code})())) }).dispose`,
    )
    return
  }
  const raw =
    source.kind === 'expr'
      ? source.code
      : source.kind === 'static'
        ? JSON.stringify(source.value)
        : source.name
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
    applyModel(ctx, el, prop, source.name)
    return
  }
  const raw =
    source.kind === 'expr'
      ? source.code
      : source.kind === 'static'
        ? JSON.stringify(source.value)
        : source.name
  ctx.pushCleanup(
    `effect(() => { ${el}[${JSON.stringify(prop)}] = (${ctx.rewriteExprForEffect(raw)}) }).dispose`,
  )
}
