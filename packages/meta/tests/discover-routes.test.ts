import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { discoverRoutes, filePathToRoute } from '../src/discover-routes.js'

const examplePages = join(process.cwd(), 'examples/jacare-todo/src/pages')
const exampleSrc = join(process.cwd(), 'examples/jacare-todo/src')

describe('filePathToRoute', () => {
  it('maps index to root', () => {
    expect(filePathToRoute('index')).toBe('/')
  })

  it('maps nested paths', () => {
    expect(filePathToRoute('about')).toBe('/about')
    expect(filePathToRoute('tutorial/getting-started')).toBe('/tutorial/getting-started')
  })

  it('maps dynamic segments', () => {
    expect(filePathToRoute('tutorial/[slug]')).toBe('/tutorial/:slug')
    expect(filePathToRoute('[...path]')).toBe('/:path*')
  })
})

describe('discoverRoutes', () => {
  it('discovers routes from pages directory', () => {
    const routes = discoverRoutes({
      pagesDir: examplePages,
      rootDir: exampleSrc,
    })

    expect(routes.some((r) => r.path === '/tasks')).toBe(true)
    expect(routes.some((r) => r.path === '/about')).toBe(true)
    expect(routes.some((r) => r.path === '/tutorial/getting-started')).toBe(true)
  })
})
