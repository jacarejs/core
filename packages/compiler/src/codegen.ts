import type { TemplateAST, TemplateNode } from './types.js'
import { emitClient } from './codegen-client.js'
import { emitResume, emitSSR } from './codegen-ssr.js'
import { CodegenContext, type CodegenMapping } from './codegen-shared.js'
import {
  contractPropNames,
  type TemplateContract,
} from './parse-contract.js'
import type { StyleAST } from './parse-style.js'

const RUNTIME_IMPORT_ORDER = [
  'effect',
  'runUntracked',
  'bindText',
  'bindPropText',
  'bindAttribute',
  'bindProperty',
  'bindModel',
  'bindClass',
  'bindStyleVar',
  'bindDebug',
  'branch',
  'reconcileKeyedList',
  'resumeBindings',
  'escapeHtml',
  'ensureScopedStyle',
  'bindStyleSheet',
  'scopeCss',
  'mountSlot',
] as const

const DECL_RE = /\b(?:const|let|var|function)\s+([\w$]+)/g

export type RuntimeImport = (typeof RUNTIME_IMPORT_ORDER)[number]

export function orderRuntimeImports(imports: Iterable<string>): string[] {
  const used = new Set(imports)
  return RUNTIME_IMPORT_ORDER.filter((name) => used.has(name))
}

export function resolveMountProps(
  moduleCode: string,
  ast: TemplateAST,
  contract?: TemplateContract,
): string[] {
  const inferred = detectProps(moduleCode, ast)
  if (!contract) return inferred

  const names = new Set(contractPropNames(contract))
  if (templateHasSlot(ast) && !names.has('children')) {
    names.add('children')
  }
  for (const name of inferred) {
    if (name !== 'emit') names.add(name)
  }
  return [...names].sort()
}

function templateHasSlot(ast: TemplateAST): boolean {
  const walk = (nodes: TemplateNode[]): boolean => {
    for (const node of nodes) {
      if (node.type === 'slot') return true
      if (node.type === 'element' || node.type === 'component') {
        if (walk(node.children)) return true
      } else if (node.type === 'if') {
        for (const branch of node.branches) {
          if (walk(branch.children)) return true
        }
        if (walk(node.elseChildren)) return true
      } else if (node.type === 'case') {
        for (const branch of node.branches) {
          if (walk(branch.children)) return true
        }
        if (walk(node.elseChildren)) return true
      } else if (node.type === 'each') {
        if (walk(node.children)) return true
      }
    }
    return false
  }
  return walk(ast.children)
}

export function generate(
  ast: TemplateAST,
  moduleCode: string,
  options: {
    runtimeImport?: string
    viewStartLine?: number
    mode?: 'client' | 'server' | 'full'
    scopeId?: string
    scopedStyle?: string
    styleAst?: StyleAST
    cpw?: boolean
    contract?: TemplateContract
    debug?: boolean
  } = {},
): { code: string; mappings: CodegenMapping[] } {
  const mode = options.mode ?? 'full'
  const runtime = options.runtimeImport ?? '@jacare/core'
  const props = resolveMountProps(moduleCode, ast, options.contract)
  const signals = detectSignals(moduleCode)
  const runtimeImports = new Set<string>()
  const { userRuntimeSymbols, body } = extractUserRuntimeImport(
    cleanupModule(moduleCode),
    runtime,
  )

  const lines: string[] = []
  if (body) {
    lines.push(body)
    lines.push('')
  }

  let mappings: CodegenMapping[] = []

  if (mode === 'server' || mode === 'full') {
    lines.push(
      ...emitSSR(
        ast,
        props,
        runtimeImports,
        signals,
        options.scopeId,
        options.scopedStyle,
        options.styleAst,
      ),
    )
    lines.push('')
  }

  if (mode === 'client' || mode === 'full') {
    const codegenOffset = lines.length
    const clientCtx = new CodegenContext(
      codegenOffset,
      options.viewStartLine ?? 1,
      runtimeImports,
      props.length > 0 ? new Set(props) : undefined,
      signals,
      options.cpw ?? false,
      options.debug !== false,
    )
    emitClient(
      ast,
      props,
      clientCtx,
      options.scopeId,
      options.scopedStyle,
      options.contract,
      options.styleAst,
    )
    lines.push(...clientCtx.join())
    mappings = clientCtx.getMappings()
    lines.push('')
    lines.push(...emitResume(ast, props, runtimeImports))
    lines.push('')
  }

  const orderedImports = orderRuntimeImports(runtimeImports)
  const importLine = buildRuntimeImport(runtime, userRuntimeSymbols, orderedImports)
  lines.unshift(importLine, '')

  if (mode === 'server') {
    lines.push('export default render')
  } else {
    lines.push('export default mount')
  }

  return { code: lines.join('\n'), mappings }
}

function cleanupModule(code: string): string {
  return cleanupImports(code.trim())
}

function cleanupImports(code: string): string {
  return code.replace(/import\s*\{([^}]*)\}/g, (_match, spec: string) => {
    const names = spec
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && part !== 'view' && part !== 'style')
    return `import { ${names.join(', ')} }`
  })
}

