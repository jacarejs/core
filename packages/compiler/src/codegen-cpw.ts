import type { CodegenContext } from './codegen-shared.js'
import {
  applyAttribute,
  applyClass,
  applyStyleVar,
  applyText,
} from './ir/emit-apply.js'

export function emitCpwText(ctx: CodegenContext, node: string, signal: string): void {
  applyText(ctx, node, signal, 'cpw')
}

export function emitCpwAttribute(
  ctx: CodegenContext,
  el: string,
  name: string,
  signal: string,
): void {
  applyAttribute(ctx, el, name, signal, 'cpw')
}

export function emitCpwClass(
  ctx: CodegenContext,
  el: string,
  className: string,
  signal: string,
): void {
  applyClass(ctx, el, className, signal, 'cpw')
}

export function emitCpwStyleVar(
  ctx: CodegenContext,
  el: string,
  cssVar: string,
  signal: string,
): void {
  applyStyleVar(ctx, el, cssVar, signal, 'cpw')
}
