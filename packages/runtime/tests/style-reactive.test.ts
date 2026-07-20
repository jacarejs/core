import { describe, expect, it } from 'vitest'
import { compile } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const STYLE_APP = `import { pulse, view } from '@jacare/core'

const theme = pulse('day')

export default view\`
<div class="card" data-testid="card">hello</div>
\`

export <style>
.card {
  padding: 8px;
  #if theme() === 'night'
    background: rgb(11, 26, 20);
    color: rgb(232, 248, 220);
  #else
    background: rgb(248, 255, 251);
    color: rgb(11, 26, 20);
  #end
}
</style>
`

function loadApp(source: string) {
  const { code } = compile(source, { filename: '/StyleCase.jcr' })
  const body = code
    .replace(/^import[^\n]*\n/, '')
    .replace(/^export default mount\s*/m, '')
    .replace(/^export /gm, '')
  return new Function(
    'runtime',
    `const { signal, computed, pulse, derive, effect, bindText, bindAttribute, bindModel, bindClass, showIf, branch, reconcileKeyedList, resumeBindings, ensureScopedStyle, bindStyleSheet, scopeCss } = runtime
${body}
return { mount, theme }`,
  )(runtime) as {
    mount: (target: HTMLElement) => () => void
    theme: { set: (value: string) => void }
  }
}

describe('reactive style sheets', () => {
  it('updates scoped CSS when a pulse used in #if changes', async () => {
    const { mount, theme } = loadApp(STYLE_APP)
    const root = document.createElement('div')
    const dispose = mount(root)

    const scopeId = root.getAttribute('data-jacare-s')
    expect(scopeId).toBeTruthy()

    const styleEl = document.head.querySelector(`style[data-jacare-s="${scopeId}"]`)
    expect(styleEl?.textContent).toContain('248, 255, 251')

    theme.set('night')
    await Promise.resolve()

    expect(styleEl?.textContent).toContain('11, 26, 20')
    expect(styleEl?.textContent).toContain('232, 248, 220')

    dispose()
    expect(document.head.querySelector(`style[data-jacare-s="${scopeId}"]`)).toBeNull()
  })
})
