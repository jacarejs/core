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

  it('extracts <view> block templates', () => {
    const source = `import { signal } from '@jacare/core'
const count = signal(0)
export <view>
  <p>\${count}</p>
</view>`
    const mod = parseModule(source)
    expect(mod.viewHtml).toContain('<p>{count}</p>')
    expect(mod.code).toContain('const count = signal(0)')
    expect(mod.code).not.toContain('<view>')
  })

  it('extracts export <style> block with lang', () => {
    const source = `import { signal } from '@jacare/core'
const count = signal(0)
export <view>
  <p>\${count}</p>
</view>
export <style lang="scss">
.title { color: red; }
</style>`
    const mod = parseModule(source)
    expect(mod.styleCss).toContain('.title')
    expect(mod.styleLang).toBe('scss')
    expect(mod.code).not.toContain('<style>')
    expect(mod.code).not.toContain('<view>')
  })

  it('compiles <view> block templates', () => {
    const source = `import { signal } from '@jacare/core'
const count = signal(0)
export <view>
  <p>\${count}</p>
</view>`
    const result = compile(source)
    expect(result.code).toContain('export function mount')
    expect(result.code).toContain('bindText')
  })
})

describe('parseTemplate', () => {
  it('parses #if blocks', () => {
    const ast = parseTemplate('#if show()\n<p>yes</p>\n#else\n<p>no</p>\n#end')
    const block = ast.children[0]!
    expect(block.type).toBe('if')
  })

  it('parses #case blocks', () => {
    const ast = parseTemplate(
      `#case role()
  #when 'admin'
    <p>admin</p>
  #when 'guest'
    <p>guest</p>
  #else
    <p>member</p>
#end`,
    )
    const block = ast.children[0]!
    expect(block.type).toBe('case')
    if (block.type === 'case') {
      expect(block.scrutinee).toBe('role()')
      expect(block.branches).toHaveLength(2)
      expect(block.branches[0]!.value).toBe("'admin'")
      expect(block.branches[1]!.value).toBe("'guest'")
      expect(block.elseChildren).toHaveLength(1)
    }
  })

  it('parses #for blocks', () => {
    const ast = parseTemplate('#for items() as item (item.id)<li>{item.label}</li>#end')
    const block = ast.children[0]!
    expect(block.type).toBe('each')
  })

  it('parses debug tag', () => {
    const ast = parseTemplate('<debug copy label="cart">{cart}</debug>')
    const node = ast.children[0]!
    expect(node.type).toBe('debug')
    if (node.type === 'debug') {
      expect(node.expr).toBe('cart')
      expect(node.label).toBe('cart')
      expect(node.copy).toBe(true)
    }
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

  it('parses style--- custom property bindings', () => {
    const ast = parseTemplate('<div style---pct={progress}></div>')
    const div = ast.children[0]!
    if (div.type === 'element') {
      expect(div.attrs[0]).toEqual({
        name: 'pct',
        kind: 'style',
        value: 'progress',
      })
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

  it('generates branch with Object.is for #case', () => {
    const source = `import { signal, view } from '@jacare/core'
const role = signal('admin')
export default view\`
#case role()
  #when 'admin'
    <p>admin</p>
  #when 'guest'
    <p>guest</p>
  #else
    <p>member</p>
#end
\``
    const result = compile(source)
    expect(result.code).toContain('branch(')
    expect(result.code).toContain("createComment('case')")
    expect(result.code).toContain('Object.is(')
    expect(result.code).toContain("'admin'")
    expect(result.code).toContain("'guest'")
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

  it('resolves #for parent from anchor when nested in #if', () => {
    const source = `import { signal, view } from '@jacare/core'
const show = signal(true)
const items = signal([{ id: '1', label: 'a' }])
export default view\`
#if show()
  #for items() as item (item.id)
    <li>\${item.label}</li>
  #end
#end
\``
    const result = compile(source)
    expect(result.code).toContain('reconcileKeyedList')
    expect(result.code).toMatch(/parent:\s*\w+\.parentNode/)
    expect(result.code).not.toMatch(/parent:\s*target\s*,/)
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
    expect(result.code).toContain('read: () => { const _v = (count() * 2); return typeof _v === \'function\' ? _v() : _v }')
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
    expect(result.code).toContain('bindPropText(_text')
    expect(result.code).toContain(', label)')
    expect(result.code).not.toContain('createTextNode(String(label))')
    expect(result.code).toContain('setAttribute("type", String(type))')
    expect(result.code).toContain('bindModel(')
  })

  it('does not bind plain string constants as signals', () => {
    const source = `import { view } from '@jacare/core'
const code = 'hello'
export default view\`<pre><code>\${code}</code></pre>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).not.toContain('bindText(')
    expect(result.code).toContain('const _v = (code)')
    expect(result.code).toContain("typeof _v === 'function' ? _v() : _v")
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

  it('calls arrow functions used as text expressions', () => {
    const source = `import { view } from '@jacare/core'
const teamOf = (id) => ({ name: id })
export default view\`<span>\${() => teamOf('harbor').name}</span>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).toContain("typeof _v === 'function' ? _v()")
    expect(result.code).not.toMatch(/\.data = String\(\(\) => teamOf/)
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

  it('binds reactive boolean attributes from signal refs', () => {
    const source = `import { computed, signal, view } from '@jacare/core'
const count = signal(0)
const isEmpty = computed(() => count() === 0)
export default view\`
  <button disabled=\${isEmpty}>Clear</button>
\``
    const result = compile(source)
    expect(result.code).toContain('bindAttribute(')
    expect(result.code).toContain('"disabled"')
    expect(result.code).toContain('isEmpty')
    expect(result.code).not.toMatch(/setAttribute\("disabled", String\(isEmpty\)\)/)
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

  it('passes static attributes as component props', () => {
    const source = `import Card from './Card.jcr'
import { view } from '@jacare/core'
export default view\`<Card title="Hello" subtitle="World" />\``
    const result = compile(source)
    expect(result.code).toContain('title: "Hello"')
    expect(result.code).toContain('subtitle: "World"')
  })

  it('does not treat global builtins as component props', () => {
    const source = `import Stat from './Stat.jcr'
import { signal, view } from '@jacare/core'
const renders = signal(0)
export default view\`<Stat :value=\${() => String(renders())} label="Mounts" />\``
    const result = compile(source)
    expect(result.code).not.toContain('props["String"]')
  })

  it('renders component props with bindPropText', () => {
    const source = `import { view } from '@jacare/core'
export default view\`<span>\${text}</span>\``
    const result = compile(source, { filename: '/Badge.jcr' })
    expect(result.code).toContain('bindPropText(_text')
    expect(result.code).toContain('bindPropText')
    expect(result.code).toMatch(/import \{[^}]*bindPropText[^}]*\}/)
  })

  it('emits CPW inline wiring when cpw is enabled', () => {
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``
    const result = compile(source, { mode: 'client', cpw: true })
    expect(result.code).toContain('count.peek')
    expect(result.code).toContain('count.subscribe(')
    expect(result.code).not.toContain('bindText(')
    expect(result.code).not.toContain('import { effect')
  })

  it('emits bindStyleVar for style--- custom properties', () => {
    const source = `import { signal, view } from '@jacare/core'
const progress = signal(0)
export default view\`<div class="bar" style---pct=\${progress}></div>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).toContain('bindStyleVar(')
    expect(result.code).toContain('"--pct"')
  })

  it('emits CPW for style--- custom properties in production mode', () => {
    const source = `import { signal, view } from '@jacare/core'
const progress = signal(50)
export default view\`<div style---pct=\${progress}></div>\``
    const result = compile(source, { mode: 'client', cpw: true })
    expect(result.code).toContain('setProperty("--pct"')
    expect(result.code).toContain('progress.subscribe(')
    expect(result.code).not.toContain('bindStyleVar(')
  })

  it('calls signals inside ternary text expressions', () => {
    const source = `import { signal, view } from '@jacare/core'
const turbo = signal(false)
export default view\`<button>Turbo: \${turbo ? 'on' : 'off'}</button>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).toContain('turbo() ?')
    expect(result.code).not.toMatch(/`\$\{turbo \?/)
  })

  it('does not treat reserved words in braced text as mount props', () => {
    const source = `import { view } from '@jacare/core'
export default view\`<pre>.x { width: var(--pct); }</pre>\``
    const result = compile(source, { mode: 'client' })
    expect(result.code).not.toContain('props["var"]')
    expect(result.code).not.toContain('const var')
  })

  it('emits bindDebug for debug tags in dev mode', () => {
    const source = `import { pulse, view } from '@jacare/core'
const cart = pulse([])
export default view\`<debug copy>\${cart}</debug>\``
    const result = compile(source, { mode: 'client', debug: true })
    expect(result.code).toContain('bindDebug(')
  })

  it('strips debug tags when debug is false', () => {
    const source = `import { pulse, view } from '@jacare/core'
const cart = pulse([])
export default view\`<debug copy>\${cart}</debug>\``
    const result = compile(source, { mode: 'client', debug: false })
    expect(result.code).not.toContain('bindDebug(')
  })

  it('injects pulse names for DevTools in debug mode', () => {
    const source = `import { pulse, derive, view } from '@jacare/core'
const count = pulse(0)
const doubled = derive(() => count() * 2)
export default view\`<p>\${count}</p>\``
    const result = compile(source, {
      mode: 'client',
      debug: true,
      filename: '/src/Counter.jcr',
    })
    expect(result.code).toContain('name: "count"')
    expect(result.code).toContain('name: "doubled"')
    expect(result.code).toContain('devtoolsBind(count,')
  })

  it('skips pulse name injection when debug is false', () => {
    const source = `import { pulse, view } from '@jacare/core'
const count = pulse(0)
export default view\`<p>\${count}</p>\``
    const result = compile(source, { mode: 'client', debug: false })
    expect(result.code).not.toContain('name: "count"')
    expect(result.code).not.toContain('devtoolsBind(')
  })

  it('binds imported pulses/derives without stringifying the getter', () => {
    const source = `import { active, draft, total } from './store.js'
export <view>
  <span>\${active}</span>
  <span>\${total}</span>
  <input bind-value=\${draft} />
</view>`
    const client = compile(source, { mode: 'client', debug: false })
    expect(client.code).toContain('bindPropText(_text')
    expect(client.code).toContain('bindPropText(_text2, active)')
    expect(client.code).toMatch(/bindPropText\([^,]+, total\)/)
    expect(client.code).toMatch(/bindModel\([^,]+, "value", draft\)/)
    expect(client.code).not.toContain('String(active)')
    expect(client.code).not.toContain('String(total)')

    const server = compile(source, { mode: 'server', debug: false })
    expect(server.code).toContain("typeof active === 'function' ? active() : active")
    expect(server.code).toContain("typeof total === 'function' ? total() : total")
    expect(server.code).toContain("kind: 'expr'")
    expect(server.code).not.toContain('String(active)')
  })

  it('binds imported bag members as Mesh Ports (bindText / CPW)', () => {
    const source = `import { cart } from '../bags/cart.js'
export <view>
  <span>\${cart.count()}</span>
  <span>\${cart.money}</span>
</view>`
    const client = compile(source, { mode: 'client', debug: false, cpw: false })
    expect(client.code).toMatch(/bindText\([^,]+, cart\.count\)/)
    expect(client.code).toMatch(/bindText\([^,]+, cart\.money\)/)
    expect(client.code).not.toMatch(/effect\(\(\) => \{ const _v = \(cart\.count/)
    expect(client.code).not.toMatch(/effect\(\(\) => \{ const _v = \(cart\.money/)

    const cpw = compile(source, { mode: 'client', debug: false, cpw: true })
    expect(cpw.code).toMatch(/cart\.count\.peek/)
    expect(cpw.code).toMatch(/cart\.count\.subscribe/)
    expect(cpw.code).toMatch(/cart\.money\.peek/)

    const server = compile(source, { mode: 'server', debug: false })
    expect(server.code).toContain('cart.count()')
    expect(server.code).toContain('cart.money()')
    expect(server.code).toContain("kind: 'signal', read: cart.count")
  })

  it('binds @bag/key address sugar via getBag (no bag import)', () => {
    const source = `export <view>
  <span>\${@lab-cart/count}</span>
  <button type="button" on-click=\${@lab-cart/clear}>Clear</button>
</view>`
    const client = compile(source, { mode: 'client', debug: false, cpw: false })
    expect(client.code).toContain('getBag')
    expect(client.code).toMatch(/bindText\([^,]+, getBag\("lab-cart"\)\?\.count\)/)
    expect(client.code).toContain('getBag("lab-cart")?.clear')
    expect(client.meshPorts).toEqual(
      expect.arrayContaining([
        { bag: 'lab-cart', key: 'count', ref: '@lab-cart/count', source: 'address' },
        { bag: 'lab-cart', key: 'clear', ref: '@lab-cart/clear', source: 'address' },
      ]),
    )
    expect(client.code).toContain('/* jacare-mesh-ports: @lab-cart/clear,@lab-cart/count */')

    const cpw = compile(source, { mode: 'client', debug: false, cpw: true })
    expect(cpw.code).toMatch(/getBag\("lab-cart"\)\?\.count\.peek/)
  })

  it('binds imported plain values with bindPropText (snippet strings)', () => {
    const source = `import { scaffoldCode } from './snippets.js'
export <view>
  <pre>\${scaffoldCode}</pre>
</view>`
    const result = compile(source, { mode: 'client', debug: false })
    expect(result.code).toContain('bindPropText(')
    expect(result.code).toMatch(/bindPropText\([^,]+, scaffoldCode\)/)
    expect(result.code).not.toMatch(/bindText\([^,]+, scaffoldCode\)/)
  })

  it('expands object-shorthand signals inside <debug>', () => {
    const source = `import { pulse, view } from '@jacare/core'
const clicks = pulse(0)
const fruits = pulse([])
export default view\`<debug>\${{ clicks, fruits }}</debug>\``
    const result = compile(source, { mode: 'client', debug: true })
    expect(result.code).toContain('() => ({ clicks: clicks(), fruits: fruits() })')
    expect(result.code).not.toContain('() => ({ clicks(), fruits() })')
  })

  it('does not rewrite signal prefixes inside longer identifiers', () => {
    const source = `import { items, itemsIn } from './store.js'
export <view>
  <span>\${itemsIn(col.id).length}</span>
  <span>\${items().length}</span>
</view>`
    const result = compile(source, { mode: 'client', debug: false })
    expect(result.code).toContain('itemsIn(col.id).length')
    expect(result.code).not.toContain('items()In')
    expect(result.code).toContain('items().length')
  })
})
