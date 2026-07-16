import { dirname, isAbsolute, join, resolve } from 'node:path'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import {
  compile,
  collectComponents,
  formatContractIssue,
  JacareCompileError,
  parseModule,
  parseTemplate,
  validateContractUsage,
} from '@jacare/compiler'

export function runCheck(cwd: string): number {
  const root = resolve(cwd)
  const files = findJacareFiles(root)
  let errors = 0

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

  if (errors > 0) {
    console.error(`\n${errors} issue(s) found`)
    return 1
  }

  console.log(`\n${files.length} file(s) ok`)
  return 0
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
