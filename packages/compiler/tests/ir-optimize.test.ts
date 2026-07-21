import { describe, expect, it } from 'vitest'
import { compile } from '../src/compile.js'
import { lowerIf } from '../src/ir/lower-flow.js'
import {
  markCpwOps,
  mergeStaticTextParts,
  optimizeIfPlan,
} from '../src/ir/optimize.js'
import { lowerElementBindings } from '../src/ir/lower-leaf.js'
import { parseTemplate } from '../src/parse-template.js'

describe('IR optimize', () => {
  it('marks bindClass as cpw for signals', () => {
    const ops = lowerElementBindings(
      [{ name: 'on', kind: 'class', value: 'open()' }],
      { signals: new Set(['open']), cpw: false },
    )
    expect(ops[0]).toMatchObject({ mode: 'bindClass' })
    expect(markCpwOps(ops, true)[0]).toMatchObject({ mode: 'cpw' })
  })

  it('merges adjacent static text parts', () => {
    expect(
      mergeStaticTextParts([
        { type: 'static', value: 'a' },
        { type: 'static', value: 'b' },
        { type: 'expr', value: 'n' },
        { type: 'static', value: 'c' },
        { type: 'static', value: 'd' },
      ]),
    ).toEqual([
      { type: 'static', value: 'ab' },
      { type: 'expr', value: 'n' },
      { type: 'static', value: 'cd' },
    ])
  })

  it('DCE constant-true #if to static children', () => {
    const ast = parseTemplate(`#if true\n  <p>ok</p>\n#else\n  <p>no</p>\n#end`)
    const node = ast.children[0]!
    expect(node.type).toBe('if')
    if (node.type !== 'if') return
    const opt = optimizeIfPlan(lowerIf(node))
    expect(opt.kind).toBe('static')
    if (opt.kind === 'static') {
      expect(opt.children).toHaveLength(1)
    }
  })

  it('DCE constant-false arms and keep else', () => {
    const ast = parseTemplate(`#if false\n  <p>a</p>\n#else\n  <p>b</p>\n#end`)
    const node = ast.children[0]!
    expect(node.type).toBe('if')
    if (node.type !== 'if') return
    const opt = optimizeIfPlan(lowerIf(node))
    expect(opt.kind).toBe('static')
    if (opt.kind === 'static') {
      expect(opt.children[0]).toMatchObject({ type: 'element', tag: 'p' })
    }
  })

  it('compiles constant #if without branch runtime', () => {
    const result = compile(
      `export <view>
       #if true
         <span>yes</span>
       #end
       </view>`,
    )
    expect(result.code).not.toContain('branch(')
    expect(result.code).toContain("createElement('span')")
  })
})
