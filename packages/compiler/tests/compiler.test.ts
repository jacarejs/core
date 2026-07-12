import { describe, expect, it } from 'vitest'
import { compile, parseModule, parseTemplate, flattenViewLiteral } from '../src/index.js'

const COUNTER = `import { signal, computed, view } from '@jacare/core'

const count = signal(0)
const doubled = computed(() => count() * 2)

function increment() {
  count.update((n) => n + 1)
}

export default view\`
  <div class="counter">
    <p>\${doubled}</p>
    <button @click=\${increment}>+1</button>
  </div>
\``

describe('parseModule', () => {
  it('extracts view template from JavaScript module', () => {
    const mod = parseModule(COUNTER)
    expect(mod.viewHtml).toContain('<div class="counter">')
    expect(mod.code).toContain('const count = signal(0)')
    expect(mod.code).not.toContain('view`')
  })

  it('rejects legacy SFC format', () => {
    expect(() => parseModule('<script></script><template></template>')).toThrow(
      'no longer supported',
    )
  })

  it('flattens template literal expressions', () => {
    const flat = flattenViewLiteral('view`<p>${count}</p>`', 4)
    expect(flat.html).toBe('<p>{count}</p>')
  })
})

describe('parseTemplate', () => {
  it('parses #if blocks', () => {
    const ast = parseTemplate('#if show()\n<p>yes</p>\n#else\n<p>no</p>\n#end')
    const block = ast.children[0]!
    expect(block.type).toBe('if')
  })

  it('parses #for blocks', () => {
    const ast = parseTemplate('#for items() as item (item.id)<li>{item.label}</li>#end')
    const block = ast.children[0]!
    expect(block.type).toBe('each')
  })

  it('parses on-click with arrow functions', () => {
    const ast = parseTemplate('<button on-click={() => remove(id)}>+</button>')
    const btn = ast.children[0]!
    if (btn.type === 'element') {
      expect(btn.attrs[0]).toEqual({
        name: 'click',
        kind: 'event',
        value: '() => remove(id)',
      })
    }
  })

  it('parses on-input with complex handlers', () => {
    const ast = parseTemplate('<input on-input={(e) => filter.set(e.target.value)} />')
    const input = ast.children[0]!
    if (input.type === 'element') {
      expect(input.attrs[0]?.value).toBe('(e) => filter.set(e.target.value)')
    }
  })
})

