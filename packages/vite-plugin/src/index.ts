import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
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
import type { IndexHtmlTransformResult, Plugin, UserConfig } from 'vite'
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
  /** Install Chrome DevTools page hook in DEV when `@jacare/devtools` is installed. Default true. */
  devtoolsHook?: boolean
}

const VIRTUAL_DEVTOOLS_HOOK = 'virtual:jacare-devtools-hook'
const RESOLVED_VIRTUAL_DEVTOOLS_HOOK = `\0${VIRTUAL_DEVTOOLS_HOOK}`

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

export function resolveJacareVersion(root = process.cwd()): string {
  const candidates = [
    findInstalledPackageJson(root, '@jacare/core'),
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'runtime', 'package.json'),
  ]

  for (const pkgPath of candidates) {
    if (!pkgPath || !existsSync(pkgPath)) continue
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string }
      if (pkg.version) return pkg.version
    } catch {
      /* try next */
    }
  }
  return '0.0.0'
}

function findInstalledPackageJson(root: string, name: string): string | null {
  const parts = name.split('/')
  let dir = root
  while (true) {
    const candidate = join(dir, 'node_modules', ...parts, 'package.json')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
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

function writeInspectMeshPorts(
  root: string,
  id: string,
  ports: Array<{ ref: string; source: string; bag: string; key: string }>,
): void {
  const outDir = join(root, '.jacare', 'mesh-ports')
  mkdirSync(outDir, { recursive: true })
  const safeName = basename(id).replace(/\.jcr$/, '.json')
  writeFileSync(
    join(outDir, safeName),
    JSON.stringify({ file: id, ports }, null, 2),
    'utf-8',
  )
}

export function jacare(options: JacarePluginOptions = {}): Plugin {
  let jacareConfig: JacareConfig = {}
  let projectRoot = process.cwd()
  let isProduction = false
  let injectDevtoolsHook = false

  return {
    name: 'jacare',
    enforce: 'pre',

    config(userConfig) {
      const root =
        typeof userConfig.root === 'string' && userConfig.root
          ? isAbsolute(userConfig.root)
            ? userConfig.root
            : resolve(process.cwd(), userConfig.root)
          : process.cwd()
      const version = resolveJacareVersion(root)
      return {
        define: {
          'import.meta.env.JACARE_VERSION': JSON.stringify(version),
        },
        optimizeDeps: {
          exclude: ['@jacare/core'],
        },
      }
    },

    async configResolved(resolved) {
      projectRoot = resolved.root
      isProduction = resolved.isProduction
      jacareConfig = await loadJacareConfig(resolved.root, options.configFile)
      injectDevtoolsHook =
        !isProduction && options.devtoolsHook !== false && canResolveDevtoolsHook(projectRoot)
    },

    resolveId(id) {
      if (id === VIRTUAL_DEVTOOLS_HOOK) return RESOLVED_VIRTUAL_DEVTOOLS_HOOK
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_DEVTOOLS_HOOK) return
      return `import { installPageHook } from '@jacare/devtools/hook'\ninstallPageHook()\n`
    },

    transformIndexHtml(html): IndexHtmlTransformResult {
      let next = html
      const title = jacareConfig.title
      if (title) {
        if (/<title>.*?<\/title>/i.test(next)) {
          next = next.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
        } else {
          next = next.replace(/<head>/i, `<head>\n    <title>${escapeHtml(title)}</title>`)
        }
      }

      if (!injectDevtoolsHook) return next

      return {
        html: next,
        tags: [
          {
            tag: 'script',
            attrs: { type: 'module', src: `/@id/${VIRTUAL_DEVTOOLS_HOOK}` },
            injectTo: 'body',
          },
        ],
      }
    },

    transform(code, id, transformOptions) {
      const fileId = id.split('?', 1)[0] ?? id
      if (id.includes('?raw') || !fileId.endsWith('.jcr')) return
      if (/export function mount\(/.test(code) || /export function render\(/.test(code)) return
      if (!hasViewSource(code)) return

      try {
        const siblingTs = `${fileId}.ts`
        if (existsSync(siblingTs)) {
          this.addWatchFile(siblingTs)
        }

        const mode = resolveCompileMode(options, transformOptions?.ssr)
        const cpw =
          options.cpw === true
            ? true
            : options.cpw === false
              ? false
              : isProduction && mode === 'client'
        const result = compile(code, {
          filename: fileId,
          mode,
          cpw,
          debug: !isProduction,
          ...(options.runtimeImport ? { runtimeImport: options.runtimeImport } : {}),
        })

        const contractErrors = validateContractsInModule(code, id, projectRoot)
        if (contractErrors.length > 0) {
          this.error(contractErrors.join('\n'))
        }

        if (options.inspect) {
          writeInspectOutput(projectRoot, id, result.code)
          if (result.meshPorts && result.meshPorts.length > 0) {
            writeInspectMeshPorts(projectRoot, id, result.meshPorts)
          }
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

function canResolveDevtoolsHook(root: string): boolean {
  try {
    createRequire(join(root, 'package.json')).resolve('@jacare/devtools/hook')
    return true
  } catch {
    try {
      createRequire(import.meta.url).resolve('@jacare/devtools/hook')
      return true
    } catch {
      return false
    }
  }
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
