import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { compile, JacareCompileError } from '@jacare/compiler'

export function runCheck(cwd: string): number {
  const root = resolve(cwd)
  const files = findJacareFiles(root)
  let errors = 0

  if (files.length === 0) {
    console.log('No .jcr files found')
    return 0
  }

  for (const file of files) {
    const source = readFileSync(file, 'utf-8')
    try {
      compile(source, { filename: file })
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

  if (errors > 0) {
    console.error(`\n${errors} file(s) failed`)
    return 1
  }

  console.log(`\n${files.length} file(s) ok`)
  return 0
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
