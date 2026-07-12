import type {
  TemplateAttr,
  TemplateAST,
  TemplateEachNode,
  TemplateIfNode,
  TemplateNode,
  TextPart,
} from './types.js'
import {
  emitCpwAttribute,
  emitCpwClass,
  emitCpwStyleVar,
  emitCpwText,
} from './codegen-cpw.js'
import { append, CodegenContext, resolveSignalExpr, type EmitTarget } from './codegen-shared.js'

const SIGNAL_REF_RE = /^([A-Za-z_$][\w$]*)$/

export function emitClient(
  ast: TemplateAST,
  props: string[],
  ctx: CodegenContext,
  scopeId?: string,
  scopedStyle?: string,
): void {
  if (props.length > 0) {
    ctx.line('export function mount(target, props = {}) {')
    ctx.indent()
    for (const prop of props) {
      ctx.line(`const ${prop} = props[${JSON.stringify(prop)}]`)
    }
    ctx.blank()
  } else {
    ctx.line('export function mount(target) {')
    ctx.indent()
  }

  if (scopeId) {
    ctx.line(`target.setAttribute('data-jacare-s', ${JSON.stringify(scopeId)})`)
    if (scopedStyle) {
      ctx.useRuntime('ensureScopedStyle')
      ctx.line(`ensureScopedStyle(${JSON.stringify(scopeId)}, ${JSON.stringify(scopedStyle)})`)
    }
  }

  ctx.line('const _cleanups = []')
  ctx.line('const _frag = document.createDocumentFragment()')

  for (const child of ast.children) {
    emitNode(ctx, child, { kind: 'parent', name: '_frag' })
  }

  ctx.line('target.appendChild(_frag)')
  ctx.line('return () => { for (const c of _cleanups) c() }')
  ctx.dedent()
  ctx.line('}')
}

function emitNode(ctx: CodegenContext, node: TemplateNode, target: EmitTarget): void {
  switch (node.type) {
    case 'text':
      emitText(ctx, node.parts, target)
      break
    case 'element':
      emitElement(ctx, node, target)
      break
    case 'component':
      emitComponent(ctx, node, target)
      break
    case 'slot':
      emitSlot(ctx, node, target)
      break
    case 'if':
      emitIf(ctx, node, target)
      break
    case 'each':
      emitEach(ctx, node, target)
      break
  }
}

function emitElement(
  ctx: CodegenContext,
  node: Extract<TemplateNode, { type: 'element' }>,
  target: EmitTarget,
): void {
  const el = ctx.nextId('el')
  ctx.line(`const ${el} = document.createElement('${node.tag}')`, node.sourceLine)

  for (const attr of node.attrs) {
    emitAttr(ctx, el, attr)
  }

  for (const child of node.children) {
    emitNode(ctx, child, { kind: 'parent', name: el })
  }

  append(ctx, target, el)
}

function emitSlot(
  ctx: CodegenContext,
  node: Extract<TemplateNode, { type: 'slot' }>,
  target: EmitTarget,
): void {
  const anchor = ctx.nextId('slot')
  ctx.line(`const ${anchor} = document.createElement('span')`, node.sourceLine)
  append(ctx, target, anchor)
  ctx.useRuntime('mountSlot')
  const slotKey = node.name ? JSON.stringify(node.name) : 'undefined'
  ctx.line(`if (typeof children === 'function') {`)
  ctx.indent()
  const dispose = ctx.nextId('slotDispose')
  ctx.line(`const ${dispose} = mountSlot(${anchor}, children, ${slotKey})`)
  ctx.line(`if (${dispose}) _cleanups.push(${dispose})`)
  ctx.dedent()
  ctx.line('}')
}

