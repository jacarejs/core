import type { TemplateAttr, TextPart } from '../types.js'
import { lowerBindingSource } from './source.js'
import type {
  LeafBindingOp,
  LowerLeafContext,
  LoweredText,
  MixedTextPart,
} from './types.js'

export type { LowerLeafContext }

const PROPERTY_BINDINGS = new Set(['value', 'checked'])

/** Lower element attrs to ordered leaf ops (static + reactive). */
export function lowerElementBindings(
  attrs: TemplateAttr[],
  ctx: LowerLeafContext,
): LeafBindingOp[] {
  const ops: LeafBindingOp[] = []
  for (const attr of attrs) {
    ops.push(...lowerAttr(attr, ctx))
  }
  return ops
}

function lowerAttr(attr: TemplateAttr, ctx: LowerLeafContext): LeafBindingOp[] {
  if (attr.kind === 'static') {
    return [{ op: 'staticAttr', name: attr.name, value: attr.value }]
  }

  if (attr.kind === 'expr') {
    if (attr.name === 'class') {
      return [{ op: 'setClassName', code: attr.value }]
    }
    const source = lowerBindingSource(attr.value, ctx)
    if (source.kind === 'signal') {
      return [
        {
          op: 'attr',
          name: attr.name,
          source,
          mode: 'bindAttribute',
        },
      ]
    }
    if (source.kind === 'expr' && source.arrow) {
      return [{ op: 'attr', name: attr.name, source, mode: 'effect' }]
    }
    if (source.kind === 'prop') {
      return [{ op: 'attr', name: attr.name, source, mode: 'once' }]
    }
    return [{ op: 'attr', name: attr.name, source, mode: 'effect' }]
  }

  if (attr.kind === 'event') {
    return [{ op: 'event', name: attr.name, handler: attr.value }]
  }

  if (attr.kind === 'class') {
    const source = lowerBindingSource(attr.value, ctx)
    if (source.kind === 'signal') {
      const classMode = ctx.cpw ? 'cpw' : 'bindClass'
      return [
        {
          op: 'classToggle',
          className: attr.name,
          source,
          mode: classMode,
        },
      ]
    }
    return [
      {
        op: 'classToggle',
        className: attr.name,
        source,
        mode: 'effect',
      },
    ]
  }

  if (attr.kind === 'style') {
    const source = lowerBindingSource(attr.value, ctx)
    const cssVar = `--${attr.name}`
    if (source.kind === 'signal') {
      const styleMode = ctx.cpw ? 'cpw' : 'bindStyleVar'
      return [{ op: 'styleVar', cssVar, source, mode: styleMode }]
    }
    return [{ op: 'styleVar', cssVar, source, mode: 'effect' }]
  }

  if (attr.kind === 'bind') {
    const useProperty = PROPERTY_BINDINGS.has(attr.name)
    const source = lowerBindingSource(attr.value, ctx)
    if (source.kind === 'signal' || source.kind === 'prop') {
      if (useProperty) {
        return [
          {
            op: 'model',
            prop: attr.name as 'value' | 'checked',
            source,
            mode: 'bindModel',
          },
        ]
      }
      const attrMode = ctx.cpw ? 'cpw' : 'bindAttribute'
      return [{ op: 'attr', name: attr.name, source, mode: attrMode }]
    }
    if (useProperty) {
      return [
        {
          op: 'model',
          prop: attr.name as 'value' | 'checked',
          source,
          mode: 'effect',
        },
      ]
    }
    return [{ op: 'attr', name: attr.name, source, mode: 'effect' }]
  }

  return []
}

/** Lower text parts to static node or a single text binding op. */
export function lowerTextParts(parts: TextPart[], ctx: LowerLeafContext): LoweredText {
  const hasExpr = parts.some((p) => p.type === 'expr')
  const onlyStatic = parts.length === 1 && parts[0]!.type === 'static'

  if (onlyStatic) {
    const value = parts[0]!.value
    return value ? { kind: 'static', value } : { kind: 'skip' }
  }

  if (!hasExpr) {
    const value = parts.map((p) => p.value).join('')
    return value ? { kind: 'static', value } : { kind: 'skip' }
  }

  if (parts.length === 1 && parts[0]!.type === 'expr') {
    const raw = parts[0]!.value
    const source = lowerBindingSource(raw, ctx, { preferProp: true })
    if (source.kind === 'prop') {
      return {
        kind: 'binding',
        op: { op: 'text', source, mode: 'bindPropText' },
      }
    }
    if (source.kind === 'signal') {
      if (source.local && ctx.cpw) {
        return { kind: 'binding', op: { op: 'text', source, mode: 'cpw' } }
      }
      if (source.local) {
        return { kind: 'binding', op: { op: 'text', source, mode: 'bindText' } }
      }
      return {
        kind: 'binding',
        op: { op: 'text', source, mode: 'bindPropText' },
      }
    }
    return {
      kind: 'binding',
      op: { op: 'text', source, mode: 'effect' },
    }
  }

  const mixed: MixedTextPart[] = parts.map((p) => {
    if (p.type === 'static') return { type: 'static', value: p.value }
    return {
      type: 'expr',
      raw: p.value,
      source: lowerBindingSource(p.value, ctx, { preferProp: true }),
    }
  })

  return {
    kind: 'binding',
    op: { op: 'text', mode: 'effect', mixed: true, parts: mixed },
  }
}
