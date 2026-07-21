function block(tag, body) {
  const open = 'export <' + tag + '>'
  const close = '</' + tag + '>'
  return `${open}\n${String(body ?? '').replace(/^\n+/, '').replace(/\n+$/, '')}\n${close}`
}

const CORE_EXPORTS = [
  'pulse',
  'signal',
  'derive',
  'computed',
  'effect',
  'watch',
  'batch',
  'untrack',
  'createForm',
  'createNav',
  'lazy',
  'createLifecycle',
  'registerScope',
  'clearScope',
  'renderToString',
  'renderToStream',
]

/** Prepend `import { … } from '@jacare/core'` when the script uses core helpers without an import. */
export function ensureCoreImports(script) {
  const raw = String(script ?? '')
  if (!raw.trim()) return raw
  if (/\bfrom\s+['"]@jacare\/core['"]/.test(raw)) return raw

  const names = CORE_EXPORTS.filter((name) => {
    const re = new RegExp(`\\b${name}\\b`)
    return re.test(raw)
  })
  if (names.length === 0) return raw

  return `import { ${names.join(', ')} } from '@jacare/core'\n\n${raw.replace(/^\n+/, '')}`
}

export function viewSnippet(script, template, style) {
  const parts = []
  const withImports = ensureCoreImports(script)
  if (withImports?.trim()) parts.push(withImports.trimEnd())
  parts.push(block('view', template))
  if (style?.trim()) parts.push(block('style', style))
  return parts.join('\n\n')
}

export function moduleSnippet(...sections) {
  return sections
    .map((part) => (typeof part === 'string' ? ensureCoreImports(part) : part))
    .filter((part) => part?.trim())
    .join('\n\n')
}

export function styleSnippet(css) {
  return block('style', css)
}

export function codeFiles(parentCode, children = []) {
  return [
    { name: 'usage (parent)', code: ensureCoreImports(parentCode) },
    ...children.map((child) => ({
      name: child.name,
      code: String(child.code ?? '').trim(),
    })),
  ]
}

export function flattenCodeFiles(codeOrFiles) {
  if (typeof codeOrFiles === 'string') return codeOrFiles
  if (!Array.isArray(codeOrFiles)) return ''
  return codeOrFiles
    .map((file) => `// —— ${file.name} ——\n${file.code}`)
    .join('\n\n')
}
