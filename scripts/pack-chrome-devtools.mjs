#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const extDir = join(root, 'extensions', 'chrome-devtools')
const outDir = join(extDir, 'dist')
const zipPath = join(outDir, 'jacare-devtools.zip')

if (!existsSync(join(extDir, 'manifest.json'))) {
  console.error('Missing extensions/chrome-devtools/manifest.json')
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
rmSync(zipPath, { force: true })

const manifest = JSON.parse(readFileSync(join(extDir, 'manifest.json'), 'utf8'))
const version = manifest.version
writeFileSync(join(outDir, 'version.txt'), `${version}\n`)

try {
  execFileSync(
    'zip',
    [
      '-r',
      zipPath,
      '.',
      '-x',
      'dist/*',
      'node_modules/*',
      'package.json',
      '.DS_Store',
      'README.md',
      'STORE-LISTING.md',
      'privacy.md',
      'store/*',
    ],
    { cwd: extDir, stdio: 'inherit' },
  )
} catch {
  console.error('zip CLI failed — install zip or run from macOS/Linux CI')
  process.exit(1)
}

console.log(`Packed ${manifest.name} v${version}`)
console.log(`→ ${zipPath}`)
console.log('Load unpacked: chrome://extensions → Developer mode → Load unpacked → extensions/chrome-devtools')
