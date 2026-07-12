#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = process.argv[2]
if (!packageDir) {
  console.error('Usage: node scripts/publish-package.mjs <package-dir>')
  process.exit(1)
}

const pkgPath = join(packageDir, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const name = pkg.name
const version = pkg.version

function npmView(spec) {
  const result = spawnSync('npm', ['view', spec, 'version', '--registry=https://registry.npmjs.org'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0) return null
  return result.stdout.trim() || null
}

const published = npmView(`${name}@${version}`)
if (published === version) {
  console.log(`Skipping ${name}@${version} (already on npm)`)
  process.exit(0)
}

console.log(`Publishing ${name}@${version}`)
const publish = spawnSync('npm', ['publish', '--access', 'public'], {
  cwd: packageDir,
  stdio: 'inherit',
  env: process.env,
})

process.exit(publish.status ?? 1)
