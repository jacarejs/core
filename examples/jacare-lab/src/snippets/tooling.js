export const cliCode = `jacare new my-app --template=nav
jacare dev --port=4000
jacare build
jacare compile src/app.jcr dist/app.js --watch
jacare check
jacare check --bindings`

export const checkBindingsCode = `$ jacare check --bindings
ok …/Card.jcr
  bindings (4):
    - text · title · bindText · prop
    - class · open · bindClass · signal
    - model · value · bindModel · signal
    - if · open()
ok …/Field.jcr
  bindings (2):
    - text · label · bindText · prop
    - model · value · bindModel · signal

102 file(s) ok`

export const expressionStyleCode = `import { pulse, derive } from '@jacare/core'
import { cart } from '../bags/cart.js'
import { t } from '../i18n/index.js'

const open = pulse(false)
const canEdit = derive(() => true)

<!-- prefer — no free locals -->
\${cart.count()}
\${t('home.lead')}
class-on=\${open()}
:disabled=\${!canEdit()}

<!-- keep arrow — captures loop / handler args -->
#for items() as item (item.id)
  <span>\${() => label(item.id)}</span>
  <button on-click=\${() => remove(item.id)}>×</button>
#end

# jacare check          # soft warn on redundant () =>
# jacare check --strict-style
# jacare check --no-style`

export const bindingIrCode = `import {
  inspectTemplateBindings,
  lowerMountAst,
  parseModule,
  parseTemplate,
} from '@jacare/compiler'

const mod = parseModule(source, 'Card.jcr')
const ast = parseTemplate(mod.viewHtml, { filename: 'Card.jcr' })

// Same sites as jacare check --bindings
inspectTemplateBindings(ast)

// Forest shared by mount() and render()
lowerMountAst(ast, { signals: new Set(['open']), cpw: false })`


export const vitePluginCode = `import jacare from '@jacare/vite-plugin'

export default {
  plugins: [
    jacare({
      emit: 'auto',       // 'auto' | 'client' | 'server' | 'full'
      cpw: 'auto',        // 'auto' | true | false
      inspect: true,      // write .jacare/compiled/*.js
      runtimeImport: '@jacare/core',
    }),
  ],
}`

export const compileApiCode = `import { compile } from '@jacare/compiler'

const result = compile(source, {
  filename: 'Card.jcr',
  mode: 'client', // 'client' | 'server' | 'full'
  cpw: true,
})

result.code // generated JavaScript
result.map  // source map`

export const devtoolsCode = `// boot.js — wired in this lab
if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools({
    position: 'bottom-right',
  })
}

// Pulse Graph tabs: Graph | Mesh | Scope
// ↗ Pop out → separate window (↙ docks back)
// ⚙ Config: corners, clear highlight / selection / Scope, reset layout

// Scope (manual watch list):
import { registerScope, clearScope } from '@jacare/core'
registerScope('cart.total', 'Cart total', () => total())

// Mesh tab shows createBag as @lab-cart/* — open /bag`

export const namedPulsesCode = `import { pulse, derive } from '@jacare/core'

const count = pulse(0)
const doubled = derive(() => count() * 2)

function bump() {
  count.update((n) => n + 1)
}

export <view>
  <button on-click=\${bump}>count++</button>
  <p>count \${count} · doubled \${doubled}</p>
</view>

// In DEV the Pulse Graph shows:
//   count · tooling.jcr:N
//   doubled · tooling.jcr:N
// Hover → outlines the <p> text nodes.`

export const testingCode = `import { compile, inspectTemplateBindings, parseModule, parseTemplate } from '@jacare/compiler'
import { it, expect } from 'vitest'

it('mounts and reacts to clicks', () => {
  const { code } = compile(source, { filename: 'Counter.jcr' })
  const mod = evalModule(code) // your own eval/import helper
  const dispose = mod.mount(document.body)
  document.querySelector('button').click()
  expect(document.querySelector('.metric').textContent).toBe('1')
  dispose()
})

it('exposes Binding IR sites', () => {
  const mod = parseModule(source, 'Counter.jcr')
  const ast = parseTemplate(mod.viewHtml, { filename: 'Counter.jcr' })
  const sites = inspectTemplateBindings(ast)
  expect(sites.some((s) => s.kind === 'text')).toBe(true)
})`

export const scriptsCode = `{
  "scripts": {
    "dev": "jacare dev",
    "build": "jacare build",
    "check": "jacare check",
    "check:bindings": "jacare check --bindings",
    "test": "vitest run"
  }
}`
