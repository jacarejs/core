import { existsSync, readFileSync } from 'node:fs'
import { siblingJcrTsPath } from './typescript.js'

/** Node-only — load `Foo.jcr.ts` next to `Foo.jcr`. Import from `@jacare/compiler/fs`. */
export function readSiblingJcrTs(jcrFilename: string): string | null {
  if (!jcrFilename.endsWith('.jcr')) return null
  const path = siblingJcrTsPath(jcrFilename)
  if (!existsSync(path)) return null
  return readFileSync(path, 'utf8')
}
