#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const NPM_PACKAGES = [
  'packages/runtime',
  'packages/compiler',
  'packages/vite-plugin',
  'packages/meta',
  'packages/devtools',
  'packages/create-jacare',
  'packages/cli',
]

const EXAMPLE_PACKAGES = [
  'examples/jacare-todo',
  'examples/jacare-showcase',
  'examples/jacare-bmi',
  'examples/jacare-lab',
  'examples/jacare-studio',
  'examples/jacare-island',
  'examples/jacare-island-react',
  'examples/jacare-island-vue',
  'examples/jacare-island-angular',
]

const VERSION_SOURCE = join(ROOT, 'packages/runtime/package.json')
const VSCODE_PKG = join(ROOT, 'packages/vscode-jacare/package.json')
const VSCODE_PUBLISHER = 'heberalmeida'
const VSCODE_NAME = 'jacare'

/** Published outside this monorepo — never rewrite their versions on release. */
const EXTERNAL_JACARE_PACKAGES = new Set(['@jacare/ui'])

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) {
    throw new Error(`Invalid semver: ${version}`)
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

function formatVersion(parts) {
  return `${parts.major}.${parts.minor}.${parts.patch}`
}

function compareVersion(a, b) {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (left.major !== right.major) return left.major - right.major
  if (left.minor !== right.minor) return left.minor - right.minor
  return left.patch - right.patch
}

function maxVersion(versions) {
  const valid = versions.filter((version) => typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version))
  if (valid.length === 0) {
    throw new Error('No versions available to compare')
  }
  return valid.reduce((best, version) => (compareVersion(version, best) > 0 ? version : best))
}

function bumpVersion(version, level) {
  const parts = parseVersion(version)
  if (level === 'major') {
    return formatVersion({ major: parts.major + 1, minor: 0, patch: 0 })
  }
  if (level === 'minor') {
    return formatVersion({ major: parts.major, minor: parts.minor + 1, patch: 0 })
  }
  if (level === 'patch') {
    return formatVersion({ major: parts.major, minor: parts.minor, patch: parts.patch + 1 })
  }
  throw new Error(`Unknown bump level: ${level}`)
}

function readCurrentVersion() {
  return readJson(VERSION_SOURCE).version
}

function setDependencyVersions(pkg, version) {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = pkg[field]
    if (!deps) continue
    for (const name of Object.keys(deps)) {
      if (EXTERNAL_JACARE_PACKAGES.has(name)) continue
      if (name.startsWith('@jacare/') || name === 'create-jacare') {
        deps[name] = version
      }
    }
  }
}

function syncNpmVersion(version) {
  for (const dir of NPM_PACKAGES) {
    const path = join(ROOT, dir, 'package.json')
    const pkg = readJson(path)
    pkg.version = version
    setDependencyVersions(pkg, version)
    writeJson(path, pkg)
  }

  const rootPkg = readJson(join(ROOT, 'package.json'))
  setDependencyVersions(rootPkg, version)
  writeJson(join(ROOT, 'package.json'), rootPkg)

  for (const dir of EXAMPLE_PACKAGES) {
    const path = join(ROOT, dir, 'package.json')
    const pkg = readJson(path)
    setDependencyVersions(pkg, version)
    writeJson(path, pkg)
  }

  const vscodePkg = readJson(VSCODE_PKG)
  setDependencyVersions(vscodePkg, version)
  writeJson(VSCODE_PKG, vscodePkg)
}

function syncVscodeVersion(version) {
  const pkg = readJson(VSCODE_PKG)
  pkg.version = version
  writeJson(VSCODE_PKG, pkg)
}

function listVscodeTagVersions() {
  try {
    const out = execSync('git tag -l "vscode-v*"', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out
      .split('\n')
      .map((tag) => tag.trim().replace(/^vscode-v/, ''))
      .filter((version) => /^\d+\.\d+\.\d+$/.test(version))
  } catch {
    return []
  }
}

async function fetchMarketplaceVscodeVersion() {
  const response = await fetch(
    'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.2-preview.1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json;api-version=7.2-preview.1',
      },
      body: JSON.stringify({
        filters: [
          {
            criteria: [{ filterType: 7, value: `${VSCODE_PUBLISHER}.${VSCODE_NAME}` }],
            pageNumber: 1,
            pageSize: 1,
            sortBy: 0,
            sortOrder: 0,
          },
        ],
        assetTypes: [],
        flags: 914,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Marketplace query failed: HTTP ${response.status}`)
  }

  const payload = await response.json()
  const extension = payload?.results?.[0]?.extensions?.[0]
  const version = extension?.versions?.[0]?.version
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    return null
  }
  return version
}

async function resolveVscodeBaseVersion() {
  const pkgVersion = readJson(VSCODE_PKG).version
  const tagVersions = listVscodeTagVersions()
  let marketVersion = null
  try {
    marketVersion = await fetchMarketplaceVscodeVersion()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`warning: could not read Marketplace version (${message})`)
  }

  const sources = [pkgVersion, ...tagVersions]
  if (marketVersion) sources.push(marketVersion)
  return maxVersion(sources)
}

function usage() {
  console.log(`Usage:
  node scripts/sync-versions.mjs read
  node scripts/sync-versions.mjs bump <patch|minor|major>
  node scripts/sync-versions.mjs set <version>
  node scripts/sync-versions.mjs from-tag <v0.0.0>
  node scripts/sync-versions.mjs vscode read
  node scripts/sync-versions.mjs vscode bump <patch|minor|major>
  node scripts/sync-versions.mjs vscode set <version>
  node scripts/sync-versions.mjs vscode from-tag <vscode-v0.0.0>`)
}

const [scope, command, arg] = process.argv.slice(2)

async function main() {
  if (!scope || scope === 'read') {
    console.log(readCurrentVersion())
    return
  }

  if (scope === 'bump') {
    const level = command ?? 'patch'
    const next = bumpVersion(readCurrentVersion(), level)
    syncNpmVersion(next)
    console.log(next)
    return
  }

  if (scope === 'set') {
    parseVersion(command)
    syncNpmVersion(command)
    console.log(command)
    return
  }

  if (scope === 'from-tag') {
    const version = (command ?? '').replace(/^v/, '')
    parseVersion(version)
    syncNpmVersion(version)
    console.log(version)
    return
  }

  if (scope === 'vscode') {
    if (command === 'read') {
      const base = await resolveVscodeBaseVersion()
      console.log(base)
      return
    }

    if (command === 'bump') {
      const base = await resolveVscodeBaseVersion()
      const next = bumpVersion(base, arg ?? 'patch')
      syncVscodeVersion(next)
      console.log(next)
      return
    }

    if (command === 'set') {
      parseVersion(arg)
      syncVscodeVersion(arg)
      console.log(arg)
      return
    }

    if (command === 'from-tag') {
      const version = (arg ?? '').replace(/^vscode-v/, '')
      parseVersion(version)
      syncVscodeVersion(version)
      console.log(version)
      return
    }
  }

  usage()
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
