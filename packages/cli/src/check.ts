import { dirname, isAbsolute, join, resolve } from 'node:path'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import {
  compile,
  collectComponents,
  formatContractIssue,
  inspectTemplateBindings,
  lintRedundantArrows,
  JacareCompileError,
  linkAddress,
  mergePublishedBags,
  parseLinkFrom,
  parseModule,
  parseTemplate,
  scanPublishedBags,
  validateContractUsage,
  type TemplateStyleWarning,
} from '@jacare/compiler'

export type CheckOptions = {
  bindings?: boolean
  /** Soft style hints (default true). */
  style?: boolean
  /** Fail the process when style warnings are present. */
  strictStyle?: boolean
}

export function runCheck(cwd: string, options: CheckOptions = {}): number {
  const root = resolve(cwd)
  const files = findJacareFiles(root)
  let errors = 0
  let styleWarnings = 0
  const styleEnabled = options.style !== false

  if (files.length === 0) {
    console.log('No .jcr files found')
    return 0
  }

  const compiled = new Map<string, ReturnType<typeof compile>>()

  for (const file of files) {
    const source = readFileSync(file, 'utf-8')
    try {
      const result = compile(source, { filename: file })
      compiled.set(file, result)
      console.log(`ok ${file}`)
      if (options.bindings) {
        printBindings(file, source)
      }
      if (styleEnabled) {
        const warnings = collectStyleWarnings(file, source)
        styleWarnings += warnings.length
        for (const warning of warnings) {
          printStyleWarning(file, warning)
        }
      }
    } catch (error) {
      errors++
      if (error instanceof JacareCompileError) {
        console.error(error.message)
      } else if (error instanceof Error) {
        console.error(`${file}: ${error.message}`)
      } else {
        console.error(`${file}: compile failed`)
      }
    }
  }

  for (const file of files) {
    const result = compiled.get(file)
    if (!result) continue
    const source = readFileSync(file, 'utf-8')
    try {
      const contractErrors = checkContracts(file, source, compiled, root)
      for (const message of contractErrors) {
        errors++
        console.error(message)
      }
    } catch (error) {
      errors++
      if (error instanceof Error) {
        console.error(`${file}: ${error.message}`)
      } else {
        console.error(`${file}: contract check failed`)
      }
    }
  }

  const linkErrors = checkMeshLinks(compiled, root)
  for (const message of linkErrors) {
    errors++
    console.error(message)
  }

  if (errors > 0) {
    console.error(`\n${errors} issue(s) found`)
    return 1
  }

  if (styleWarnings > 0) {
    console.log(`\n${files.length} file(s) ok · ${styleWarnings} style warning(s)`)
    if (options.strictStyle) {
      console.error('strict style: failing on template style warnings')
      return 1
    }
    return 0
  }

  console.log(`\n${files.length} file(s) ok`)
  return 0
}

function collectStyleWarnings(file: string, source: string): TemplateStyleWarning[] {
  try {
    const mod = parseModule(source, file)
    if (!mod.viewHtml) return []
    const ast = parseTemplate(mod.viewHtml, {
      filename: file,
      baseLine: mod.viewStartLine,
    })
    return lintRedundantArrows(ast)
  } catch {
    return []
  }
}

function printStyleWarning(file: string, warning: TemplateStyleWarning): void {
  const loc = warning.sourceLine != null ? `${file}:${warning.sourceLine}` : file
  console.warn(`warn ${loc}: ${warning.message}`)
  console.warn(`  help: ${warning.help}`)
}

function printBindings(file: string, source: string): void {
  try {
    const mod = parseModule(source, file)
    if (!mod.viewHtml) return
    const ast = parseTemplate(mod.viewHtml, {
      filename: file,
      baseLine: mod.viewStartLine,
    })
    const sites = inspectTemplateBindings(ast)
    if (sites.length === 0) return
    console.log(`  bindings (${sites.length}):`)
    for (const site of sites) {
      const bits = [site.kind, site.label]
      if (site.mode) bits.push(site.mode)
      if (site.sourceKind) bits.push(site.sourceKind)
      if (site.lazy) bits.push('lazy')
      console.log(`    - ${bits.join(' · ')}`)
    }
  } catch {
    // bindings dump is best-effort
  }
}

function checkContracts(
  file: string,
  source: string,
  compiled: Map<string, ReturnType<typeof compile>>,
  root: string,
): string[] {
  const messages: string[] = []
  const imports = collectJacareImports(source, file)
  if (imports.size === 0) return messages

  const mod = parseModule(source, file)
  const ast = parseTemplate(mod.viewHtml!, { filename: file, baseLine: mod.viewStartLine })
  const components = collectComponents(ast)

  for (const node of components) {
    const importPath = imports.get(node.name)
    if (!importPath) continue

    const childFile = resolveImport(file, importPath, root)
    if (!childFile) continue

    let child = compiled.get(childFile)
    if (!child) {
      try {
        child = compile(readFileSync(childFile, 'utf-8'), { filename: childFile })
        compiled.set(childFile, child)
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'compile failed'
        messages.push(`${file}: child "${node.name}" failed to compile (${detail})`)
        continue
      }
    }

    const contract = child.contract
    if (!contract) continue

    for (const issue of validateContractUsage(node, contract, child.props)) {
      messages.push(formatContractIssue(file, issue.component, issue.message))
    }
  }

  return messages
}

function checkMeshLinks(
  compiled: Map<string, ReturnType<typeof compile>>,
  root: string,
): string[] {
  const required: Array<{ file: string; name: string; bag: string; key: string }> = []
  for (const [file, result] of compiled) {
    const links = result.contract?.links
    if (!links) continue
    for (const [name, link] of Object.entries(links)) {
      try {
        const { bag, key } = parseLinkFrom(link.from)
        required.push({ file, name, bag, key })
      } catch (error) {
        return [
          `${file}: Mesh link "${name}" — ${error instanceof Error ? error.message : 'invalid from'}`,
        ]
      }
    }
  }
  if (required.length === 0) return []

  const published = collectPublishedBags(root)
  const messages: string[] = []
  for (const req of required) {
    const keys = published.get(req.bag)
    const address = linkAddress(`${req.bag}.${req.key}`)
    if (!keys) {
      messages.push(
        `${req.file}: Mesh link "${req.name}" requires bag "${req.bag}" (createBag) but it was not found`,
      )
      continue
    }
    if (keys.size > 0 && !keys.has(req.key)) {
      messages.push(
        `${req.file}: Mesh link "${req.name}" requires ${address} but it is not published`,
      )
    }
  }
  return messages
}

function collectPublishedBags(root: string) {
  const maps = []
  for (const file of findSourceFiles(root)) {
    maps.push(scanPublishedBags(readFileSync(file, 'utf-8')))
  }
  return mergePublishedBags(...maps)
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
  const candidates = [
    resolve(base, spec),
    resolve(root, spec.replace(/^\//, '')),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  if (!isAbsolute(spec) && !spec.startsWith('.')) {
    const joined = join(root, spec)
    if (existsSync(joined)) return joined
  }
  return null
}

function findJacareFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      findJacareFiles(path, results)
      continue
    }
    if (entry.endsWith('.jcr')) {
      results.push(path)
    }
  }
  return results
}

function findSourceFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
    const path = join(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      findSourceFiles(path, results)
      continue
    }
    if (/\.(jcr|js|mjs|cjs|ts|mts|cts)$/.test(entry) && !entry.endsWith('.d.ts')) {
      results.push(path)
    }
  }
  return results
}
