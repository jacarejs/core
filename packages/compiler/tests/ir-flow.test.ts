import { describe, expect, it } from 'vitest'
import { compile } from '../src/compile.js'
import { lowerCase, lowerEach, lowerIf } from '../src/ir/lower-flow.js'
import { parseTemplate } from '../src/parse-template.js'

describe('lower flow', () => {
  it('lowers #if tests once for client and SSR', () => {
    const ast = parseTemplate(`#if loading()\n  <p>…</p>\n#elif error\n  <p>err</p>\n#else\n  <ok/>\n#end`)
    const ifNode = ast.children[0]!
    expect(ifNode.type).toBe('if')
    if (ifNode.type !== 'if') return
    const plan = lowerIf(ifNode)
    expect(plan.branches.map((b) => b.test)).toEqual(['loading()', 'error'])
    expect(plan.elseChildren.length).toBe(1)

    const full = compile(
      `import { signal } from '@jacare/core'
       const loading = signal(false)
       const error = signal('')
       export <view>
       #if loading()
         <p>load</p>
       #elif error()
         <p>err</p>
       #else
         <p>ok</p>
       #end
       </view>`,
      { mode: 'full' },
    )
    expect(full.code).toContain('if (loading())')
    expect(full.code).toContain('else if (error())')
    const clientIf = full.code.indexOf('if (loading())')
    const ssrIf = full.code.lastIndexOf('if (loading())')
    expect(clientIf).toBeGreaterThan(-1)
    expect(ssrIf).toBeGreaterThan(clientIf)
  })

  it('lowers #case scrutinee and values', () => {
    const ast = parseTemplate(`#case role()\n  #when 'a'\n    <a/>\n  #when 'b'\n    <b/>\n#end`)
    const node = ast.children[0]!
    expect(node.type).toBe('case')
    if (node.type !== 'case') return
    const plan = lowerCase(node)
    expect(plan.scrutinee).toBe('role()')
    expect(plan.branches.map((b) => b.value)).toEqual(["'a'", "'b'"])
  })

  it('lowers #for source and getKey for client+SSR', () => {
    const ast = parseTemplate(`#for items() as item (item.id)\n  <li>\${item.label}</li>\n#end`)
    const node = ast.children[0]!
    expect(node.type).toBe('each')
    if (node.type !== 'each') return
    const plan = lowerEach(node, { signals: new Set(['items']) })
    expect(plan.sourceExpr).toBe('items()')
    expect(plan.keyExpr).toBe('item.id')
    expect(plan.getKey).toBe('(item, _index) => item.id')
    expect(plan.sourceBinding).toEqual({
      kind: 'signal',
      name: 'items',
      local: true,
    })

    const result = compile(
      `import { signal } from '@jacare/core'
       const items = signal([{ id: 1, label: 'a' }])
       export <view>
       <ul>
       #for items() as item (item.id)
         <li>\${item.label}</li>
       #end
       </ul>
       </view>`,
      { mode: 'full' },
    )
    expect(result.code).toContain('getKey: (item, _index) => item.id')
    expect(result.code).toContain('items()')
    expect(result.code).toContain('for (let _index = 0')
  })

  it('keeps #for inside #if with branch + list', () => {
    const result = compile(
      `import { signal } from '@jacare/core'
       const show = signal(true)
       const items = signal([{ id: 1 }])
       export <view>
       #if show()
         #for items() as item (item.id)
           <span>\${item.id}</span>
         #end
       #end
       </view>`,
    )
    expect(result.code).toContain('branch(')
    expect(result.code).toContain('reconcileKeyedList')
    expect(result.code).toContain('getKey: (item, _index) => item.id')
    expect(result.code).toContain('parent: _each')
  })
})
