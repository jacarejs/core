import { describe, expect, it, vi } from 'vitest'
import { routeHref, screenProps } from '../src/nav/route.js'
import { screen } from '../src/nav/screen.js'

describe('route helpers', () => {
  it('builds friendly hrefs with params and search', () => {
    expect(routeHref('/tutorial/:topic', { topic: 'nav' })).toBe('/tutorial/nav')
    expect(routeHref('/about', {}, { tab: 'feedback' })).toBe('/about?tab=feedback')
  })

  it('merges params and search into screen props', () => {
    expect(
      screenProps({
        path: '/tutorial/nav',
        params: { topic: 'nav' },
        search: { q: '1' },
      }),
    ).toEqual({
      topic: 'nav',
      q: '1',
      path: '/tutorial/nav',
      params: { topic: 'nav' },
      search: { q: '1' },
    })
  })
})

describe('screen adapter', () => {
  it('passes route props and runs lifecycle hooks', () => {
    const onActivate = vi.fn(() => () => onActivate.mock.calls.length)
    const onDeactivate = vi.fn()
    const mount = vi.fn(() => () => {})

    const wrapped = screen({
      default: mount,
      lifecycle: {
        onActivate,
        onDeactivate,
      },
    })

    const host = document.createElement('div')
    const dispose = wrapped(host, {
      path: '/tutorial/forms',
      params: { topic: 'forms' },
      search: {},
    })

    expect(onActivate).toHaveBeenCalled()
    expect(mount).toHaveBeenCalledWith(host, expect.objectContaining({ topic: 'forms' }))

    dispose()
    expect(onDeactivate).toHaveBeenCalled()
  })
})
