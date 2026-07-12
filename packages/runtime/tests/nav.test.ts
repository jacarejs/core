import { describe, expect, it, vi } from 'vitest'
import { createNav } from '../src/nav/create-nav.js'
import { lazy } from '../src/nav/lazy.js'
import {
  matchPath,
  matchScreen,
  normalizePath,
  normalizeScreens,
} from '../src/nav/match.js'

describe('matchPath', () => {
  it('matches static paths', () => {
    expect(matchPath('/tasks', '/tasks')).toEqual({})
    expect(matchPath('/', '/')).toEqual({})
  })

  it('captures params', () => {
    expect(matchPath('/tasks/:id', '/tasks/42')).toEqual({ id: '42' })
  })

  it('rejects mismatched paths', () => {
    expect(matchPath('/tasks', '/about')).toBeNull()
    expect(matchPath('/tasks/:id', '/tasks')).toBeNull()
  })
})

describe('normalizeScreens', () => {
  it('builds screen patterns', () => {
    const screens = normalizeScreens({
      '/': vi.fn(),
      about: vi.fn(),
    })

    expect(screens.map((screen) => screen.pattern)).toEqual(['/', '/about'])
  })
})

describe('matchScreen', () => {
  it('picks the most specific screen', () => {
    const screens = normalizeScreens({
      '/tasks': vi.fn(),
      '/tasks/:id': vi.fn(),
    })

    const match = matchScreen(screens, '/tasks/7')
    expect(match?.entry.pattern).toBe('/tasks/:id')
    expect(match?.params).toEqual({ id: '7' })
  })
})

