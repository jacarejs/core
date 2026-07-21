import type { TemplateAttr, TemplateNode } from '../types.js'
import { lowerBindingSource } from './source.js'
import type { BindingSource, LowerSourceContext } from './types.js'

export type ComponentPropMode = 'one-way' | 'model' | 'static' | 'event'

export type ComponentPropBinding = {
  name: string
  mode: ComponentPropMode
  source: BindingSource
  /** Original template expression / static text for emit. */
  raw: string
  /**
   * When true, client emit wraps as `() => (raw)` so child re-reads
   * (e.g. `t('key')`). Simple ids/literals stay eager.
   */
  lazy?: boolean
}

export type ComponentPlan = {
  kind: 'component'
  name: string
  props: ComponentPropBinding[]
  children: TemplateNode[]
  hasSlots: boolean
}

/** Lower a component call site to a shared prop plan. */
export function lowerComponent(
  node: Extract<TemplateNode, { type: 'component' }>,
  ctx: LowerSourceContext,
): ComponentPlan {
  const props: ComponentPropBinding[] = []
  for (const attr of node.attrs) {
    const binding = lowerComponentAttr(attr, ctx)
    if (binding) props.push(binding)
  }
  return {
    kind: 'component',
    name: node.name,
    props,
    children: node.children,
    hasSlots: node.children.length > 0,
  }
}

function lowerComponentAttr(
  attr: TemplateAttr,
  ctx: LowerSourceContext,
): ComponentPropBinding | null {
  if (attr.kind === 'static') {
    return {
      name: attr.name,
      mode: 'static',
      source: { kind: 'static', value: attr.value },
      raw: attr.value,
    }
  }

  if (attr.kind === 'event') {
    return {
      name: attr.name,
      mode: 'event',
      source: lowerBindingSource(attr.value, ctx),
      raw: attr.value,
    }
  }

  if (attr.kind === 'bind') {
    return {
      name: attr.name,
      mode: 'model',
      source: lowerBindingSource(attr.value, ctx),
      raw: attr.value,
    }
  }

  if (attr.kind === 'prop') {
    const source = lowerBindingSource(attr.value, ctx)
    return {
      name: attr.name,
      mode: 'one-way',
      source,
      raw: attr.value,
      lazy: shouldLazyOneWay(source),
    }
  }

  return null
}

/** Exprs that should re-evaluate when the child reads the prop. */
function shouldLazyOneWay(source: BindingSource): boolean {
  if (source.kind !== 'expr' || source.arrow) return false
  return !isSimplePassThrough(source.code)
}

function isSimplePassThrough(code: string): boolean {
  const t = code.trim()
  if (/^[A-Za-z_$][\w$]*$/.test(t)) return true
  if (/^(['"]).*\1$/.test(t) || /^`[^${}]*`$/.test(t)) return true
  if (/^\d+(\.\d+)?$/.test(t)) return true
  if (t === 'true' || t === 'false' || t === 'null' || t === 'undefined') return true
  return false
}

/** Client prop object entry (`name: value`). */
export function emitComponentPropEntry(prop: ComponentPropBinding): string {
  if (prop.mode === 'static') {
    return `${prop.name}: ${JSON.stringify(prop.raw)}`
  }
  if (prop.lazy) {
    return `${prop.name}: () => (${prop.raw})`
  }
  return `${prop.name}: ${prop.raw}`
}

/** SSR prop object entry — always eager (no thunk). */
export function emitComponentPropEntrySSR(prop: ComponentPropBinding): string {
  if (prop.mode === 'static') {
    return `${prop.name}: ${JSON.stringify(prop.raw)}`
  }
  return `${prop.name}: ${prop.raw}`
}
