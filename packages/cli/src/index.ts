#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { build as viteBuild, createServer } from 'vite'
import { createJacareViteConfig, jacare } from '@jacare/vite-plugin'
import { flagBool, flagNumber, flagString, parseArgv } from './args.js'
import { runCheck } from './check.js'
import { compileOnce, compileWatch } from './compile-cmd.js'
import { scaffoldFromDisk } from 'create-jacare/scaffold.js'
import {
  buildScaffold,
  copyScaffoldAssets,
  isViteScaffoldTemplate,
  type ScaffoldTemplate,
} from './templates.js'
import { getJacareVersion } from './version.js'

const help = `
Jacaré — fine-grained UI, zero virtual DOM

Usage:
  jacare new <name> [--template=minimal|nav|todo|vite-minimal|vite-nav|vite-todo]
  jacare dev [--port=3000] [--open=false]
  jacare build
  jacare compile <file.jcr> [output.js] [--watch]
  jacare check

Examples:
  jacare new my-shop --template=todo
  jacare dev --port=4000 --open=false
  jacare compile src/app.jcr --watch
`

async function main(): Promise<void> {
  const { positional, flags } = parseArgv(process.argv.slice(2))
  const command = positional[0]

  switch (command) {
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      console.log(help.trim())
      return
    case 'new': {
      const name = positional[1]
      if (!name) {
        console.error(
          'Usage: jacare new <name> [--template=minimal|nav|todo|vite-minimal|vite-nav|vite-todo]',
        )
        process.exit(1)
      }
      const template = parseTemplate(flagString(flags, 'template'))
      createProject(name, template)
      return
    }
    case 'dev':
      await runDev(flags)
      return
    case 'build':
      await runBuild()
      return
    case 'compile': {
      const input = positional[1]
      if (!input) {
        console.error('Usage: jacare compile <file.jcr> [output.js] [--watch]')
        process.exit(1)
      }
      if (flagBool(flags, 'watch')) {
        compileWatch(input, positional[2])
        return
      }
      compileOnce(input, positional[2])
      return
    }
    case 'check': {
      const code = runCheck(process.cwd())
      process.exit(code)
      return
    }
    default:
      console.error(`Unknown command: ${command}`)
      console.log(help.trim())
      process.exit(1)
  }
}

function parseTemplate(value: string | undefined): ScaffoldTemplate {
  const templates: ScaffoldTemplate[] = [
    'minimal',
    'nav',
    'todo',
    'vite-minimal',
    'vite-nav',
    'vite-todo',
  ]
  if (value && templates.includes(value as ScaffoldTemplate)) {
    return value as ScaffoldTemplate
  }
  if (value && value !== 'minimal') {
    console.warn(`Unknown template "${value}", using minimal`)
  }
  return 'minimal'
}

function createProject(name: string, template: ScaffoldTemplate): void {
  const dir = resolve(process.cwd(), name)
  if (existsSync(dir)) {
    console.error(`Directory already exists: ${dir}`)
    process.exit(1)
  }

  const version = getJacareVersion()

  if (isViteScaffoldTemplate(template)) {
    scaffoldFromDisk(name, template, dir, version)
    console.log(`Created ${name} (${template})`)
    console.log('')
    console.log(`  cd ${name}`)
    console.log('  yarn install')
    console.log('  yarn dev')
    return
  }

  const plan = buildScaffold(name, template, version)

  mkdirSync(join(dir, 'src'), { recursive: true })
  mkdirSync(join(dir, 'public'), { recursive: true })

  for (const [file, content] of Object.entries(plan.files)) {
    const target = join(dir, file)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content, 'utf-8')
  }

  copyScaffoldAssets(dir, plan.assets)

  console.log(`Created ${name} (${template})`)
  console.log('')
  console.log(`  cd ${name}`)
  console.log('  yarn install')
  console.log('  yarn dev')
}

async function loadConfig(cwd: string): Promise<{ title?: string; port?: number }> {
  const configPath = join(cwd, 'jacare.config.js')
  if (!existsSync(configPath)) {
    return {}
  }
  const mod = await import(configPath)
  return mod.default ?? mod
}

async function runDev(flags: Record<string, string | boolean>): Promise<void> {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  const port = flagNumber(flags, 'port') ?? config.port ?? 3000
  const open = flags['open'] === false || flags['open'] === 'false' ? false : true

  const server = await createServer({
    ...createJacareViteConfig(config),
    root: cwd,
    plugins: [jacare()],
    server: {
      port,
      open,
    },
  })
  await server.listen()
  server.printUrls()
}

async function runBuild(): Promise<void> {
  const cwd = process.cwd()
  const config = await loadConfig(cwd)
  await viteBuild({
    ...createJacareViteConfig(config),
    root: cwd,
    plugins: [jacare()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: join(cwd, 'index.html'),
      },
    },
  })
  console.log('Built → dist/')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
