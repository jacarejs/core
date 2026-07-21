import type { TemplateAttr, TextPart } from '../types.js'
import { mergeStaticTextParts } from './optimize.js'
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
      return [
        {
          op: 'classToggle',
          className: attr.name,
          source,
          mode: 'bindClass',
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
      return [{ op: 'styleVar', cssVar, source, mode: 'bindStyleVar' }]
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
      return [{ op: 'attr', name: attr.name, source, mode: 'bindAttribute' }]
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
  const merged = mergeStaticTextParts(parts)
  const hasExpr = merged.some((p) => p.type === 'expr')
  const onlyStatic = merged.length === 1 && merged[0]!.type === 'static'

  if (onlyStatic) {
    const value = merged[0]!.value
    return value ? { kind: 'static', value } : { kind: 'skip' }
  }

  if (!hasExpr) {
    const value = merged.map((p) => p.value).join('')
    return value ? { kind: 'static', value } : { kind: 'skip' }
  }

  if (merged.length === 1 && merged[0]!.type === 'expr') {
    const raw = merged[0]!.value
    const source = lowerBindingSource(raw, ctx, { preferProp: true })
    if (source.kind === 'prop') {
      return {
        kind: 'binding',
        op: { op: 'text', source, mode: 'bindPropText' },
      }
    }
    if (source.kind === 'signal') {
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

  const mixed: MixedTextPart[] = merged.map((p) => {
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
