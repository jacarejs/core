import { compile, playgroundRuntimeBindings } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const RUNTIME_BINDINGS = playgroundRuntimeBindings()

function stripModuleExports(code) {
  return String(code || '')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+default\s+\w+\s*;?\s*$/gm, '')
    .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
    .replace(/^export\s+(async\s+)?function\s+/gm, 'function ')
    .replace(/^export\s+(const|let|var|class)\s+/gm, '$1 ')
}

function normalizePath(value) {
  const parts = []
  for (const part of value.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return parts.join('/')
}

function resolvePath(from, request) {
  const parent = from.includes('/') ? from.slice(0, from.lastIndexOf('/') + 1) : ''
  return normalizePath(`${parent}${request}`)
}

function localImports(code) {
  const imports = []
  const pattern = /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+\.jcr)['"];?\s*$/gm
  let match = pattern.exec(code)
  while (match) {
    imports.push({ name: match[1], request: match[2] })
    match = pattern.exec(code)
  }
  return imports
}

export function runPlayground(host, project, entry = 'App.jcr') {
  if (!host) {
    throw new Error('Missing preview host')
  }

  const files = Array.isArray(project)
    ? project
    : [{ name: entry, source: String(project || '') }]
  const fileMap = new Map(files.map((file) => [normalizePath(file.name), file.source]))
  const cache = new Map()
  const visiting = new Set()

  function load(filename) {
    const normalized = normalizePath(filename)
    if (cache.has(normalized)) return cache.get(normalized)
    if (visiting.has(normalized)) {
      throw new Error(`Circular component import: ${normalized}`)
    }

    const source = fileMap.get(normalized)
    if (source == null) {
      throw new Error(`Component file not found: ${normalized}`)
    }

    visiting.add(normalized)
    const result = compile(String(source), {
      filename: normalized,
      mode: 'client',
    })

    if (result.scopedStyle && result.scopeId) {
      runtime.ensureScopedStyle(result.scopeId, result.scopedStyle)
    }

    const dependencies = localImports(result.code).map(({ name, request }) => ({
      name,
      mount: load(resolvePath(normalized, request)),
    }))
    const body = stripModuleExports(result.code)
    const factory = new Function(
      'runtime',
      ...dependencies.map((dependency) => dependency.name),
      `const { ${RUNTIME_BINDINGS} } = runtime
${body}
if (typeof mount !== 'function') {
  throw new Error('${normalized} did not export mount()')
}
return mount`,
    )

    const mount = factory(runtime, ...dependencies.map((dependency) => dependency.mount))
    cache.set(normalized, mount)
    visiting.delete(normalized)
    return mount
  }

  const mount = load(entry)
  host.replaceChildren()
  return mount(host)
}
