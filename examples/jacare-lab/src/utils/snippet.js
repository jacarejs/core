function block(tag, body) {
  const open = 'export <' + tag + '>'
  const close = '</' + tag + '>'
  return `${open}\n${String(body ?? '').replace(/^\n+/, '').replace(/\n+$/, '')}\n${close}`
}

export function viewSnippet(script, template, style) {
  const parts = []
  if (script?.trim()) parts.push(script.trimEnd())
  parts.push(block('view', template))
  if (style?.trim()) parts.push(block('style', style))
  return parts.join('\n\n')
}

export function moduleSnippet(...sections) {
  return sections.filter((part) => part?.trim()).join('\n\n')
}

export function styleSnippet(css) {
  return block('style', css)
}

export function codeFiles(parentCode, children = []) {
  return [
    { name: 'usage (parent)', code: parentCode },
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
