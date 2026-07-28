import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const dist = join(dirname(fileURLToPath(import.meta.url)), '../dist')

describe('@jacare/meta entry split', () => {
  it('keeps the main entry free of node builtins', () => {
    const index = readFileSync(join(dist, 'index.js'), 'utf8')
    expect(index).not.toMatch(/node:fs|node:path/)
    expect(index).toMatch(/createJacareApp/)
    expect(index).not.toMatch(/jacareMeta/)
  })

  it('puts the Vite plugin on @jacare/meta/vite', () => {
    const vite = readFileSync(join(dist, 'vite.js'), 'utf8')
    expect(vite).toMatch(/jacareMeta/)
    expect(vite).toMatch(/discoverRoutes|discover-routes/)
  })
})
