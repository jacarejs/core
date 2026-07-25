#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHANGELOG_PATH = join(ROOT, 'CHANGELOG.md')
const REPOSITORY_URL = 'https://github.com/jacarejs/core'
const CATEGORY_ORDER = [
  'Breaking Changes',
  'Added',
  'Fixed',
  'Performance',
  'Changed',
  'Documentation',
  'Tests',
  'Maintenance',
]
const TYPE_CATEGORIES = {
  feat: 'Added',
  fix: 'Fixed',
  perf: 'Performance',
  refactor: 'Changed',
  docs: 'Documentation',
  test: 'Tests',
  build: 'Maintenance',
  ci: 'Maintenance',
  chore: 'Maintenance',
  revert: 'Fixed',
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
}

function latestReleaseTag() {
  return listReleaseTags(true)[0] ?? null
}

function listReleaseTags(descending = false) {
  const sort = descending ? '--sort=-version:refname' : '--sort=version:refname'
  const tags = git(['tag', '--list', 'v[0-9]*', sort])
  return tags ? tags.split('\n').filter(Boolean) : []
}

function validateVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid release version: ${version}`)
  }
}

function readCommits(fromTag, toRef = 'HEAD') {
  const range = fromTag ? `${fromTag}..${toRef}` : toRef
  const output = git([
    'log',
    range,
    '--no-merges',
    '--format=%H%x1f%h%x1f%s%x1f%b%x1e',
  ])
  if (!output) return []

  return output
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, shortHash, subject, body = ''] = record.split('\x1f')
      return { hash, shortHash, subject, body }
    })
    .filter(({ subject }) => !/^chore(?:\([^)]*\))?: release v\d+\.\d+\.\d+$/.test(subject))
}

function classifyCommit(commit) {
  const match = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/.exec(commit.subject)
  if (!match) {
    return { category: 'Changed', description: commit.subject, scope: null, breaking: false }
  }

  const [, type, scope, bang, description] = match
  const breaking = Boolean(bang) || /(^|\n)BREAKING CHANGE:/i.test(commit.body)
  return {
    category: breaking ? 'Breaking Changes' : (TYPE_CATEGORIES[type] ?? 'Changed'),
    description,
    scope: scope ?? null,
    breaking,
  }
}

function buildGroups(commits) {
  const groups = new Map(CATEGORY_ORDER.map((category) => [category, []]))
  for (const commit of commits) {
    const classified = classifyCommit(commit)
    groups.get(classified.category).push({ ...commit, ...classified })
  }
  return groups
}

function formatGroups(groups) {
  const lines = []
  for (const category of CATEGORY_ORDER) {
    const commits = groups.get(category)
    if (!commits?.length) continue
    lines.push(`### ${category}`, '')
    for (const commit of commits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : ''
      const link = `[${commit.shortHash}](${REPOSITORY_URL}/commit/${commit.hash})`
      lines.push(`- ${scope}${commit.description} (${link})`)
    }
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}

function releaseSection(
  version,
  fromTag,
  commits,
  date = new Date().toISOString().slice(0, 10),
) {
  const compareFrom = fromTag ?? git(['rev-list', '--max-parents=0', 'HEAD'])
  const compareUrl = `${REPOSITORY_URL}/compare/${compareFrom}...v${version}`
  const content = formatGroups(buildGroups(commits))
  return `## [${version}](${compareUrl}) - ${date}\n\n${content}`
}

function releaseNotes(version, changelog) {
  const start = changelog.indexOf(`## [${version}]`)
  if (start === -1) throw new Error(`Version ${version} not found in CHANGELOG.md`)
  const next = changelog.indexOf('\n## [', start + 1)
  const section = changelog.slice(start, next === -1 ? undefined : next).trim()
  return section.replace(/^## \[[^\]]+\]\([^)]+\) - \d{4}-\d{2}-\d{2}\n+/, '')
}

function updateChangelog(version) {
  validateVersion(version)
  const heading = `## [${version}]`
  const changelog = readFileSync(CHANGELOG_PATH, 'utf8')
  if (changelog.includes(heading)) {
    throw new Error(`CHANGELOG.md already contains version ${version}`)
  }

  const fromTag = latestReleaseTag()
  if (fromTag === `v${version}`) {
    throw new Error(`Version ${version} is already tagged`)
  }

  const commits = readCommits(fromTag)
  if (commits.length === 0) {
    throw new Error(`No commits found after ${fromTag ?? 'repository start'}`)
  }

  const marker = '## [Unreleased]\n'
  const markerIndex = changelog.indexOf(marker)
  if (markerIndex === -1) throw new Error('CHANGELOG.md is missing the Unreleased section')
  const insertAt = markerIndex + marker.length
  const section = releaseSection(version, fromTag, commits)
  const next = `${changelog.slice(0, insertAt)}\n${section}\n${changelog.slice(insertAt)}`
  writeFileSync(CHANGELOG_PATH, next)
  process.stdout.write(`${releaseNotes(version, next)}\n`)
}

function bootstrap() {
  const changelog = readFileSync(CHANGELOG_PATH, 'utf8')
  const tags = listReleaseTags()
  const sections = []
  let previousTag = null

  for (const tag of tags) {
    const version = tag.slice(1)
    if (!changelog.includes(`## [${version}]`)) {
      const date = git(['log', '-1', '--format=%cs', tag])
      const commits = readCommits(previousTag, tag)
      sections.push(releaseSection(version, previousTag, commits, date))
    }
    previousTag = tag
  }

  if (sections.length === 0) {
    process.stdout.write('CHANGELOG.md already contains every npm release tag.\n')
    return
  }

  const marker = '## [Unreleased]\n'
  const insertAt = changelog.indexOf(marker) + marker.length
  if (insertAt < marker.length) throw new Error('CHANGELOG.md is missing the Unreleased section')
  const history = sections.reverse().join('\n\n')
  writeFileSync(
    CHANGELOG_PATH,
    `${changelog.slice(0, insertAt)}\n${history}\n${changelog.slice(insertAt)}`,
  )
  process.stdout.write(`Added ${sections.length} historical release(s) to CHANGELOG.md.\n`)
}

function preview() {
  const fromTag = latestReleaseTag()
  const commits = readCommits(fromTag)
  const content = formatGroups(buildGroups(commits))
  process.stdout.write(
    content
      ? `## Unreleased (after ${fromTag ?? 'repository start'})\n\n${content}\n`
      : `No unreleased commits after ${fromTag ?? 'repository start'}.\n`,
  )
}

function check() {
  const changelog = readFileSync(CHANGELOG_PATH, 'utf8')
  if (!changelog.startsWith('# Changelog\n') || !changelog.includes('## [Unreleased]\n')) {
    throw new Error('CHANGELOG.md must contain its title and an Unreleased section')
  }
  process.stdout.write('CHANGELOG.md structure is valid.\n')
}

const [command = 'preview', version] = process.argv.slice(2)

try {
  if (command === 'preview') preview()
  else if (command === 'bootstrap') bootstrap()
  else if (command === 'release') updateChangelog(version)
  else if (command === 'notes') {
    validateVersion(version)
    process.stdout.write(`${releaseNotes(version, readFileSync(CHANGELOG_PATH, 'utf8'))}\n`)
  } else if (command === 'check') check()
  else {
    throw new Error(
      'Usage: node scripts/changelog.mjs <preview|bootstrap|check|release VERSION|notes VERSION>',
    )
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
