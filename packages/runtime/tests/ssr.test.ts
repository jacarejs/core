import { describe, expect, it } from 'vitest'
import { escapeHtml, renderToString, renderToStream, resumeBindings } from '../src/ssr/index.js'
import { signal } from '../src/signal.js'

describe('SSR', () => {
  it('renderToString returns html from render function', () => {
    const count = signal(5)
    const html = renderToString(() => ({
      html: `<span data-jacare-bind="b1">${count()}</span>`,
      state: { bindings: [{ id: 'b1', kind: 'signal', read: count }] },
    }))
    expect(html).toContain('5')
    expect(html).toContain('data-jacare-bind')
  })

  it('resumeBindings attaches without recreating DOM', () => {
    const count = signal(1)
    const parent = document.createElement('div')
    parent.innerHTML = '<span data-jacare-bind="b1">1</span>'
    document.body.appendChild(parent)

    const cleanups = resumeBindings(parent, {
      bindings: [{ id: 'b1', kind: 'signal', read: count }],
    })

    count.set(9)
    expect(parent.querySelector('[data-jacare-bind="b1"]')?.textContent).toBe('9')
    for (const cleanup of cleanups) cleanup()
    parent.remove()
  })

  it('resumeBindings hydrates expr bindings', () => {
    const label = signal('hello')
    const parent = document.createElement('div')
    parent.innerHTML = '<span data-jacare-bind="b1">hello</span>'
    document.body.appendChild(parent)

    const cleanups = resumeBindings(parent, {
      bindings: [{ id: 'b1', kind: 'expr', read: () => `${label()}!` }],
    })

    label.set('hi')
    expect(parent.querySelector('[data-jacare-bind="b1"]')?.textContent).toBe('hi!')
    for (const cleanup of cleanups) cleanup()
    parent.remove()
  })

  it('escapeHtml neutralizes markup', () => {
    expect(escapeHtml('<script>&')).toBe('&lt;script&gt;&amp;')
  })

  it('renderToStream yields top-level chunks', async () => {
    const chunks: string[] = []
    for await (const chunk of renderToStream(() => ({
      html: '<div>a</div><div>b</div>',
      state: { bindings: [] },
    }))) {
      chunks.push(chunk)
    }
    expect(chunks).toEqual(['<div>a</div>', '<div>b</div>'])
  })
})
