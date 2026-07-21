import type { CodegenContext } from '../codegen-shared.js'

export type ApplyMode = 'bind' | 'cpw'

/** Shared attribute apply body for value expr `v` (effect + CPW). */
export function emitAttrApplyLines(
  ctx: CodegenContext,
  el: string,
  name: string,
  valueExpr = 'v',
): void {
  ctx.line(
    `if (${valueExpr} === null || ${valueExpr} === undefined || ${valueExpr} === false) ${el}.removeAttribute(${JSON.stringify(name)})`,
  )
  ctx.line(
    `else if (${valueExpr} === true) ${el}.setAttribute(${JSON.stringify(name)}, '')`,
  )
  ctx.line(
    `else ${el}.setAttribute(${JSON.stringify(name)}, String(${valueExpr}))`,
  )
}

/** CPW: cache peek + subscribe, calling `onChange(nextVar)` when value changes. */
export function emitCpwWire(
  ctx: CodegenContext,
  signal: string,
  initialApply: (cacheVar: string) => void,
  onChange: (nextVar: string, cacheVar: string) => void,
): void {
  const cache = ctx.nextId('v')
  ctx.line(`let ${cache} = ${signal}.peek`)
  initialApply(cache)
  ctx.line(`${ctx.cleanupVar}.push(${signal}.subscribe(() => {`)
  ctx.indent()
  const next = ctx.nextId('v')
  ctx.line(`const ${next} = ${signal}.peek`)
  ctx.line(`if (Object.is(${next}, ${cache})) return`)
  ctx.line(`${cache} = ${next}`)
  onChange(next, cache)
  ctx.dedent()
  ctx.line('}))')
}

export function applyText(
  ctx: CodegenContext,
  node: string,
  signal: string,
  mode: ApplyMode,
): void {
  if (mode === 'bind') {
    ctx.pushCleanup(`bindText(${node}, ${signal})`)
    ctx.pushDevtoolsBind(signal, node, 'text')
    return
  }
  emitCpwWire(
    ctx,
    signal,
    (cache) => {
      ctx.line(`${node}.data = String(${cache})`)
    },
    (next) => {
      ctx.line(`${node}.data = String(${next})`)
    },
  )
}

export function applyAttribute(
  ctx: CodegenContext,
  el: string,
  name: string,
  signal: string,
  mode: ApplyMode,
): void {
  if (mode === 'bind') {
    ctx.pushCleanup(`bindAttribute(${el}, ${JSON.stringify(name)}, ${signal})`)
    ctx.pushDevtoolsBind(signal, el, 'attr')
    return
  }
  const apply = ctx.nextId('apply')
  ctx.line(`const ${apply} = (v) => {`)
  ctx.indent()
  emitAttrApplyLines(ctx, el, name, 'v')
  ctx.dedent()
  ctx.line('}')
  emitCpwWire(
    ctx,
    signal,
    (cache) => {
      ctx.line(`${apply}(${cache})`)
    },
    (next) => {
      ctx.line(`${apply}(${next})`)
    },
  )
}

export function applyClass(
  ctx: CodegenContext,
  el: string,
  className: string,
  signal: string,
  mode: ApplyMode,
): void {
  if (mode === 'bind') {
    ctx.pushCleanup(`bindClass(${el}, ${JSON.stringify(className)}, ${signal})`)
    ctx.pushDevtoolsBind(signal, el, 'class')
    return
  }
  emitCpwWire(
    ctx,
    signal,
    (cache) => {
      ctx.line(`${el}.classList.toggle(${JSON.stringify(className)}, !!${cache})`)
    },
    (next) => {
      ctx.line(`${el}.classList.toggle(${JSON.stringify(className)}, !!${next})`)
    },
  )
}

export function applyStyleVar(
  ctx: CodegenContext,
  el: string,
  cssVar: string,
  signal: string,
  mode: ApplyMode,
): void {
  if (mode === 'bind') {
    ctx.pushCleanup(`bindStyleVar(${el}, ${JSON.stringify(cssVar)}, ${signal})`)
    ctx.pushDevtoolsBind(signal, el, 'style')
    return
  }
  emitCpwWire(
    ctx,
    signal,
    (cache) => {
      ctx.line(`${el}.style.setProperty(${JSON.stringify(cssVar)}, String(${cache}))`)
    },
    (next) => {
      ctx.line(`${el}.style.setProperty(${JSON.stringify(cssVar)}, String(${next}))`)
    },
  )
}

export function applyModel(
  ctx: CodegenContext,
  el: string,
  prop: string,
  signal: string,
): void {
  ctx.pushCleanup(`bindModel(${el}, ${JSON.stringify(prop)}, ${signal})`)
  ctx.pushDevtoolsBind(signal, el, 'model')
}

/** Effect that applies attribute from a read expression (arrow invokes). */
export function applyAttrEffect(
  ctx: CodegenContext,
  el: string,
  name: string,
  readExpr: string,
  invokeArrow: boolean,
): void {
  ctx.useRuntime('effect')
  ctx.line(`${ctx.cleanupVar}.push(effect(() => {`)
  ctx.indent()
  ctx.line(`const _v = ${invokeArrow ? `(${readExpr})()` : readExpr}`)
  emitAttrApplyLines(ctx, el, name, '_v')
  ctx.dedent()
  ctx.line('}).dispose)')
}
