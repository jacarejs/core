import { describe, expect, it, vi } from 'vitest'
import { mountIsland } from '../src/island.js'
import { signal } from '../src/signal.js'
import { effect } from '../src/effect.js'

describe('mountIsland', () => {
  it('mounts a function app into a selector target', () => {
    document.body.innerHTML = '<div id="slot"><span>loading</span></div>'
    const count = signal(0)

    const dispose = mountIsland('#slot', (target) => {
      const p = document.createElement('p')
      p.className = 'value'
      target.appendChild(p)
      const { dispose: stop } = effect(() => {
        p.textContent = String(count())
      })
      return stop
    })

    const host = document.querySelector('#slot')!
    expect(host.getAttribute('data-jacare-island')).toBe('')
    expect(host.querySelector('span')).toBeNull()
    expect(host.querySelector('.value')?.textContent).toBe('0')

    count.set(3)
    expect(host.querySelector('.value')?.textContent).toBe('3')

    dispose()
    expect(host.getAttribute('data-jacare-island')).toBeNull()
    expect(host.childNodes).toHaveLength(0)
  })

  it('accepts a module with mount and passes props', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const dispose = mountIsland(
      host,
      {
        mount(target, props = {}) {
          const label = document.createElement('button')
          label.type = 'button'
          label.textContent = String(props.unit ?? 'none')
          target.appendChild(label)
          return () => label.remove()
        },
      },
      { props: { unit: 'metric' }, live: false },
    )

    expect(host.querySelector('button')?.textContent).toBe('metric')
    dispose()
    host.remove()
  })

  it('updates live props without remounting', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    let mounts = 0

    const island = mountIsland(
      host,
      {
        mount(target, props = {}) {
          mounts += 1
          const label = document.createElement('p')
          target.appendChild(label)
          const unit = props.unit as { (): unknown; set: (v: unknown) => void }
          const stop = effect(() => {
            label.textContent = String(unit())
          })
          return stop.dispose
        },
      },
      { props: { unit: 'metric' } },
    )

    expect(mounts).toBe(1)
    expect(host.querySelector('p')?.textContent).toBe('metric')

    island.update({ unit: 'imperial' })
    expect(mounts).toBe(1)
    expect(host.querySelector('p')?.textContent).toBe('imperial')

    island()
    host.remove()
  })

  it('accepts default export shape from compiled .jcr modules', () => {
    const host = document.createElement('div')
    const mount = vi.fn((target: ParentNode) => {
      target.appendChild(document.createTextNode('ok'))
      return () => {}
    })

    const dispose = mountIsland(host, { default: mount })
    expect(mount).toHaveBeenCalledTimes(1)
    expect(host.textContent).toBe('ok')
    dispose()
  })

  it('mounts into an open shadow root when shadow is true', () => {
    const host = document.createElement('div')
    host.innerHTML = '<p class="loading">wait</p>'
    document.body.appendChild(host)

    const dispose = mountIsland(
      host,
      (target) => {
        expect(target).toBeInstanceOf(Element)
        const el = document.createElement('span')
        el.className = 'inside'
        el.textContent = 'shadow'
        target.appendChild(el)
        return () => {}
      },
      { shadow: true },
    )

    expect(host.querySelector('.loading')).toBeNull()
    expect(host.getAttribute('data-jacare-island')).toBe('')
    expect(host.shadowRoot).toBeTruthy()
    expect(host.shadowRoot?.querySelector('.inside')?.textContent).toBe('shadow')
    expect(host.querySelector('.inside')).toBeNull()

    dispose()
    expect(host.shadowRoot?.querySelector('.inside')).toBeNull()
    host.remove()
  })

  it('throws when the selector matches nothing', () => {
    expect(() => mountIsland('#missing', () => () => {})).toThrow(/no element matches/)
  })

  it('throws when app is not a mount function', () => {
    const host = document.createElement('div')
    expect(() => mountIsland(host, {} as never)).toThrow(/expected a mount function/)
  })

  it('skips clear and mark when disabled', () => {
    document.body.innerHTML = '<div id="keep"><em>stay</em></div>'
    const dispose = mountIsland(
      '#keep',
      (target) => {
        target.appendChild(document.createTextNode(' +live'))
        return () => {}
      },
      { clear: false, mark: false },
    )

    const host = document.querySelector('#keep')!
    expect(host.getAttribute('data-jacare-island')).toBeNull()
    expect(host.innerHTML).toContain('<em>stay</em>')
    expect(host.textContent).toContain('+live')
    dispose()
  })
})
