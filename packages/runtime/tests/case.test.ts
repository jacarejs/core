import { describe, expect, it } from 'vitest'
import { compile } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const CASE_APP = `import { pulse, view } from '@jacare/core'

const status = pulse('loading')

export default view\`
#case status()
  #when 'loading'
    <p data-k="loading">loading</p>
  #when 'ready'
    <p data-k="ready">ready</p>
  #else
    <p data-k="other">other</p>
#end
\``

function loadApp(source: string) {
  const { code } = compile(source)
  const body = code
    .replace(/^import[^\n]*\n/, '')
    .replace(/^export default mount\s*/m, '')
    .replace(/^export /gm, '')
  return new Function(
    'runtime',
    `const { signal, computed, pulse, derive, effect, bindText, bindAttribute, bindModel, bindClass, showIf, branch, reconcileKeyedList, resumeBindings } = runtime
${body}
return { mount, status }`,
  )(runtime) as {
    mount: (target: HTMLElement) => () => void
    status: { set: (value: string) => void }
  }
}

describe('#case control flow', () => {
  it('mounts the matching when branch and switches on change', async () => {
    const { mount, status } = loadApp(CASE_APP)
    const root = document.createElement('div')
    const dispose = mount(root)

    expect(root.querySelector('[data-k="loading"]')?.textContent).toBe('loading')
    expect(root.querySelector('[data-k="ready"]')).toBeNull()

    status.set('ready')
    await Promise.resolve()
    expect(root.querySelector('[data-k="loading"]')).toBeNull()
    expect(root.querySelector('[data-k="ready"]')?.textContent).toBe('ready')

    status.set('error')
    await Promise.resolve()
    expect(root.querySelector('[data-k="other"]')?.textContent).toBe('other')
    expect(root.querySelector('[data-k="ready"]')).toBeNull()

    dispose()
  })
})
