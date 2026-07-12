import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(fileURLToPath(import.meta.url))

export const VITE_TEMPLATES = ['vite-minimal', 'vite-nav', 'vite-todo']

const TEMPLATE_ALIASES = {
  minimal: 'vite-minimal',
  nav: 'vite-nav',
  todo: 'vite-todo',
}

export function resolveViteTemplate(name) {
  if (VITE_TEMPLATES.includes(name)) return name
  if (name in TEMPLATE_ALIASES) return TEMPLATE_ALIASES[name]
  return null
}

export function getTemplatesRoot() {
  const bundled = join(packageRoot, 'templates')
  if (existsSync(bundled)) return bundled
  return join(packageRoot, '../../templates')
}

export function scaffoldFromDisk(name, template, targetDir, version = 'latest') {
  const resolvedTemplate = resolveViteTemplate(template)
  if (!resolvedTemplate) {
    throw new Error(`Unknown template "${template}". Use: ${VITE_TEMPLATES.join(', ')}`)
  }

  const templateDir = join(getTemplatesRoot(), resolvedTemplate)
  if (!existsSync(templateDir)) {
    throw new Error(`Template not found: ${templateDir}`)
  }

  const root = resolve(targetDir)
  if (existsSync(root)) {
    throw new Error(`Directory already exists: ${root}`)
  }

  mkdirSync(root, { recursive: true })
  copyTemplateDir(templateDir, root, { name, version })
  return { template: resolvedTemplate, dir: root }
}

function copyTemplateDir(sourceDir, targetDir, options) {
  for (const entry of readdirSync(sourceDir)) {
    const sourcePath = join(sourceDir, entry)
    const targetName = entry === '_gitignore' ? '.gitignore' : entry
    const targetPath = join(targetDir, targetName)
    const stat = statSync(sourcePath)

    if (stat.isDirectory()) {
      mkdirSync(targetPath, { recursive: true })
      copyTemplateDir(sourcePath, targetPath, options)
      continue
    }

    if (shouldTransform(entry)) {
      const content = readFileSync(sourcePath, 'utf-8')
      writeFileSync(targetPath, applyTemplateVars(content, options), 'utf-8')
      continue
    }

    copyFileSync(sourcePath, targetPath)
  }
}

function shouldTransform(filename) {
  return (
    filename === 'package.json' ||
    filename === 'jacare.config.js' ||
    filename === 'index.html' ||
    filename.endsWith('.jcr') ||
    filename === 'README.md'
  )
}

function applyTemplateVars(content, { name, version }) {
  return content
    .replaceAll('JACARE_VERSION', version)
    .replaceAll('vite-starter', name)
}
