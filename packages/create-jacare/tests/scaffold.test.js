import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveViteTemplate, scaffoldFromDisk } from '../scaffold.js'

const tempDirs = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('scaffoldFromDisk', () => {
  it('resolves template aliases', () => {
    expect(resolveViteTemplate('minimal')).toBe('vite-minimal')
    expect(resolveViteTemplate('vite-nav')).toBe('vite-nav')
    expect(resolveViteTemplate('unknown')).toBeNull()
  })

  it('scaffolds vite-minimal with vite scripts', () => {
    const parent = mkdtempSync(join(tmpdir(), 'create-jacare-'))
    const target = join(parent, 'demo')
    tempDirs.push(parent)

    const result = scaffoldFromDisk('demo', 'vite-minimal', target, '0.0.2')
    expect(result.template).toBe('vite-minimal')

    const pkg = JSON.parse(readFileSync(join(target, 'package.json'), 'utf-8'))
    expect(pkg.scripts.dev).toBe('vite')
    expect(pkg.dependencies['@jacare/core']).toBe('0.0.2')
    expect(readFileSync(join(target, 'vite.config.js'), 'utf-8')).toContain('@jacare/vite-plugin')
    expect(readFileSync(join(target, 'src/app.jcr'), 'utf-8')).toContain('signal')
  })

  it('scaffolds vite-todo with devtools', () => {
    const parent = mkdtempSync(join(tmpdir(), 'create-jacare-'))
    const target = join(parent, 'shop')
    tempDirs.push(parent)

    scaffoldFromDisk('shop', 'todo', target, '0.0.2')

    const pkg = JSON.parse(readFileSync(join(target, 'package.json'), 'utf-8'))
    expect(pkg.devDependencies['@jacare/devtools']).toBe('0.0.2')
    expect(readFileSync(join(target, 'src/boot.js'), 'utf-8')).toContain('connectJacareDevtools')
  })
})
