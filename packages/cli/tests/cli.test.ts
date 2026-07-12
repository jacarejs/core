import { describe, expect, it } from 'vitest'
import { flagBool, flagNumber, flagString, parseArgv } from '../src/args.js'
import { buildScaffold, isViteScaffoldTemplate } from '../src/templates.js'

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
    expect(plan.assets).toHaveLength(0)
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
