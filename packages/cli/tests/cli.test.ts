import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { flagBool, flagNumber, flagString, parseArgv } from '../src/args.js'
import { buildScaffold, isViteScaffoldTemplate } from '../src/templates.js'
import { parseWhyTarget, runWhy } from '../src/why-cmd.js'

describe('parseArgv', () => {
  it('parses positional and flag arguments', () => {
    const args = parseArgv(['new', 'demo', '--template=todo', '--watch'])
    expect(args.positional).toEqual(['new', 'demo'])
    expect(flagString(args.flags, 'template')).toBe('todo')
    expect(flagBool(args.flags, 'watch')).toBe(true)
  })

  it('parses dev flags', () => {
    const args = parseArgv(['dev', '--port=4000', '--open=false'])
    expect(flagNumber(args.flags, 'port')).toBe(4000)
    expect(args.flags.open).toBe(false)
  })
})

describe('buildScaffold', () => {
  it('creates minimal template files', () => {
    const plan = buildScaffold('demo', 'minimal', '0.0.2')
    expect(plan.files['src/app.jcr']).toContain('signal')
    expect(plan.files['package.json']).toContain('"@jacare/cli": "0.0.2"')
    expect(plan.assets[0]?.name).toBe('jacare-logo.png')
  })

  it('creates nav template with pages', () => {
    const plan = buildScaffold('demo', 'nav', '0.0.2')
    expect(plan.files['src/nav.js']).toContain('createNav')
    expect(plan.files['src/pages/home.jcr']).toBeTruthy()
    expect(plan.assets[0]?.name).toBe('jacare-logo.png')
  })

  it('creates todo template with devtools', () => {
    const plan = buildScaffold('demo', 'todo', '0.0.2')
    expect(plan.files['package.json']).toContain('@jacare/devtools')
    expect(plan.files['src/boot.js']).toContain('connectJacareDevtools')
    expect(plan.files['src/pages/tasks.jcr']).toContain('#for items()')
  })

  it('recognizes vite scaffold templates', () => {
    expect(isViteScaffoldTemplate('vite-minimal')).toBe(true)
    expect(isViteScaffoldTemplate('vite-nav')).toBe(true)
    expect(isViteScaffoldTemplate('minimal')).toBe(false)
  })
})

describe('jacare why', () => {
  it('parses file:line targets', () => {
    const target = parseWhyTarget('src/Shop.jcr:12', '/app')
    expect(target?.file).toBe(join('/app', 'src/Shop.jcr'))
    expect(target?.line).toBe(12)
    expect(parseWhyTarget('bad', '/app')).toBeNull()
  })

  it('prints binding sites for a template line', () => {
    const dir = join(tmpdir(), `jacare-why-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'Demo.jcr')
    writeFileSync(
      file,
      `const count = pulse(0)

export <view>
  <p class="badge">\${count}</p>
</view>
`,
      'utf-8',
    )
    const logs: string[] = []
    const original = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }
    try {
      const code = runWhy(dir, `${file}:4`)
      expect(code).toBe(0)
      const out = logs.join('\n')
      expect(out).toMatch(/why /)
      expect(out).toMatch(/bind text/)
    } finally {
      console.log = original
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
