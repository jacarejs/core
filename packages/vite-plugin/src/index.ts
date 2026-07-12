import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { compile, formatCompileError, JacareCompileError, hasViewSource } from '@jacare/compiler'
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

export default jacare
