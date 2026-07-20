import { describe, expect, it } from 'vitest'
import { compile, parseStyle, isReactiveStyle } from '../src/index.js'

describe('reactive style directives', () => {
  it('parses #if / #elif / #else in style', () => {
    const ast = parseStyle(`.card {
  #if theme() === 'night'
    background: #000;
  #elif theme() === 'dusk'
    background: #fc8;
  #else
    background: #fff;
  #end
}`)
    expect(isReactiveStyle(ast)).toBe(true)
    expect(ast.children.some((n) => n.type === 'if')).toBe(true)
  })

  it('parses #case / #when in style', () => {
    const ast = parseStyle(`#case tone()
  #when 'ok'
.badge { color: green; }
  #when 'warn'
.badge { color: orange; }
  #else
.badge { color: gray; }
#end`)
    const node = ast.children.find((n) => n.type === 'case')
    expect(node?.type).toBe('case')
    if (node?.type === 'case') {
      expect(node.branches).toHaveLength(2)
      expect(node.elseChildren.length).toBeGreaterThan(0)
    }
  })

  it('parses #for and ${} interpolations in style', () => {
    const ast = parseStyle(`#for accents as accent (accent.id)
.chip-\${accent.id} {
  border-color: \${accent.color};
}
#end`)
    expect(ast.children[0]?.type).toBe('for')
    if (ast.children[0]?.type === 'for') {
      expect(ast.children[0].itemName).toBe('accent')
      expect(ast.children[0].children.some((n) => n.type === 'interp')).toBe(true)
    }
  })

  it('keeps static style on ensureScopedStyle path', () => {
    const result = compile(
      `import { view } from '@jacare/core'
export default view\`<p class="t">hi</p>\`
export <style>
.t { color: red; }
</style>`,
      { filename: '/Static.jcr' },
    )
    expect(result.code).toContain('ensureScopedStyle')
    expect(result.code).not.toContain('bindStyleSheet')
  })

  it('compiles reactive style to bindStyleSheet', () => {
    const result = compile(
      `import { signal, view } from '@jacare/core'
const theme = signal('day')
export default view\`<div class="card">hi</div>\`
export <style>
.card {
  #if theme() === 'night'
    background: #0b1a14;
  #else
    background: #f8fffb;
  #end
}
</style>`,
      { filename: '/Reactive.jcr' },
    )
    expect(result.code).toContain('bindStyleSheet')
    expect(result.code).toContain('theme() === \'night\'')
    expect(result.code).not.toContain('ensureScopedStyle')
  })
})
