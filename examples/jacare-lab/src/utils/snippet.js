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