function emitComponent(
  ctx: CodegenContext,
  node: Extract<TemplateNode, { type: 'component' }>,
  target: EmitTarget,
): void {
  const host = ctx.nextId('cmp')
  ctx.line(`const ${host} = document.createElement('div')`)
  append(ctx, target, host)

  const propsList: string[] = []
  for (const attr of node.attrs) {
    if (attr.kind === 'prop' || attr.kind === 'event') {
      propsList.push(`${attr.name}: ${attr.value}`)
    } else if (attr.kind === 'static') {
      propsList.push(`${attr.name}: ${JSON.stringify(attr.value)}`)
    }
  }

  if (node.children.length > 0) {
    const slotFn = ctx.nextId('slotFn')
    const slotScope = ctx.nextId('slotCleanups')
    ctx.line(`const ${slotFn} = (slotTarget) => {`)
    ctx.indent()
    ctx.line(`const ${slotScope} = []`)
    ctx.pushCleanupScope(slotScope)
    for (const child of node.children) {
      emitNode(ctx, child, { kind: 'parent', name: 'slotTarget' })
    }
    ctx.popCleanupScope()
    ctx.line(`return () => { for (const c of ${slotScope}) c() }`)
    ctx.dedent()
    ctx.line('}')
    propsList.push(`children: ${slotFn}`)
  }

  const propsArg = propsList.length > 0 ? `{ ${propsList.join(', ')} }` : '{}'
  const dispose = ctx.nextId('cmpDispose')
  ctx.useRuntime('runUntracked')
  ctx.line(`let ${dispose}`)
  ctx.line(`runUntracked(() => { ${dispose} = ${node.name}(${host}, ${propsArg}) })`)
  ctx.pushCleanup(dispose)
}

function emitIf(ctx: CodegenContext, node: TemplateIfNode, target: EmitTarget): void {
  const anchor = ctx.nextId('if')
  ctx.line(`const ${anchor} = document.createComment('if')`, node.sourceLine)
  append(ctx, target, anchor)

  const scope = ctx.nextId('bc')
  ctx.useRuntime('branch')
  ctx.line(`${ctx.cleanupVar}.push(branch(${anchor}, (mount) => {`)
  ctx.indent()
  ctx.line(`const ${scope} = []`)
  ctx.pushCleanupScope(scope)

  for (let i = 0; i < node.branches.length; i++) {
    const branch = node.branches[i]!
    const prefix = i === 0 ? 'if' : 'else if'
    ctx.line(`${prefix} (${branch.condition}) {`)
    ctx.indent()
    for (const child of branch.children) {
      emitNode(ctx, child, { kind: 'mount', fn: 'mount' })
    }
    ctx.dedent()
    ctx.line('}')
  }

  if (node.elseChildren.length > 0) {
    ctx.line('else {')
    ctx.indent()
    for (const child of node.elseChildren) {
      emitNode(ctx, child, { kind: 'mount', fn: 'mount' })
    }
    ctx.dedent()
    ctx.line('}')
  }

  ctx.popCleanupScope()
  ctx.line(`return () => { for (const c of ${scope}) c() }`)
  ctx.dedent()
  ctx.line('}))')
}

function emitEach(ctx: CodegenContext, node: TemplateEachNode, target: EmitTarget): void {
  const anchor = ctx.nextId('each')
  ctx.line(`const ${anchor} = document.createComment('each')`, node.sourceLine)
  append(ctx, target, anchor)

  const index = node.indexName ?? '_index'
  const keyExpr = node.keyExpr
    ? `(${node.itemName}, ${index}) => ${node.keyExpr}`
    : `(${node.itemName}, ${index}) => ${index}`

  ctx.useRuntime('reconcileKeyedList')
  ctx.line(`${ctx.cleanupVar}.push(reconcileKeyedList({`)
  ctx.indent()
  ctx.line(`parent: ${target.kind === 'parent' ? target.name : 'target'},`)
  ctx.line(`anchor: ${anchor},`)
  ctx.line(`items: () => ${node.source},`)
  ctx.line(`getKey: ${keyExpr},`)
  ctx.line(`render: (${node.itemName}, ${index}, mount) => {`)
  ctx.indent()

  const itemScope = ctx.nextId('ic')
  ctx.line(`const ${itemScope} = []`)
  ctx.pushCleanupScope(itemScope)

  const root = ctx.nextId('item')
  const singleChild = node.children.length === 1 ? node.children[0]! : null
  const hasSingleElement = singleChild?.type === 'element'
  const hasSingleComponent = singleChild?.type === 'component'

  if (hasSingleElement) {
    const child = singleChild as Extract<TemplateNode, { type: 'element' }>
    ctx.line(`const ${root} = document.createElement('${child.tag}')`)
    for (const attr of child.attrs) {
      emitAttr(ctx, root, attr)
    }
    for (const grandchild of child.children) {
      emitNode(ctx, grandchild, { kind: 'parent', name: root })
    }
    ctx.line(`mount(${root})`)
  } else if (hasSingleComponent) {
    emitNode(ctx, singleChild, { kind: 'mount', fn: 'mount' })
  } else {
    ctx.line(`const ${root} = document.createDocumentFragment()`)
    for (const child of node.children) {
      emitNode(ctx, child, { kind: 'parent', name: root })
    }
    ctx.line(`mount(${root})`)
  }

  ctx.popCleanupScope()
  ctx.line(`return () => { for (const c of ${itemScope}) c() }`)
  ctx.dedent()
  ctx.line('},')
  ctx.dedent()
  ctx.line('}))')
}

