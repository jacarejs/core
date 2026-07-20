import { describe, expect, it } from 'vitest'
import { compile } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const DEBUG_SOURCE = `import { pulse, view } from '@jacare/core'

const cart = pulse([
  { id: 'a', qty: 1 },
  { id: 'b', qty: 2 },
])

export default view\`
  <debug copy label="cart">\${cart}</debug>
\``

function loadApp(source: string, options: { debug?: boolean } = {}) {
  const { code } = compile(source, options)
  const body = code
    .replace(/^import[^\n]*\n/, '')
    .replace(/^export default mount\s*/m, '')
    .replace(/^export /gm, '')
  return new Function(
    'runtime',
    `const { pulse, effect, bindDebug, runUntracked } = runtime
${body}
return { mount, cart }`,
  )(runtime) as {
    mount: (target: HTMLElement) => () => void
    cart: { update: (fn: (items: { id: string; qty: number }[]) => { id: string; qty: number }[]) => void }
  }
}

describe('bindDebug', () => {
  it('renders pretty JSON without HTML escaping', async () => {
    const { mount } = loadApp(DEBUG_SOURCE)
    const root = document.createElement('div')
    mount(root)

    const pre = root.querySelector('.jacare-debug-body')
    expect(pre?.textContent).toContain('"id": "a"')
    expect(pre?.textContent).not.toContain('&quot;')
  })

  it('updates when the bound value changes', async () => {
    const { mount, cart } = loadApp(DEBUG_SOURCE)
    const root = document.createElement('div')
    mount(root)

    cart.update((items) => items.map((item) => (item.id === 'a' ? { ...item, qty: 9 } : item)))
    await Promise.resolve()

    expect(root.querySelector('.jacare-debug-body')?.textContent).toContain('"qty": 9')
  })

  it('shows a copy button when copy is set', () => {
    const { mount } = loadApp(DEBUG_SOURCE)
    const root = document.createElement('div')
    mount(root)

    expect(root.querySelector('.jacare-debug-copy')?.textContent).toBe('Copy JSON')
  })
})

describe('compile debug flag', () => {
  it('emits bindDebug in dev mode', () => {
    const result = compile(DEBUG_SOURCE, { debug: true, mode: 'client' })
    expect(result.code).toContain('bindDebug(')
  })

  it('strips debug output in production mode', () => {
    const result = compile(DEBUG_SOURCE, { debug: false, mode: 'client' })
    expect(result.code).not.toContain('bindDebug(')
  })
})