function extractUserRuntimeImport(
  moduleCode: string,
  runtime: string,
): { userRuntimeSymbols: string[]; body: string } {
  const importRe = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${runtime.replace('/', '\\/')}['"]\\s*;?`,
  )
  const match = moduleCode.match(importRe)

  if (match) {
    const userRuntimeSymbols = match[1]!
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && part !== 'view' && part !== 'style')
    const body = moduleCode.replace(importRe, '').trim()
    return { userRuntimeSymbols, body }
  }

  return { userRuntimeSymbols: [], body: moduleCode }
}

function buildRuntimeImport(
  runtime: string,
  userRuntimeSymbols: string[],
  runtimeHelpers: string[],
): string {
  const merged = [...new Set([...userRuntimeSymbols, ...runtimeHelpers])]
  if (merged.length === 0) {
    return `import { signal } from '${runtime}'`
  }
  return `import { ${merged.join(', ')} } from '${runtime}'`
}

const BUILTIN_GLOBALS = new Set([
  'Array',
  'Boolean',
  'Date',
  'JSON',
  'Math',
  'Number',
  'Object',
  'String',
  'console',
  'emit',
])

const RESERVED_WORDS = new Set([
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

export function detectProps(script: string, ast: TemplateAST): string[] {
  const declared = new Set<string>()

  for (const match of script.matchAll(DECL_RE)) {
    declared.add(match[1]!)
  }

  for (const match of script.matchAll(/\bimport\s+\{([^}]+)\}\s*from/g)) {
    for (const part of match[1]!.split(',')) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const alias = trimmed.match(/([\w$]+)(?:\s+as\s+([\w$]+))?/)
      if (alias) {
        declared.add(alias[2] ?? alias[1]!)
      }
    }
  }

  const defaultImport = script.match(/\bimport\s+([\w$]+)\s+from/)
  if (defaultImport) {
    declared.add(defaultImport[1]!)
  }

  const used = collectRefs(ast)
  return [...used]
    .filter(
      (name) =>
        !declared.has(name) && !BUILTIN_GLOBALS.has(name) && !RESERVED_WORDS.has(name),
    )
    .sort()
}

function stripTemplateLiterals(code: string): string {
  return code.replace(/`(?:\\.|[^`\\])*`/g, '``')
}

export function detectSignals(script: string): Set<string> {
  const signals = new Set<string>()
  const source = stripTemplateLiterals(script)
  for (const match of source.matchAll(
    /\b(?:const|let|var)\s+([\w$]+)\s*=\s*(?:signal|pulse|computed|derive)\s*\(/g,
  )) {
    signals.add(match[1]!)
  }
  return signals
}

function collectRefs(ast: TemplateAST): Set<string> {
  const refs = new Set<string>()

  const walk = (nodes: TemplateNode[]): void => {
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          for (const part of node.parts) {
            if (part.type === 'expr') {
              collectExprRefs(part.value, refs)
            }
          }
          break
        case 'element':
          for (const attr of node.attrs) {
            if (attr.kind !== 'static') {
              collectExprRefs(attr.value, refs)
            }
          }
          walk(node.children)
          break
        case 'component':
          for (const attr of node.attrs) {
            if (attr.kind !== 'static') {
              collectExprRefs(attr.value, refs)
            }
          }
          walk(node.children)
          break
        case 'slot':
          break
        case 'if':
          for (const branch of node.branches) {
            collectExprRefs(branch.condition, refs)
            walk(branch.children)
          }
          walk(node.elseChildren)
          break
        case 'case':
          collectExprRefs(node.scrutinee, refs)
          for (const branch of node.branches) {
            collectExprRefs(branch.value, refs)
            walk(branch.children)
          }
          walk(node.elseChildren)
          break
        case 'each':
          collectExprRefs(node.source, refs)
          if (node.keyExpr) {
            collectExprRefs(node.keyExpr, refs)
          }
          walk(node.children)
          break
        case 'debug':
          collectExprRefs(node.expr, refs)
          break
      }
    }
  }

  walk(ast.children)
  if (hasSlotNode(ast)) {
    refs.add('children')
  }
  return refs
}

function hasSlotNode(ast: TemplateAST): boolean {
  let found = false
  const walk = (nodes: TemplateNode[]): void => {
    for (const node of nodes) {
      if (found) return
      if (node.type === 'slot') {
        found = true
        return
      }
      if (node.type === 'element') walk(node.children)
      if (node.type === 'component') walk(node.children)
      if (node.type === 'if') {
        for (const branch of node.branches) walk(branch.children)
        walk(node.elseChildren)
      }
      if (node.type === 'case') {
        for (const branch of node.branches) walk(branch.children)
        walk(node.elseChildren)
      }
      if (node.type === 'each') walk(node.children)
    }
  }
  walk(ast.children)
  return found
}

function collectExprRefs(expr: string, refs: Set<string>): void {
  const trimmed = expr.trim()
  const bare = /^(?!\.)([A-Za-z_$][\w$]*)$/.exec(trimmed)
  if (bare) {
    refs.add(bare[1]!)
    return
  }
  const re = /(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g
  let match: RegExpExecArray | null
  while ((match = re.exec(expr)) !== null) {
    refs.add(match[1]!)
  }
}

export { resolveSignalExpr } from './codegen-shared.js'
