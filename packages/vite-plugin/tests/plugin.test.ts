import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { createJacareViteConfig, jacare } from '../src/index.js'

describe('jacare vite plugin', () => {
  it('transforms .jcr files with source maps', () => {
    const plugin = jacare()
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``

    const result = plugin.transform!(source, '/src/app.jcr')
    if (!result || typeof result === 'string') {
      throw new Error('expected transform object')
    }

    expect(result.code).toContain('export function mount')
    expect(result.map).toBeTruthy()
  })

  it('applies title from jacare.config.js', async () => {
    const plugin = jacare()
    const hook = plugin.transformIndexHtml
    if (!hook) throw new Error('missing transformIndexHtml')

    await plugin.configResolved!({
      root: join(process.cwd(), 'examples/jacare-todo'),
    } as never)

    const html = '<html><head><title>Old</title></head><body></body></html>'
    const transformed = await hook.call({} as never, html)
    expect(transformed).toContain('<title>Jacaré Tasks</title>')
  })

  it('emits client bundle by default', () => {
    const plugin = jacare()
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``

    const result = plugin.transform!(source, '/src/app.jcr', { ssr: false })
    if (!result || typeof result === 'string') throw new Error('expected transform object')
    expect(result.code).toContain('export function mount')
    expect(result.code).not.toContain('export function render')
  })

  it('emits server bundle when ssr is true', () => {
    const plugin = jacare()
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``

    const result = plugin.transform!(source, '/src/app.jcr', { ssr: true })
    if (!result || typeof result === 'string') throw new Error('expected transform object')
    expect(result.code).toContain('export function render')
    expect(result.code).not.toContain('export function mount')
  })

  it('writes inspect output when enabled', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'jacare-inspect-'))
    const plugin = jacare({ inspect: true })
    await plugin.configResolved!({ root: dir } as never)

    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`<p>\${count}</p>\``

    plugin.transform!(source, join(dir, 'src', 'app.jcr'), { ssr: false })
    const compiled = readFileSync(join(dir, '.jacare', 'compiled', 'app.js'), 'utf-8')
    expect(compiled).toContain('export function mount')
    rmSync(dir, { recursive: true, force: true })
  })
})

describe('createJacareViteConfig', () => {
  it('excludes @jacare/core from optimizeDeps prebundle', () => {
    const config = createJacareViteConfig({ port: 4000 })
    expect(config.optimizeDeps?.exclude).toContain('@jacare/core')
    expect(config.server?.port).toBe(4000)
  })
})

describe('loadJacareConfig', () => {
  it('returns empty config when file is missing', async () => {
    const { loadJacareConfig } = await import('../src/index.js')
    const config = await loadJacareConfig('/tmp/jacare-missing-config-dir')
    expect(config).toEqual({})
  })
})

describe('compile integration', () => {
  it('reports compile errors with file paths', async () => {
    const { compile } = await import('@jacare/compiler')
    expect(() => compile('export default view`<div>`', { filename: 'broken.jcr' })).toThrow(
      /broken\.jcr/,
    )
  })
})
