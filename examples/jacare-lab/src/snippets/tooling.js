export const cliCode = `jacare new my-app --template=nav
jacare dev --port=4000
jacare build
jacare compile src/app.jcr dist/app.js --watch
jacare check`

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

export const devtoolsCode = `// boot.js -- already wired in this lab
if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}`

export const testingCode = `import { compile } from '@jacare/compiler'
import { it, expect } from 'vitest'

it('mounts and reacts to clicks', () => {
  const { code } = compile(source, { filename: 'Counter.jcr' })
  const mod = evalModule(code) // your own eval/import helper
  const dispose = mod.mount(document.body)
  document.querySelector('button').click()
  expect(document.querySelector('.metric').textContent).toBe('1')
  dispose()
})`

export const scriptsCode = `{
  "scripts": {
    "dev": "jacare dev",
    "build": "jacare build",
    "check": "jacare check",
    "test": "vitest run"
  }
}`
