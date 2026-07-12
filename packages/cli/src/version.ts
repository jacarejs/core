import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cliRoot = dirname(fileURLToPath(import.meta.url))

export function getJacareVersion(): string {
  const pkg = JSON.parse(readFileSync(join(cliRoot, '../package.json'), 'utf-8')) as {
    version: string
  }
  return pkg.version
}
