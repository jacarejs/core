#!/usr/bin/env node
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

const VERSION_SOURCE = join(ROOT, 'packages/runtime/package.json')

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

  const examplePkg = readJson(join(ROOT, 'examples/jacare-todo/package.json'))
  setDependencyVersions(examplePkg, version)
  writeJson(join(ROOT, 'examples/jacare-todo/package.json'), examplePkg)

  const showcasePkg = readJson(join(ROOT, 'examples/jacare-showcase/package.json'))
  setDependencyVersions(showcasePkg, version)
  writeJson(join(ROOT, 'examples/jacare-showcase/package.json'), showcasePkg)

  const bmiPkg = readJson(join(ROOT, 'examples/jacare-bmi/package.json'))
  setDependencyVersions(bmiPkg, version)
  writeJson(join(ROOT, 'examples/jacare-bmi/package.json'), bmiPkg)

  const labPkg = readJson(join(ROOT, 'examples/jacare-lab/package.json'))
  setDependencyVersions(labPkg, version)
  writeJson(join(ROOT, 'examples/jacare-lab/package.json'), labPkg)
}

function syncVscodeVersion(version) {
  const path = join(ROOT, 'packages/vscode-jacare/package.json')
  const pkg = readJson(path)
  pkg.version = version
  writeJson(path, pkg)
}

function usage() {
  console.log(`Usage:
  node scripts/sync-versions.mjs read
  node scripts/sync-versions.mjs bump <patch|minor|major>
  node scripts/sync-versions.mjs set <version>
  node scripts/sync-versions.mjs from-tag <v0.0.0>
  node scripts/sync-versions.mjs vscode bump <patch|minor|major>
  node scripts/sync-versions.mjs vscode set <version>
  node scripts/sync-versions.mjs vscode from-tag <vscode-v0.0.0>`)
}

const [scope, command, arg] = process.argv.slice(2)

try {
  if (!scope || scope === 'read') {
    console.log(readCurrentVersion())
    process.exit(0)
  }

  if (scope === 'bump') {
    const level = command ?? 'patch'
    const next = bumpVersion(readCurrentVersion(), level)
    syncNpmVersion(next)
    console.log(next)
    process.exit(0)
  }

  if (scope === 'set') {
    parseVersion(command)
    syncNpmVersion(command)
    console.log(command)
    process.exit(0)
  }

  if (scope === 'from-tag') {
    const version = (command ?? '').replace(/^v/, '')
    parseVersion(version)
    syncNpmVersion(version)
    console.log(version)
    process.exit(0)
  }

  if (scope === 'vscode') {
    const vscodePkg = join(ROOT, 'packages/vscode-jacare/package.json')
    const current = readJson(vscodePkg).version

    if (command === 'read') {
      console.log(current)
      process.exit(0)
    }

    if (command === 'bump') {
      const next = bumpVersion(current, arg ?? 'patch')
      syncVscodeVersion(next)
      console.log(next)
      process.exit(0)
    }

    if (command === 'set') {
      parseVersion(arg)
      syncVscodeVersion(arg)
      console.log(arg)
      process.exit(0)
    }

    if (command === 'from-tag') {
      const version = (arg ?? '').replace(/^vscode-v/, '')
      parseVersion(version)
      syncVscodeVersion(version)
      console.log(version)
      process.exit(0)
    }
  }

  usage()
  process.exit(1)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
