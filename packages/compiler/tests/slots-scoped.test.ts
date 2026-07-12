import { describe, expect, it } from 'vitest'
import { compile, parseModule, parseTemplate } from '../src/index.js'
import { scopeCss } from '../src/scope-css.js'

describe('scoped CSS', () => {
  it('extracts style template from module', () => {
    const mod = parseModule(`import { view } from '@jacare/core'
export default view\`<p>hi</p>\`
style\`
.title { color: red; }
\``)
    expect(mod.styleCss).toContain('.title')
    expect(mod.code).not.toContain('style`')
  })

  it('scopes selectors with data attribute', () => {
    const scoped = scopeCss('.title { color: red; }\n.btn { padding: 4px; }', 'abc123')
    expect(scoped).toContain('[data-jacare-s="abc123"] .title')
    expect(scoped).toContain('[data-jacare-s="abc123"] .btn')
  })

  it('injects scoped style in mount', () => {
    const source = `import { view } from '@jacare/core'
export default view\`<p class="title">hi</p>\`
style\`
.title { color: red; }
\``
    const result = compile(source, { filename: '/Card.jcr' })
    expect(result.scopedStyle).toContain('[data-jacare-s=')
    expect(result.code).toContain("target.setAttribute('data-jacare-s'")
    expect(result.code).toContain('ensureScopedStyle(')
  })
})

describe('slots and children', () => {
  it('parses component children', () => {
    const ast = parseTemplate('<Card :title="x"><p>body</p></Card>')
    const card = ast.children[0]!
    expect(card.type).toBe('component')
    if (card.type === 'component') {
      expect(card.children).toHaveLength(1)
      expect(card.selfClosing).toBe(false)
    }
  })

  it('parses slot element', () => {
    const ast = parseTemplate('<div><slot /></div>')
    const div = ast.children[0]!
    if (div.type === 'element') {
      expect(div.children[0]?.type).toBe('slot')
    }
  })

  it('compiles children as slot render function', () => {
    const source = `import Card from './Card.jcr'
import { view } from '@jacare/core'
export default view\`
<Card :title="'Hello'">
  <p>content</p>
</Card>
\``
    const result = compile(source)
    expect(result.code).toContain('children:')
    expect(result.code).toContain('slotTarget')
  })

  it('compiles slot mount in child component', () => {
    const source = `import { view } from '@jacare/core'
export default view\`
<div class="card">
  <slot />
</div>
\``
    const result = compile(source)
    expect(result.code).toContain('mountSlot(')
    expect(result.code).toContain('const children = props["children"]')
  })
})
