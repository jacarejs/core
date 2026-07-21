import type { TemplateAST, TemplateAttr, TemplateNode, TextPart } from './types.js'

const NULLARY_EXPR_ARROW_RE = /^\(\)\s*=>\s*([\s\S]+)$/
const IDENT_RE = /[A-Za-z_$][\w$]*/g

const JS_KEYWORDS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  'this',
  'new',
  'typeof',
  'void',
  'delete',
  'in',
  'instanceof',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'try',
  'catch',
  'finally',
  'throw',
  'class',
  'extends',
  'super',
  'import',
  'export',
  'default',
  'from',
  'as',
  'of',
  'await',
  'async',
  'yield',
  'let',
  'const',
  'var',
  'function',
  'debugger',
])

export type TemplateStyleWarning = {
  code: 'redundant-arrow'
  message: string
  help: string
  found: string
  preferred: string
  sourceLine?: number
}

/**
 * Style lint: prefer bare `${cart.count()}` over `${() => cart.count()}`
 * when the arrow does not capture `#for` / local bindings.
 * Soft diagnostics for `jacare check` — not compile errors.
 */
export function lintRedundantArrows(ast: TemplateAST): TemplateStyleWarning[] {
  const warnings: TemplateStyleWarning[] = []
  walk(ast.children, new Set(), warnings)
  return warnings
}

function walk(
  nodes: TemplateNode[],
  locals: ReadonlySet<string>,
  warnings: TemplateStyleWarning[],
): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        lintText(node.parts, locals, warnings)
        break
      case 'element':
        lintAttrs(node.attrs, locals, warnings, node.sourceLine)
        walk(node.children, locals, warnings)
        break
      case 'component':
        lintAttrs(node.attrs, locals, warnings)
        walk(node.children, locals, warnings)
        break
      case 'if':
        for (const branch of node.branches) walk(branch.children, locals, warnings)
        walk(node.elseChildren, locals, warnings)
        break
      case 'case':
        for (const branch of node.branches) walk(branch.children, locals, warnings)
        walk(node.elseChildren, locals, warnings)
        break
      case 'each': {
        const next = new Set(locals)
        next.add(node.itemName)
        if (node.indexName) next.add(node.indexName)
        walk(node.children, next, warnings)
        break
      }
      case 'slot':
      case 'debug':
        break
    }
  }
}

function lintText(
  parts: TextPart[],
  locals: ReadonlySet<string>,
  warnings: TemplateStyleWarning[],
): void {
  const exprs = parts.filter((p) => p.type === 'expr')
  const hasStatic = parts.some((p) => p.type === 'static' && p.value.length > 0)
  // Mixed text already wraps in effect — skip style nudge
  if (hasStatic || exprs.length !== 1) return

  const expr = exprs[0]!.value.trim()
  maybeWarn(expr, locals, warnings, {
    found: `\${${expr}}`,
    preferred: (body) => `\${${body}}`,
  })
}

function lintAttrs(
  attrs: TemplateAttr[],
  locals: ReadonlySet<string>,
  warnings: TemplateStyleWarning[],
  sourceLine?: number,
): void {
  for (const attr of attrs) {
    if (attr.kind === 'event' || attr.kind === 'static') continue
    if (attr.name.startsWith('on-') || attr.name.startsWith('@')) continue

    const expr = attr.value.trim()
    const prefix =
      attr.kind === 'prop'
        ? `:${attr.name}=`
        : attr.kind === 'class'
          ? `class-${attr.name}=`
          : attr.kind === 'style'
            ? `style---${attr.name}=`
            : attr.kind === 'bind'
              ? `:${attr.name}=`
              : `${attr.name}=`

    maybeWarn(expr, locals, warnings, {
      found: `${prefix}\${${expr}}`,
      preferred: (body) => `${prefix}\${${body}}`,
      ...(sourceLine != null ? { sourceLine } : {}),
    })
  }
}

function maybeWarn(
  expr: string,
  locals: ReadonlySet<string>,
  warnings: TemplateStyleWarning[],
  site: {
    found: string
    preferred: (body: string) => string
    sourceLine?: number
  },
): void {
  const body = unwrapNullaryArrow(expr)
  if (body == null) return
  if (capturesLocal(body, locals)) return

  const preferred = site.preferred(body)
  const warning: TemplateStyleWarning = {
    code: 'redundant-arrow',
    found: site.found,
    preferred,
    message: `prefer ${preferred} over ${site.found} (same reactivity, cleaner style)`,
    help: 'arrow is fine when capturing loop/locals — otherwise omit it for elegance',
  }
  if (site.sourceLine != null) warning.sourceLine = site.sourceLine
  warnings.push(warning)
}

/** Body of `() => expr` (expression form only — not block bodies). */
export function unwrapNullaryArrow(expr: string): string | null {
  const match = NULLARY_EXPR_ARROW_RE.exec(expr.trim())
  if (!match) return null
  const body = match[1]!.trim()
  if (body.startsWith('{')) return null
  return body
}

export function capturesLocal(body: string, locals: ReadonlySet<string>): boolean {
  if (locals.size === 0) return false
  for (const id of collectIdents(body)) {
    if (locals.has(id)) return true
  }
  return false
}

export function collectIdents(code: string): string[] {
  const stripped = stripStringsAndComments(code)
  const out: string[] = []
  for (const match of stripped.matchAll(IDENT_RE)) {
    const id = match[0]!
    if (JS_KEYWORDS.has(id)) continue
    out.push(id)
  }
  return out
}

function stripStringsAndComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
}
