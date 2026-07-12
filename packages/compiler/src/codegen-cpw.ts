import type { CodegenContext } from './codegen-shared.js'

export function emitCpwText(ctx: CodegenContext, node: string, signal: string): void {
  const cache = ctx.nextId('v')
  ctx.line(`let ${cache} = ${signal}.peek`)
  ctx.line(`${node}.data = String(${cache})`)
  ctx.line(`${ctx.cleanupVar}.push(${signal}.subscribe(() => {`)
  ctx.indent()
  const next = ctx.nextId('v')
  ctx.line(`const ${next} = ${signal}.peek`)
  ctx.line(`if (Object.is(${next}, ${cache})) return`)
  ctx.line(`${cache} = ${next}`)
  ctx.line(`${node}.data = String(${next})`)
  ctx.dedent()
  ctx.line('}))')
}

export function emitCpwAttribute(
  ctx: CodegenContext,
  el: string,
  name: string,
  signal: string,
): void {
  const cache = ctx.nextId('v')
  const apply = ctx.nextId('apply')
  ctx.line(`let ${cache} = ${signal}.peek`)
  ctx.line(`const ${apply} = (v) => {`)
  ctx.indent()
  ctx.line(`if (v === null || v === undefined || v === false) ${el}.removeAttribute(${JSON.stringify(name)})`)
  ctx.line(`else if (v === true) ${el}.setAttribute(${JSON.stringify(name)}, '')`)
  ctx.line(`else ${el}.setAttribute(${JSON.stringify(name)}, String(v))`)
  ctx.dedent()
  ctx.line('}')
  ctx.line(`${apply}(${cache})`)
  ctx.line(`${ctx.cleanupVar}.push(${signal}.subscribe(() => {`)
  ctx.indent()
  const next = ctx.nextId('v')
  ctx.line(`const ${next} = ${signal}.peek`)
  ctx.line(`if (Object.is(${next}, ${cache})) return`)
  ctx.line(`${cache} = ${next}`)
  ctx.line(`${apply}(${next})`)
  ctx.dedent()
  ctx.line('}))')
}

export function emitCpwClass(
  ctx: CodegenContext,
  el: string,
  className: string,
  signal: string,
): void {
  const cache = ctx.nextId('v')
  ctx.line(`let ${cache} = ${signal}.peek`)
  ctx.line(`${el}.classList.toggle(${JSON.stringify(className)}, !!${cache})`)
  ctx.line(`${ctx.cleanupVar}.push(${signal}.subscribe(() => {`)
  ctx.indent()
  const next = ctx.nextId('v')
  ctx.line(`const ${next} = ${signal}.peek`)
  ctx.line(`if (Object.is(${next}, ${cache})) return`)
  ctx.line(`${cache} = ${next}`)
  ctx.line(`${el}.classList.toggle(${JSON.stringify(className)}, !!${next})`)
  ctx.dedent()
  ctx.line('}))')
}

export function emitCpwStyleVar(
  ctx: CodegenContext,
  el: string,
  cssVar: string,
  signal: string,
): void {
  const cache = ctx.nextId('v')
  ctx.line(`let ${cache} = ${signal}.peek`)
  ctx.line(`${el}.style.setProperty(${JSON.stringify(cssVar)}, String(${cache}))`)
  ctx.line(`${ctx.cleanupVar}.push(${signal}.subscribe(() => {`)
  ctx.indent()
  const next = ctx.nextId('v')
  ctx.line(`const ${next} = ${signal}.peek`)
  ctx.line(`if (Object.is(${next}, ${cache})) return`)
  ctx.line(`${cache} = ${next}`)
  ctx.line(`${el}.style.setProperty(${JSON.stringify(cssVar)}, String(${next}))`)
  ctx.dedent()
  ctx.line('}))')
}
