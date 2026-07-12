#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scaffoldFromDisk, VITE_TEMPLATES } from './scaffold.js'

const packageRoot = dirname(fileURLToPath(import.meta.url))

function getVersion() {
  try {
    const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf-8'))
    return pkg.version ?? 'latest'
  } catch {
    return 'latest'
  }
}

function parseArgs(argv) {
  const positional = []
  let template = 'vite-minimal'

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--template' || arg === '-t') {
      template = argv[++i] ?? template
      continue
    }
    if (arg.startsWith('--template=')) {
      template = arg.slice('--template='.length)
      continue
    }
    if (arg === '--help' || arg === '-h') {
      return { help: true }
    }
    if (!arg.startsWith('-')) {
      positional.push(arg)
    }
  }

  return { positional, template }
}

const help = `
Create a Jacaré app with Vite

Usage:
  npm create jacare@latest <name> [--template <name>]
  npm create jacare@latest -- --template vite-nav my-app

Templates:
  vite-minimal   single-page counter (default)
  vite-nav       multi-page with routing
  vite-todo      todo app with devtools

Aliases:
  minimal → vite-minimal
  nav     → vite-nav
  todo    → vite-todo

Examples:
  npm create jacare@latest my-app
  npm create jacare@latest my-app -- --template vite-todo
`

const { help: showHelp, positional, template } = parseArgs(process.argv.slice(2))

if (showHelp) {
  console.log(help.trim())
  process.exit(0)
}

const name = positional[0]
if (!name) {
  console.error('Missing project name.')
  console.log(help.trim())
  process.exit(1)
}

try {
  const { template: resolved, dir } = scaffoldFromDisk(
    name,
    template,
    resolve(process.cwd(), name),
    getVersion(),
  )
  console.log(`Created ${name} (${resolved})`)
  console.log('')
  console.log(`  cd ${name}`)
  console.log('  npm install')
  console.log('  npm run dev')
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error('Failed to create project')
  }
  if (!VITE_TEMPLATES.includes(template) && !['minimal', 'nav', 'todo'].includes(template)) {
    console.error(`\nAvailable templates: ${VITE_TEMPLATES.join(', ')}`)
  }
  process.exit(1)
}
