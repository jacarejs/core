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
  'flushSync',
  'enablePatience',
  'disablePatience',
  'isPatienceEnabled',
  'createBag',
  'ripple',
  'getBag',
  'createForm',
  'createNav',
  'lazy',
  'createLifecycle',
  'registerScope',
  'clearScope',
]

export function ensureCoreImports(script) {
  const raw = String(script ?? '')
  if (!raw.trim()) return raw
  if (/\bfrom\s+['"]@jacare\/core['"]/.test(raw)) return raw

  const names = CORE_EXPORTS.filter((name) => new RegExp(`\\b${name}\\b`).test(raw))
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
