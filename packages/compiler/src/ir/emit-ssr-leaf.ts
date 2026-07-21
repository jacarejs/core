import type { CodegenContext } from '../codegen-shared.js'
import { escapeHtml } from '../codegen-shared.js'
import { meshPortExpr } from './source.js'
import type { BindingSource, LeafBindingOp, LoweredText } from './types.js'

function noteMeshRuntime(ctx: CodegenContext, source: BindingSource): void {
  if (source.kind === 'mesh' && source.address) ctx.useRuntime('getBag')
  if (source.kind === 'expr' && source.code.includes('getBag(')) ctx.useRuntime('getBag')
}

/** Emit SSR text from lowered IR (same classification as client). */
export function emitSSRLoweredText(ctx: CodegenContext, lowered: LoweredText): void {
  if (lowered.kind === 'skip') return

  if (lowered.kind === 'static') {
    ctx.line(`_html += ${JSON.stringify(lowered.value)}`)
    return
  }

  const op = lowered.op
  if (op.mixed) {
    ctx.useRuntime('escapeHtml')
    const template = op.parts
      .map((p) => {
        if (p.type === 'static') return escapeHtml(p.value)
        noteMeshRuntime(ctx, p.source)
        return `' + escapeHtml(String(${readExprFromSource(ctx, p.source, p.raw)})) + '`
      })
      .join('')
    ctx.line(`_html += \`${template}\``)
    return
  }

  const id = ctx.nextBinding()
  ctx.useRuntime('escapeHtml')
  const { source } = op
  noteMeshRuntime(ctx, source)
  if (source.kind === 'signal' && source.local) {
    ctx.line(
      `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${source.name}())) + '</span>'`,
    )
    ctx.line(`_bindings.push({ id: '${id}', kind: 'signal', read: ${source.name} })`)
    return
  }
  if (source.kind === 'mesh') {
    const port = meshPortExpr(source)
    ctx.line(
      `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${port}())) + '</span>'`,
    )
    ctx.line(`_bindings.push({ id: '${id}', kind: 'signal', read: ${port} })`)
    return
  }
  if (source.kind === 'signal' || source.kind === 'prop') {
    const readExpr = `typeof ${source.name} === 'function' ? ${source.name}() : ${source.name}`
    ctx.line(
      `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${readExpr})) + '</span>'`,
    )
    ctx.line(`_bindings.push({ id: '${id}', kind: 'expr', read: () => ${readExpr} })`)
    return
  }

  const raw = source.kind === 'expr' ? source.code : JSON.stringify(source.value)
  const readExpr = `(() => { const _v = (${ctx.rewriteExprForEffect(raw)}); return typeof _v === 'function' ? _v() : _v })()`
  ctx.line(
    `_html += '<span data-jacare-bind="${id}">' + escapeHtml(String(${readExpr})) + '</span>'`,
  )
  ctx.line(
    `_bindings.push({ id: '${id}', kind: 'expr', read: () => { const _v = (${ctx.rewriteExprForEffect(raw)}); return typeof _v === 'function' ? _v() : _v } })`,
  )
}

function readExprFromSource(
  ctx: CodegenContext,
  source: BindingSource,
  raw: string,
): string {
  if (source.kind === 'signal') return `${source.name}()`
  if (source.kind === 'mesh') return `${meshPortExpr(source)}()`
  if (source.kind === 'prop') {
    return `typeof ${source.name} === 'function' ? ${source.name}() : ${source.name}`
  }
  if (source.kind === 'expr') return ctx.rewriteExprForEffect(raw)
  return JSON.stringify(source.value)
}

/**
 * Build SSR open-tag from leaf bindings.
 * Dynamic signal/prop attrs are evaluated into HTML (resume still text-only).
 */
export function emitSSRElementOpen(
  ctx: CodegenContext,
  tag: string,
  bindings: LeafBindingOp[],
): void {
  const staticAttrs: string[] = []
  const dynamicChunks: string[] = []

  for (const op of bindings) {
    if (op.op === 'staticAttr') {
      if (op.name === 'class') {
        staticAttrs.push(`class="${escapeHtml(op.value)}"`)
      } else {
        staticAttrs.push(`${op.name}="${escapeHtml(op.value)}"`)
      }
      continue
    }

    if (op.op === 'setClassName') {
      ctx.useRuntime('escapeHtml')
      dynamicChunks.push(`' class="' + escapeHtml(String(${op.code})) + '"'`)
      continue
    }

    if (
      op.op === 'attr' &&
      (op.source.kind === 'signal' || op.source.kind === 'prop' || op.source.kind === 'mesh')
    ) {
      ctx.useRuntime('escapeHtml')
      const read =
        op.source.kind === 'mesh'
          ? `${meshPortExpr(op.source)}()`
          : op.source.kind === 'signal'
            ? `${op.source.name}()`
            : `typeof ${op.source.name} === 'function' ? ${op.source.name}() : ${op.source.name}`
      dynamicChunks.push(
        `(() => { const _v = (${read}); return (_v === null || _v === undefined || _v === false) ? '' : (_v === true ? ${JSON.stringify(' ' + op.name)} : ' ${op.name}="' + escapeHtml(String(_v)) + '"') })()`,
      )
      continue
    }

    if (
      op.op === 'classToggle' &&
      (op.source.kind === 'signal' || op.source.kind === 'mesh')
    ) {
      const read =
        op.source.kind === 'mesh' ? `${meshPortExpr(op.source)}()` : `${op.source.name}()`
      dynamicChunks.push(`(${read} ? ${JSON.stringify(' class="' + op.className + '"')} : '')`)
      continue
    }

    if (
      op.op === 'styleVar' &&
      (op.source.kind === 'signal' || op.source.kind === 'mesh')
    ) {
      ctx.useRuntime('escapeHtml')
      const read =
        op.source.kind === 'mesh' ? `${meshPortExpr(op.source)}()` : `${op.source.name}()`
      dynamicChunks.push(
        `' style="${op.cssVar}:' + escapeHtml(String(${read})) + '"'`,
      )
      continue
    }

    if (
      op.op === 'model' &&
      (op.source.kind === 'signal' || op.source.kind === 'prop' || op.source.kind === 'mesh')
    ) {
      const read =
        op.source.kind === 'mesh'
          ? `${meshPortExpr(op.source)}()`
          : op.source.kind === 'signal'
            ? `${op.source.name}()`
            : op.source.name
      if (op.prop === 'checked') {
        dynamicChunks.push(`(${read} ? ' checked' : '')`)
      } else {
        ctx.useRuntime('escapeHtml')
        dynamicChunks.push(`' value="' + escapeHtml(String(${read})) + '"'`)
      }
    }
  }

  if (dynamicChunks.length === 0) {
    const open =
      staticAttrs.length > 0 ? `<${tag} ${staticAttrs.join(' ')}>` : `<${tag}>`
    ctx.line(`_html += ${JSON.stringify(open)}`)
    return
  }

  const base =
    staticAttrs.length > 0 ? `<${tag} ${staticAttrs.join(' ')}` : `<${tag}`
  ctx.line(`_html += ${JSON.stringify(base)}`)
  for (const chunk of dynamicChunks) {
    ctx.line(`_html += ${chunk}`)
  }
  ctx.line(`_html += '>'`)
}
