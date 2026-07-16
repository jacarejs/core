import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  collectComponents,
  compile,
  formatCompileError,
  formatContractIssue,
  hasViewSource,
  JacareCompileError,
  parseModule,
  parseTemplate,
  validateContractUsage,
} from '@jacare/compiler'
import type { Plugin, UserConfig } from 'vite'
import type { SourceMapInput } from 'rollup'

export interface JacareConfig {
  title?: string
  port?: number
  base?: string
}

export type JacareEmitMode = 'auto' | 'client' | 'server' | 'full'

export interface JacarePluginOptions {
  runtimeImport?: string
  configFile?: string
  inspect?: boolean
  emit?: JacareEmitMode
  cpw?: boolean | 'auto'
}

export async function loadJacareConfig(
  root: string,
  configFile = 'jacare.config.js',
): Promise<JacareConfig> {
  const configPath = join(root, configFile)
  if (!existsSync(configPath)) {
    return {}
  }
  const mod = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`)
  return (mod.default ?? mod) as JacareConfig
}

export function createJacareViteConfig(config: JacareConfig = {}): UserConfig {
  return {
    base: config.base ?? '/',
    plugins: [jacare()],
    optimizeDeps: {
      exclude: ['@jacare/core'],
    },
    server: {
      port: config.port ?? 3000,
    },
  }
}

function resolveCompileMode(
  options: JacarePluginOptions,
  ssr?: boolean,
): 'client' | 'server' | 'full' {
  if (options.emit === 'full') return 'full'
  if (options.emit === 'client') return 'client'
  if (options.emit === 'server') return 'server'
  return ssr ? 'server' : 'client'
}

function writeInspectOutput(root: string, id: string, code: string): void {
  const outDir = join(root, '.jacare', 'compiled')
  mkdirSync(outDir, { recursive: true })
  const safeName = basename(id).replace(/\.jcr$/, '.js')
  writeFileSync(join(outDir, safeName), code, 'utf-8')
}

export function jacare(options: JacarePluginOptions = {}): Plugin {
  let jacareConfig: JacareConfig = {}
  let projectRoot = process.cwd()
  let isProduction = false

  return {
    name: 'jacare',
    enforce: 'pre',

    config() {
      return {
        optimizeDeps: {
          exclude: ['@jacare/core'],
        },
      }
    },

    async configResolved(resolved) {
      projectRoot = resolved.root
      isProduction = resolved.isProduction
      jacareConfig = await loadJacareConfig(resolved.root, options.configFile)
    },

    transformIndexHtml(html) {
      const title = jacareConfig.title
      if (!title) return html
      if (/<title>.*?<\/title>/i.test(html)) {
        return html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      }
      return html.replace(/<head>/i, `<head>\n    <title>${escapeHtml(title)}</title>`)
    },

    transform(code, id, transformOptions) {
      if (!id.endsWith('.jcr')) return
      if (/export function mount\(/.test(code) || /export function render\(/.test(code)) return
      if (!hasViewSource(code)) return

      try {
        const mode = resolveCompileMode(options, transformOptions?.ssr)
        const cpw =
          options.cpw === true
            ? true
            : options.cpw === false
              ? false
              : isProduction && mode === 'client'
        const result = compile(code, {
          filename: id,
          mode,
          cpw,
          ...(options.runtimeImport ? { runtimeImport: options.runtimeImport } : {}),
        })

        const contractErrors = validateContractsInModule(code, id, projectRoot)
        if (contractErrors.length > 0) {
          this.error(contractErrors.join('\n'))
        }

        if (options.inspect) {
          writeInspectOutput(projectRoot, id, result.code)
        }

        return {
          code: result.code,
          ...(result.map ? { map: result.map as SourceMapInput } : {}),
        }
      } catch (error: unknown) {
        if (error instanceof JacareCompileError) {
          const compileError = error
          const message = formatCompileError(compileError)
          if (compileError.line) {
            this.error({
              message,
              id,
              frame: compileError.snippet,
              loc: {
                file: id,
                line: compileError.line,
                column: (compileError.column ?? 1) - 1,
              },
            })
          } else {
            this.error(message)
          }
        }
        throw error
      }
    },
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function validateContractsInModule(source: string, filename: string, root: string): string[] {
  const imports = collectJacareImports(source, filename)
  if (imports.size === 0) return []

  const mod = parseModule(source, filename)
  if (!mod.viewHtml) return []

  const ast = parseTemplate(mod.viewHtml, { filename, baseLine: mod.viewStartLine })
  const messages: string[] = []

  for (const node of collectComponents(ast)) {
    const importPath = imports.get(node.name)
    if (!importPath) continue

    const childFile = resolveImport(filename, importPath, root)
    if (!childFile || !existsSync(childFile)) continue

    let child
    try {
      child = compile(readFileSync(childFile, 'utf-8'), { filename: childFile })
    } catch {
      continue
    }
    if (!child.contract) continue

    for (const issue of validateContractUsage(node, child.contract, child.props)) {
      messages.push(formatContractIssue(filename, issue.component, issue.message))
    }
  }

  return messages
}

function collectJacareImports(source: string, file: string): Map<string, string> {
  const map = new Map<string, string>()
  const script = parseModule(source, file).code
  const withoutTemplates = script.replace(/`(?:\\.|[^`\\])*`/g, '``')
  const re = /\bimport\s+(\w+)\s+from\s+['"]([^'"]+\.jcr)['"]/g
  for (const match of withoutTemplates.matchAll(re)) {
    map.set(match[1]!, match[2]!)
  }
  return map
}

function resolveImport(fromFile: string, spec: string, root: string): string | null {
  const base = dirname(fromFile)
  const candidates = [resolve(base, spec), resolve(root, spec.replace(/^\//, ''))]
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  if (!isAbsolute(spec) && !spec.startsWith('.')) {
    const joined = join(root, spec)
    if (existsSync(joined)) return joined
  }
  return null
}

export default jacare
