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
  'runUntracked',
  'mountSlot',
  'ensureScopedStyle',
  'createForm',
  'createLifecycle',
  'registerScope',
].join(', ')

function stripModuleExports(code) {
  return String(code || '')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+default\s+\w+\s*;?\s*$/gm, '')
    .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
    .replace(/^export\s+(async\s+)?function\s+/gm, 'function ')
    .replace(/^export\s+(const|let|var|class)\s+/gm, '$1 ')
}

export function runPlayground(host, source) {
  if (!host) {
    throw new Error('Missing preview host')
  }

  const result = compile(String(source || ''), {
    filename: 'playground.jcr',
    mode: 'client',
  })

  if (result.scopedStyle && result.scopeId) {
    runtime.ensureScopedStyle(result.scopeId, result.scopedStyle)
  }

  const body = stripModuleExports(result.code)
  const factory = new Function(
    'runtime',
    `const { ${RUNTIME_BINDINGS} } = runtime
${body}
if (typeof mount !== 'function') {
  throw new Error('Compiled module did not export mount()')
}
return { mount }`,
  )

  const mod = factory(runtime)
  host.replaceChildren()
  return mod.mount(host)
}
