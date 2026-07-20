function block(tag, body) {
  const open = 'export <' + tag + '>'
  const close = '</' + tag + '>'
  return `${open}\n${String(body ?? '').replace(/^\n+/, '').replace(/\n+$/, '')}\n${close}`
}

export function viewSnippet(script, template) {
  const parts = []
  if (script?.trim()) parts.push(script.trimEnd())
  parts.push(block('view', template))
  return parts.join('\n\n')
}
