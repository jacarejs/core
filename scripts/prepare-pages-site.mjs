#!/usr/bin/env node
/**
 * Assemble the GitHub Pages artifact under site/ from example dist/ folders.
 * Expects each demo already built with JACARE_BASE=/core/<name>/.
 * Used by .github/workflows/pages.yml — do not commit site/ output (except README.md).
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const site = join(root, 'site')

const demos = [
  'todo',
  'showcase',
  'bmi',
  'lab',
  'studio',
  'island',
  'island-react',
  'island-vue',
  'island-angular',
]

function requireDist(name) {
  const dist = join(root, 'examples', `jacare-${name}`, 'dist')
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error(`Missing examples/jacare-${name}/dist — build that demo first`)
  }
  return dist
}

if (existsSync(site)) {
  for (const entry of readdirSync(site)) {
    if (entry === 'README.md') continue
    rmSync(join(site, entry), { recursive: true, force: true })
  }
} else {
  mkdirSync(site, { recursive: true })
}

cpSync(join(root, 'scripts/gh-pages-index.html'), join(site, 'index.html'))
cpSync(join(root, 'scripts/gh-pages-404.html'), join(site, '404.html'))
writeFileSync(join(site, '.nojekyll'), '')

for (const name of demos) {
  const dest = join(site, name)
  mkdirSync(dest, { recursive: true })
  cpSync(requireDist(name), dest, { recursive: true })
  cpSync(join(root, 'scripts/gh-pages-404.html'), join(dest, '404.html'))
  writeFileSync(join(dest, '.nojekyll'), '')
}

console.log('Prepared site/ for GitHub Pages:')
for (const name of demos) console.log(`  - ${name}/`)
