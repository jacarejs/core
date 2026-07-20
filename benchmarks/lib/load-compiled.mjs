import { compile } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const RUNTIME_BINDINGS = [
  'signal',
  'computed',
  'pulse',
  'derive',
  'effect',
  'watch',
  'batch',
  'untrack',
  'bindText',
  'bindPropText',
  'bindAttribute',
  'bindProperty',
  'bindClass',
  'bindStyleVar',
  'bindModel',
  'branch',
  'reconcileKeyedList',
  'showIf',
  'resumeBindings',
  'escapeHtml',
  'runUntracked',
  'mountSlot',
  'ensureScopedStyle',
].join(', ')

function stripModuleExports(code) {
  return String(code || '')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+default\s+\w+\s*;?\s*$/gm, '')
    .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
    .replace(/^export\s+(async\s+)?function\s+/gm, 'function ')
    .replace(/^export\s+(const|let|var|class)\s+/gm, '$1 ')
}

export function compileSource(source, options = {}) {
  return compile(source, {
    filename: options.filename ?? 'bench.jcr',
    mode: options.mode ?? 'client',
    ...(options.cpw ? { cpw: true } : {}),
  })
}

export function loadCompiled(source, returns, options = {}) {
  const result = compileSource(source, options)
  if (result.scopedStyle && result.scopeId) {
    runtime.ensureScopedStyle(result.scopeId, result.scopedStyle)
  }

  const body = stripModuleExports(result.code)
  const exportList = returns.join(', ')
  const factory = new Function(
    'runtime',
    `const { ${RUNTIME_BINDINGS} } = runtime
${body}
return { ${exportList} }`,
  )
  return { module: factory(runtime), result }
}