const PROPERTY_BINDINGS = new Set(['value', 'checked'])

function emitAttr(ctx: CodegenContext, el: string, attr: TemplateAttr): void {
  if (attr.kind === 'static') {
    if (attr.name === 'class') {
      ctx.line(`${el}.className = ${JSON.stringify(attr.value)}`)
    } else {
      ctx.line(`${el}.setAttribute(${JSON.stringify(attr.name)}, ${JSON.stringify(attr.value)})`)
    }
    return
  }

  if (attr.kind === 'expr') {
    if (attr.name === 'class') {
      ctx.line(`${el}.className = String(${attr.value})`)
    } else if (/=>/.test(attr.value)) {
      ctx.useRuntime('effect')
      ctx.line(`${ctx.cleanupVar}.push(effect(() => {`)
      ctx.indent()
      ctx.line(`const _v = (${attr.value})()`)
      ctx.line(`if (_v === null || _v === undefined || _v === false) ${el}.removeAttribute(${JSON.stringify(attr.name)})`)
      ctx.line(`else ${el}.setAttribute(${JSON.stringify(attr.name)}, String(_v))`)
      ctx.dedent()
      ctx.line('}).dispose)')
    } else {
      ctx.line(`${el}.setAttribute(${JSON.stringify(attr.name)}, String(${attr.value}))`)
    }
    return
  }

  if (attr.kind === 'event') {
    const handler = ctx.nextId('handler')
    ctx.line(`const ${handler} = ${attr.value}`)
    ctx.line(`${ctx.cleanupVar}.push((() => {`)
    ctx.indent()
    ctx.line(`${el}.addEventListener(${JSON.stringify(attr.name)}, ${handler})`)
    ctx.line(`return () => ${el}.removeEventListener(${JSON.stringify(attr.name)}, ${handler})`)
    ctx.dedent()
    ctx.line('})())')
    return
  }

  if (attr.kind === 'class') {
    const src = ctx.resolveSignal(attr.value)
    if (src) {
      if (ctx.cpw) {
        emitCpwClass(ctx, el, attr.name, src)
      } else {
        ctx.pushCleanup(`bindClass(${el}, ${JSON.stringify(attr.name)}, ${src})`)
      }
    } else if (/=>/.test(attr.value)) {
      ctx.pushCleanup(
        `effect(() => { ${el}.classList.toggle(${JSON.stringify(attr.name)}, !!(${attr.value})()) }).dispose`,
      )
    } else {
      ctx.pushCleanup(`effect(() => { ${el}.classList.toggle(${JSON.stringify(attr.name)}, !!(${attr.value})) }).dispose`)
    }
    return
  }

  if (attr.kind === 'style') {
    const cssVar = `--${attr.name}`
    const src = ctx.resolveSignal(attr.value)
    if (src) {
      if (ctx.cpw) {
        emitCpwStyleVar(ctx, el, cssVar, src)
      } else {
        ctx.pushCleanup(`bindStyleVar(${el}, ${JSON.stringify(cssVar)}, ${src})`)
      }
    } else if (/=>/.test(attr.value)) {
      ctx.pushCleanup(
        `effect(() => { ${el}.style.setProperty(${JSON.stringify(cssVar)}, String((${attr.value})())) }).dispose`,
      )
    } else {
      ctx.pushCleanup(
        `effect(() => { ${el}.style.setProperty(${JSON.stringify(cssVar)}, String(${attr.value})) }).dispose`,
      )
    }
    return
  }

  if (attr.kind === 'bind') {
    const useProperty = PROPERTY_BINDINGS.has(attr.name)
    const trimmed = attr.value.trim()
    const src = ctx.resolveSignal(attr.value)
    const propSource =
      SIGNAL_REF_RE.test(trimmed) && ctx.isComponentProp(trimmed) ? trimmed : null
    const source = src ?? propSource
    if (source) {
      if (useProperty) {
        ctx.pushCleanup(`bindModel(${el}, ${JSON.stringify(attr.name)}, ${source})`)
      } else if (ctx.cpw) {
        emitCpwAttribute(ctx, el, attr.name, source)
      } else {
        ctx.pushCleanup(`bindAttribute(${el}, ${JSON.stringify(attr.name)}, ${source})`)
      }
    } else if (useProperty) {
      ctx.pushCleanup(`effect(() => { ${el}[${JSON.stringify(attr.name)}] = (${attr.value}) }).dispose`)
    } else {
      ctx.useRuntime('effect')
      ctx.line(`${ctx.cleanupVar}.push(effect(() => {`)
      ctx.indent()
      ctx.line(`const _v = ${attr.value}`)
      ctx.line(`if (_v === null || _v === undefined || _v === false) ${el}.removeAttribute(${JSON.stringify(attr.name)})`)
      ctx.line(`else if (_v === true) ${el}.setAttribute(${JSON.stringify(attr.name)}, '')`)
      ctx.line(`else ${el}.setAttribute(${JSON.stringify(attr.name)}, String(_v))`)
      ctx.dedent()
      ctx.line('}).dispose)')
    }
  }
}

