import { existsSync, readFileSync } from 'node:fs'
import { transformSync } from 'esbuild'
import { JacareCompileError } from './errors.js'
import { hasViewSource } from './parse-module.js'

const JACARE_TS_PRAGMA_RE = /(?:^|[\r\n])[ \t]*\/\/[ \t]*@jacare-ts\b/

export function hasJacareTsPragma(source: string): boolean {
  return JACARE_TS_PRAGMA_RE.test(source)
}

export function stripJacareTsPragma(source: string): string {
  return source.replace(/^[ \t]*\/\/[ \t]*@jacare-ts[ \t]*\r?\n/gm, '')
}

export function siblingJcrTsPath(jcrFilename: string): string {
  return `${jcrFilename}.ts`
}

export function readSiblingJcrTs(jcrFilename: string): string | null {
  if (!jcrFilename.endsWith('.jcr')) return null
  const path = siblingJcrTsPath(jcrFilename)
  if (!existsSync(path)) return null
  return readFileSync(path, 'utf8')
}

export function stripTypeScript(code: string, filename = 'module.ts'): string {
  try {
    const result = transformSync(code, {
      loader: 'ts',
      sourcefile: filename,
      target: 'esnext',
      logLevel: 'silent',
    })
    return result.code
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    throw new JacareCompileError(`TypeScript strip failed: ${message}`, {
      ...(filename ? { filename } : {}),
    })
  }
}

export function prepareModuleScript(
  jcrScript: string,
  options: {
    filename?: string
    source?: string
    siblingScript?: string | false
    scriptLang?: 'js' | 'ts'
  } = {},
): string {
  const parts: string[] = []

  let sibling: string | null = null
  if (options.siblingScript === false) {
    sibling = null
  } else if (typeof options.siblingScript === 'string') {
    sibling = options.siblingScript
  } else if (options.filename) {
    sibling = readSiblingJcrTs(options.filename)
  }

  if (sibling != null) {
    if (hasViewSource(sibling)) {
      throw new JacareCompileError(
        'Sibling .jcr.ts must be logic only — keep export <view> in the .jcr file.',
        { ...(options.filename ? { filename: siblingJcrTsPath(options.filename) } : {}) },
      )
    }
    parts.push(stripTypeScript(sibling, siblingJcrTsPath(options.filename ?? 'module.jcr')).trimEnd())
  }

  let script = jcrScript
  const wantsTs =
    options.scriptLang === 'ts' ||
    hasJacareTsPragma(options.source ?? '') ||
    hasJacareTsPragma(script)

  if (wantsTs) {
    script = stripTypeScript(
      stripJacareTsPragma(script),
      options.filename ? options.filename.replace(/\.jcr$/, '.ts') : 'module.ts',
    )
  }

  script = script.trim()
  if (script) parts.push(script)

  return parts.join('\n\n').trim()
}