describe('createNav', () => {
  it('attaches the active screen', async () => {
    window.history.pushState({}, '', '/')
    const Home = vi.fn((target: HTMLElement) => {
      target.textContent = 'home'
      return () => {}
    })
    const About = vi.fn((target: HTMLElement) => {
      target.textContent = 'about'
      return () => {}
    })

    const nav = createNav({
      screens: {
        '/': Home,
        '/about': About,
      },
    })

    const target = document.createElement('div')
    const dispose = nav.attach(target)
    await flush()

    expect(Home).toHaveBeenCalledTimes(1)
    expect(target.textContent).toBe('home')

    await nav.go('/about')
    await flush()

    expect(About).toHaveBeenCalledTimes(1)
    expect(target.textContent).toBe('about')

    dispose()
  })

  it('runs beforeGo guards', async () => {
    const Home = vi.fn((target: HTMLElement) => {
      target.textContent = 'home'
      return () => {}
    })
    const Login = vi.fn((target: HTMLElement) => {
      target.textContent = 'login'
      return () => {}
    })

    const nav = createNav({
      screens: {
        '/': Home,
        '/login': Login,
      },
      beforeGo: (to) => {
        if (to.path === '/') return '/login'
      },
    })

    const target = document.createElement('div')
    nav.attach(target)

    await nav.go('/')
    await flush()

    expect(Login).toHaveBeenCalledTimes(1)
    expect(normalizePath(window.location.pathname)).toBe('/login')
  })

  it('warms lazy module default exports', async () => {
    const load = vi.fn(async () => ({
      default: (target: HTMLElement) => {
        target.textContent = 'module'
        return () => {}
      },
      lifecycle: {
        onActivate: vi.fn(),
      },
    }))

    const nav = createNav({
      screens: {
        '/module': load,
      },
    })

    await nav.warm('/module')

    const target = document.createElement('div')
    nav.attach(target)
    await nav.go('/module')
    await flush()

    expect(target.textContent).toBe('module')
  })

  it('warms lazy screens', async () => {
    const load = vi.fn(async () => ({
      mount: (target: HTMLElement) => {
        target.textContent = 'lazy'
        return () => {}
      },
    }))

    const nav = createNav({
      screens: {
        '/lazy': load,
      },
    })

    await nav.warm('/lazy')
    expect(load).toHaveBeenCalledTimes(1)

    const target = document.createElement('div')
    nav.attach(target)
    await nav.go('/lazy')
    await flush()

    expect(load).toHaveBeenCalledTimes(1)
    expect(target.textContent).toBe('lazy')
  })

  it('mounts screens inside a layout frame', async () => {
    const Shell = vi.fn((target: HTMLElement) => {
      target.innerHTML = '<div jacare-frame></div>'
      return () => {}
    })
    const Page = vi.fn((target: HTMLElement) => {
      target.textContent = 'page'
      return () => {}
    })

    const nav = createNav({
      layout: Shell,
      screens: {
        '/page': Page,
      },
    })

    const target = document.createElement('div')
    nav.attach(target)
    await nav.go('/page')
    await flush()

    expect(Shell).toHaveBeenCalled()
    expect(Page).toHaveBeenCalled()
    expect(target.querySelector('[jacare-frame]')?.textContent).toBe('page')
  })

  it('keeps layout mounted across navigations', async () => {
    window.history.pushState({}, '', '/')
    const Shell = vi.fn((target: HTMLElement) => {
      target.innerHTML = '<div jacare-frame></div>'
      return () => {}
    })
    const Home = vi.fn((target: HTMLElement) => {
      target.textContent = 'home'
      return () => {}
    })
    const About = vi.fn((target: HTMLElement) => {
      target.textContent = 'about'
      return () => {}
    })

    const nav = createNav({
      layout: Shell,
      screens: {
        '/': Home,
        '/about': About,
      },
    })

    const target = document.createElement('div')
    nav.attach(target)
    await flush()

    await nav.go('/about')
    await flush()

    expect(Shell).toHaveBeenCalledTimes(1)
    expect(Home).toHaveBeenCalledTimes(1)
    expect(About).toHaveBeenCalledTimes(1)
    expect(target.querySelector('[jacare-frame]')?.textContent).toBe('about')
  })

  it('queues rapid navigations', async () => {
    window.history.pushState({}, '', '/')
    const order: string[] = []
    const Home = vi.fn((target: HTMLElement) => {
      order.push('home')
      target.textContent = 'home'
      return () => {}
    })
    const About = vi.fn((target: HTMLElement) => {
      order.push('about')
      target.textContent = 'about'
      return () => {}
    })
    const Settings = vi.fn((target: HTMLElement) => {
      order.push('settings')
      target.textContent = 'settings'
      return () => {}
    })

    const nav = createNav({
      screens: {
        '/': Home,
        '/about': About,
        '/settings': Settings,
      },
    })

    const target = document.createElement('div')
    nav.attach(target)
    await flush()

    const pending = Promise.all([
      nav.go('/about'),
      nav.go('/settings'),
      nav.go('/'),
    ])
    await pending
    await flush()

    expect(order).toEqual(['home', 'about', 'settings', 'home'])
    expect(target.textContent).toBe('home')
  })

  it('detects lazy loaders with explicit helper', async () => {
    const load = vi.fn(async () => ({
      mount: (target: HTMLElement) => {
        target.textContent = 'lazy'
        return () => {}
      },
    }))

    const nav = createNav({
      screens: {
        '/lazy': lazy(load),
      },
    })

    const target = document.createElement('div')
    nav.attach(target)
    await nav.go('/lazy')
    await flush()

    expect(load).toHaveBeenCalledTimes(1)
    expect(target.textContent).toBe('lazy')
  })

  it('handles subpath base for navigation and active links', async () => {
    window.history.pushState({}, '', '/core/')
    const Home = vi.fn((target: HTMLElement) => {
      target.textContent = 'home'
      return () => {}
    })
    const About = vi.fn((target: HTMLElement) => {
      target.textContent = 'about'
      return () => {}
    })

    const nav = createNav({
      base: '/core',
      screens: {
        '/': Home,
        '/about': About,
      },
    })

    const tasksLink = document.createElement('a')
    tasksLink.setAttribute('jacare-go', '/')
    document.body.appendChild(tasksLink)

    const feedbackLink = document.createElement('a')
    feedbackLink.setAttribute('jacare-go', '/about?tab=feedback')
    document.body.appendChild(feedbackLink)

    const target = document.createElement('div')
    nav.attach(target)
    await flush()

    expect(tasksLink.classList.contains('jacare-here')).toBe(true)
    expect(normalizePath(window.location.pathname)).toBe('/core')

    await nav.go('/about?tab=feedback')
    await flush()

    expect(About).toHaveBeenCalledTimes(1)
    expect(normalizePath(window.location.pathname)).toBe('/core/about')
    expect(feedbackLink.classList.contains('jacare-here')).toBe(true)

    await nav.go('/core/about')
    await flush()
    expect(normalizePath(window.location.pathname)).toBe('/core/about')
    expect(About).toHaveBeenCalledTimes(2)

    tasksLink.remove()
    feedbackLink.remove()
  })

  it('mounts the missing screen for unknown paths', async () => {
    const Home = vi.fn((target: HTMLElement) => {
      target.textContent = 'home'
      return () => {}
    })
    const NotFound = vi.fn((target: HTMLElement, ctx) => {
      target.textContent = `missing:${ctx.path}`
      return () => {}
    })

    const nav = createNav({
      layout: (target) => {
        target.innerHTML = '<div jacare-frame></div>'
        return () => {}
      },
      screens: {
        '/': Home,
      },
      missing: NotFound,
    })

    const target = document.createElement('div')
    window.history.pushState({}, '', '/nope')
    nav.attach(target)
    await flush()

    expect(NotFound).toHaveBeenCalledTimes(1)
    expect(target.querySelector('[jacare-frame]')?.textContent).toBe('missing:/nope')
  })
})

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}