describe('compile', () => {
  it('generates mount, render, and resume', () => {
    const result = compile(COUNTER)
    expect(result.code).toContain('export function mount(target)')
    expect(result.code).toContain('export function render()')
    expect(result.code).toContain('export function resume(target, state)')
    expect(result.code).toContain('bindText')
    expect(result.code).toContain('data-jacare-bind')
    expect(result.code).toContain('export default mount')
  })

  it('binds bare signal references', () => {
    const result = compile(COUNTER)
    expect(result.code).toContain('bindText(_text')
    expect(result.code).toContain('doubled')
  })

  it('generates branch for @if', () => {
    const source = `import { signal, view } from '@jacare/core'
const show = signal(true)
export default view\`
@if show()
  <p>visible</p>
@end
\``
    const result = compile(source)
    expect(result.code).toContain('branch(')
    expect(result.code).not.toMatch(/\(mount\) => \{\)/)
  })

  it('generates reconcileKeyedList for @each', () => {
    const source = `import { signal, view } from '@jacare/core'
const items = signal([{ id: '1', label: 'a' }])
export default view\`
@each items() as item (item.id)
  <li>{item.label}</li>
@end
\``
    const result = compile(source)
    expect(result.code).toContain('reconcileKeyedList')
    expect(result.code).not.toMatch(/reconcileKeyedList\(\{\)/)
  })

  it('cleans up event listeners on dispose', () => {
    const result = compile(COUNTER)
    expect(result.code).toContain('removeEventListener')
  })

  it('escapes dynamic SSR output', () => {
    const result = compile(COUNTER)
    expect(result.code).toContain('escapeHtml(String(')
  })

  it('stores expr bindings with read lambdas', () => {
    const source = `import { pulse, view } from '@jacare/core'
const count = pulse(0)
export default view\`<p>\${count() * 2}</p>\``
    const result = compile(source)
    expect(result.code).toContain('read: () => count() * 2')
  })

  it('imports only used runtime helpers', () => {
    const source = `import { signal, view } from '@jacare/core'
const on = signal(true)
export default view\`<p>\${on}</p>\``
    const result = compile(source)
    expect(result.code).toContain('bindText')
    expect(result.code).not.toContain('showIf')
    expect(result.code).not.toContain('branch')
    expect(result.code).not.toContain('bindModel')
    expect(result.code).not.toContain('reconcileKeyedList')
  })

  it('compiles component props for Field-like templates', () => {
    const source = `import { view } from '@jacare/core'
export default view\`
<label>
  <span>\${label}</span>
  <input type=\${type} placeholder=\${placeholder} bind-value=\${field} />
</label>
\``
    const result = compile(source)
    expect(result.code).toContain('const label = props["label"]')
    expect(result.code).toContain('createTextNode(String(label))')
    expect(result.code).not.toContain('bindText(_text')
    expect(result.code).toContain('setAttribute("type", String(type))')
    expect(result.code).toContain('bindModel(')
  })

  it('does not bind plain string constants as signals', () => {
    const source = `import { view } from '@jacare/core'
const code = 'hello'
export default view\`<pre><code>\${code}</code></pre>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).not.toContain('bindText(')
    expect(result.code).toContain('String(code)')
  })

  it('ignores signal-like names inside template literal strings', () => {
    const source = `import { view } from '@jacare/core'
const code = \`const count = pulse(0)\`
export default view\`<p>ok</p>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).not.toContain('bindText(_text')
  })

  it('calls signals in mixed text templates', () => {
    const source = `import { pulse, derive, view } from '@jacare/core'
const count = pulse(0)
const doubled = derive(() => count() * 2)
export default view\`<p>value = \${doubled}</p>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).toContain('`value = ${doubled()}`')
    expect(result.code).not.toContain('`value = ${doubled}`')
  })

  it('calls signals in dynamic attributes', () => {
    const source = `import { view } from '@jacare/core'
const id = 'x'
const href = (id) => '/item/' + id
export default view\`<a jacare-go=\${() => href(id)} href=\${() => href(id)}>Go</a>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).toContain('const _v = (() => href(id))()')
    expect(result.code).not.toContain('String(() => href(id))')
  })

  it('does not treat secondary module imports as mount props', () => {
    const source = `import { view } from '@jacare/core'
import { topics } from './topics.js'
export default view\`
  #for topics as item (item.slug)
    <p>\${item.title}</p>
  #end
\``
    const result = compile(source)
    expect(result.code).not.toContain('props["topics"]')
    expect(result.code).toContain('items: () => topics')
  })

  it('binds value and checked with bindModel for two-way signals', () => {
    const source = `import { signal, view } from '@jacare/core'
const text = signal('')
const done = signal(false)
export default view\`
  <input bind-value=\${text} />
  <input type="checkbox" bind-checked=\${done} />
\``
    const result = compile(source)
    expect(result.code).toContain('bindModel(')
    expect(result.code).toContain('"value"')
    expect(result.code).toContain('"checked"')
    expect(result.code).not.toContain('bindProperty(')
  })

  it('emits client-only output', () => {
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).toContain('export function mount')
    expect(result.code).toContain('export function resume')
    expect(result.code).not.toContain('export function render')
    expect(result.code).not.toContain('escapeHtml')
  })

  it('emits server-only output', () => {
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``
    const result = compile(source, { mode: 'server' })
    expect(result.code).toContain('export function render')
    expect(result.code).toContain('escapeHtml')
    expect(result.code).not.toContain('export function mount')
    expect(result.code).not.toContain('export function resume')
    expect(result.code).toContain('export default render')
  })

  it('mounts components inside runUntracked to avoid branch resubscriptions', () => {
    const source = `import Field from './Field.jcr'
import { view } from '@jacare/core'
export default view\`<Field :field={field} />\``
    const result = compile(source)
    expect(result.code).toContain('runUntracked(() => {')
    expect(result.code).toContain('Field(')
  })
})
