import { compile, JacareCompileError } from '@jacare/compiler'

export type CompileDiagnostic = {
  message: string
  line: number
  column: number
  endLine: number
  endColumn: number
}

function primaryMessage(error: JacareCompileError): string {
  const first = error.message.split('\n')[0]?.trim()
  return first && first.length > 0 ? first : error.message
}

/** Pure helper — map `compile()` failures to editor diagnostics (0-based lines). */
export function collectCompileDiagnostics(
  source: string,
  filename: string,
  siblingScript?: string | false,
): CompileDiagnostic[] {
  try {
    compile(source, {
      filename,
      ...(siblingScript !== undefined ? { siblingScript } : {}),
    })
    return []
  } catch (error) {
    if (error instanceof JacareCompileError) {
      const line = Math.max((error.line ?? 1) - 1, 0)
      const column = Math.max((error.column ?? 1) - 1, 0)
      return [
        {
          message: primaryMessage(error),
          line,
          column,
          endLine: line,
          endColumn: column + 1,
        },
      ]
    }
    const message = error instanceof Error ? error.message : String(error)
    return [
      {
        message,
        line: 0,
        column: 0,
        endLine: 0,
        endColumn: 1,
      },
    ]
  }
}
