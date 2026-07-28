import { describe, expect, it } from 'vitest'
import {
  matchScreenPattern,
  normalizeRoutePath,
  scanNavScreenPatterns,
  scanStaticGoLinks,
} from '../src/scan-routes.js'

describe('scan-routes', () => {
  it('scans createNav screen keys', () => {
    const source = `
      createNav({
        screens: {
          '/': Home,
          '/about': About,
          '/orders/:id': Order,
        },
      })
    `
    expect(scanNavScreenPatterns(source)).toEqual(['/', '/about', '/orders/:id'])
  })

  it('scans static jacare-go targets', () => {
    const source = `
      <a jacare-go="/about" href="/about">About</a>
      <a jacare-go={"/orders/1"}>Order</a>
      <a jacare-go={path}>Skip</a>
    `
    expect(scanStaticGoLinks(source)).toEqual(['/about', '/orders/1'])
  })

  it('matches patterns including params', () => {
    expect(matchScreenPattern('/orders/:id', '/orders/42')).toBe(true)
    expect(matchScreenPattern('/about', '/about')).toBe(true)
    expect(matchScreenPattern('/about', '/nope')).toBe(false)
    expect(normalizeRoutePath('/about/')).toBe('/about')
  })
})