function emitText(ctx: CodegenContext, parts: TextPart[], target: EmitTarget): void {
  const hasExpr = parts.some((p) => p.type === 'expr')
  const onlyStatic = parts.length === 1 && parts[0]!.type === 'static'

  if (onlyStatic) {
    if (parts[0]!.value) {
      const text = ctx.nextId('text')
      ctx.line(`const ${text} = document.createTextNode(${JSON.stringify(parts[0]!.value)})`)
      append(ctx, target, text)
    }
    return
  }

  if (!hasExpr) {
    const text = parts.map((p) => p.value).join('')
    if (text) {
      const node = ctx.nextId('text')
      ctx.line(`const ${node} = document.createTextNode(${JSON.stringify(text)})`)
      append(ctx, target, node)
    }
    return
  }

  if (parts.length === 1 && parts[0]!.type === 'expr') {
    const expr = parts[0]!.value
    const trimmed = expr.trim()
    if (ctx.isComponentProp(trimmed)) {
      const text = ctx.nextId('text')
      ctx.line(`const ${text} = document.createTextNode('')`)
      append(ctx, target, text)
      ctx.pushCleanup(`bindPropText(${text}, ${trimmed})`)
      return
    }
  }

  const textNode = ctx.nextId('text')
  ctx.line(`const ${textNode} = document.createTextNode('')`)
  append(ctx, target, textNode)

  if (parts.length === 1 && parts[0]!.type === 'expr') {
    const expr = parts[0]!.value
    const src = ctx.resolveSignal(expr)
    if (src) {
      if (ctx.cpw) {
        emitCpwText(ctx, textNode, src)
      } else {
        ctx.pushCleanup(`bindText(${textNode}, ${src})`)
      }
      return
    }
    ctx.pushCleanup(`effect(() => { ${textNode}.data = String(${ctx.rewriteExprForEffect(expr)}) }).dispose`)
    return
  }

  const template = parts
    .map((p) => {
      if (p.type === 'static') return p.value
      const trimmed = p.value.trim()
      if (SIGNAL_REF_RE.test(trimmed) && ctx.isComponentProp(trimmed)) {
        return `\${typeof ${trimmed} === 'function' ? ${trimmed}() : ${trimmed} ?? ''}`
      }
      const src = ctx.resolveSignal(p.value)
      if (src) return `\${${src}()}`
      return `\${${ctx.rewriteExprForEffect(p.value)}}`
    })
    .join('')

  ctx.pushCleanup(`effect(() => { ${textNode}.data = \`${template}\` }).dispose`)
}
