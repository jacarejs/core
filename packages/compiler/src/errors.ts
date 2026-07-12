export interface JacareCompileErrorDetails {
  filename?: string
  line?: number
  column?: number
  source?: string
}

export class JacareCompileError extends Error {
  readonly filename?: string
  readonly line?: number
  readonly column?: number
  readonly snippet?: string

  constructor(message: string, details: JacareCompileErrorDetails = {}) {
    const location = formatLocation(details)
    super(location ? `${message}\n${location}` : message)
    this.name = 'JacareCompileError'
    if (details.filename !== undefined) this.filename = details.filename
    if (details.line !== undefined) this.line = details.line
    if (details.column !== undefined) this.column = details.column
    if (details.source && details.line) {
      this.snippet = formatSnippet(details.source, details.line, details.column)
    }
  }
}

function formatLocation(details: JacareCompileErrorDetails): string {
  if (!details.filename && details.line === undefined) return ''
  const file = details.filename ?? '<template>'
  if (details.line === undefined) return `  at ${file}`
  const column = details.column ?? 1
  return `  at ${file}:${details.line}:${column}`
}

function formatSnippet(source: string, line: number, column = 1): string {
  const lines = source.split('\n')
  const target = lines[line - 1]
  if (!target) return ''
  const pointer = ' '.repeat(Math.max(column - 1, 0)) + '^'
  return `${target}\n${pointer}`
}

export function formatCompileError(error: JacareCompileError): string {
  const parts = [error.message]
  if (error.snippet) {
    parts.push('', error.snippet)
  }
  return parts.join('\n')
}
