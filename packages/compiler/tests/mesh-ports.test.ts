import { describe, expect, it } from 'vitest'
import { compile, collectMeshPorts, parseModule, parseTemplate, detectImportedNames, detectSignals } from '../src/index.js'

describe('mesh port slice hints (M5)', () => {
  it('collects imported Mesh Ports and emits a bundler comment', () => {
    const source = `import { cart } from '../bags/cart.js'
export <view>
  <span>\${cart.count()}</span>
  <button type="button" on-click=\${() => cart.add(item)}>Add</button>
</view>`
    const result = compile(source, { mode: 'client', debug: false })
    expect(result.meshPorts).toEqual(
      expect.arrayContaining([
        { bag: 'cart', key: 'count', ref: 'cart.count', source: 'mesh' },
        { bag: 'cart', key: 'add', ref: 'cart.add', source: 'mesh' },
      ]),
    )
    expect(result.code).toMatch(/^\/\* jacare-mesh-ports: cart\.add,cart\.count \*\//m)
  })

  it('collects contract link addresses as @bag/key', () => {
    const source = `export <contract>
  links: {
    count: { from: 'lab-cart.count', mode: 'read' }
  }
</contract>
export <view>
  <span>\${count}</span>
</view>`
    const result = compile(source, { mode: 'client', debug: false })
    expect(result.meshPorts).toEqual([
      { bag: 'lab-cart', key: 'count', ref: '@lab-cart/count', source: 'link' },
    ])
    expect(result.code).toContain('/* jacare-mesh-ports: @lab-cart/count */')
  })

  it('collectMeshPorts walks control-flow expressions', () => {
    const source = `import { cart } from './cart.js'
export <view>
  #if cart.count() > 0
    <p>\${cart.money}</p>
  #end
</view>`
    const mod = parseModule(source)
    const ast = parseTemplate(mod.viewHtml!)
    const ports = collectMeshPorts(ast, {
      signals: detectSignals(mod.code),
      importedNames: detectImportedNames(mod.code),
    })
    expect(ports.map((p) => p.ref).sort()).toEqual(['cart.count', 'cart.money'])
  })
})
