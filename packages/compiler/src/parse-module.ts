import { flattenViewLiteral } from './flatten-literal.js'
import { JacareCompileError } from './errors.js'

export interface ParsedModule {
  code: string
  viewHtml: string | null
  viewStartLine: number
  viewEndLine: number
  moduleLineMap: number[]
}

const SFC_SCRIPT_RE = /<script(?:\s[^>]*)?>/i
const EXPORT_VIEW_RE = /export\s+default\s+view\s*`/
const VIEW_RE = /\bview\s*`/

export function parseModule(source: string, filename?: string): ParsedModule {
  if (SFC_SCRIPT_RE.test(source)) {
    throw new JacareCompileError(
      'Jacaré: <script>/<template> blocks are no longer supported. Write plain JavaScript with view`...` tagged templates.',
      {
        ...(filename ? { filename } : {}),
        line: 1,
        column: 1,
        source,
      },
    )
  }

  const exportMatch = EXPORT_VIEW_RE.exec(source)
  const viewMatch = exportMatch ?? VIEW_RE.exec(source)
  if (!viewMatch) {
    throw new JacareCompileError('Jacaré: expected view`...` tagged template', {
      ...(filename ? { filename } : {}),
      line: 1,
      column: 1,
      source,
    })
  }

  const backtick = viewMatch.index + viewMatch[0].length - 1
  const flat = flattenViewLiteral(source, backtick, filename)
  const code = source.slice(0, viewMatch.index) + source.slice(flat.end)
  const viewStartLine = lineAt(source, viewMatch.index)
  const viewEndLine = lineAt(source, flat.end)
  const moduleLineMap = buildModuleLineMap(source, viewStartLine, viewEndLine)

  return {
    code: code.trim(),
    viewHtml: flat.html,
    viewStartLine,
    viewEndLine,
    moduleLineMap,
  }
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function buildModuleLineMap(source: string, viewStartLine: number, viewEndLine: number): number[] {
  const lines = source.split('\n')
  const map: number[] = []
  for (let line = 1; line < viewStartLine; line++) {
    map.push(line)
  }
  for (let line = viewEndLine + 1; line <= lines.length; line++) {
    map.push(line)
  }
  return map
}

export { findViewTemplates } from './flatten-literal.js'