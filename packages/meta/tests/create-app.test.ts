import { describe, expect, it, vi } from 'vitest'
import type { NavMount } from '@jacare/core'
import { createJacareApp, createJacareAppFromRoutes } from '../src/create-app.js'

const Shell: NavMount = (target) => {
  target.innerHTML = '<div jacare-frame></div>'
  return () => {}
}

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe('createJacareApp', () => {
  it('creates nav from screens without requiring pagesDir scan', async () => {
    window.history.pushState({}, '', '/')
    const Home = vi.fn((target: HTMLElement) => {
      target.textContent = 'home'
      return () => {}
    })

    const nav = createJacareApp({
      layout: Shell,
      screens: { '/': Home },
      pagesDir: 'src/pages',
      routes: [{ path: '/', file: 'x', importPath: './x' }],
    })

    const target = document.createElement('div')
    nav.attach(target)
    await flush()

    expect(Home).toHaveBeenCalled()
  })

  it('throws when screens are missing instead of scanning pagesDir', () => {
    expect(() =>
      createJacareApp({
        layout: Shell,
        pagesDir: 'src/pages',
      }),
    ).toThrow(/requires `screens`/)
  })
})

describe('createJacareAppFromRoutes', () => {
  it('uses routeLoaders as screens', async () => {
    window.history.pushState({}, '', '/')
    const About = vi.fn((target: HTMLElement) => {
      target.textContent = 'about'
      return () => {}
    })

    const nav = createJacareAppFromRoutes({
      layout: Shell,
      routeLoaders: { '/about': About },
    })

    const target = document.createElement('div')
    nav.attach(target)
    await nav.go('/about')
    await flush()

    expect(About).toHaveBeenCalled()
  })
})
