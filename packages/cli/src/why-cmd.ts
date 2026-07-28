import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import {
  inspectTemplateBindings,
  parseModule,
  parseTemplate,
  type BindingSiteInfo,
} from '@jacare/compiler'

export type WhyTarget = {
  file: string
  line: number
}

/** Parse `path/to/File.jcr:12` into absolute file + line. */
export function parseWhyTarget(raw: string, cwd: string): WhyTarget | null {
  const match = /^(.+):(\d+)\s*$/.exec(raw.trim())
  if (!match) return null
  const filePart = match[1]!
  const line = Number(match[2])
  if (!Number.isFinite(line) || line < 1) return null
  const file = isAbsolute(filePart) ? filePart : resolve(cwd, filePart)
  return { file, line }
}

export function runWhy(cwd: string, rawTarget: string): number {
  const target = parseWhyTarget(rawTarget, cwd)
  if (!target) {
    console.error('Usage: jacare why <file.jcr:line>')
    return 1
  }
  if (!existsSync(target.file)) {
    console.error(`File not found: ${target.file}`)
    return 1
  }

  const source = readFileSync(target.file, 'utf-8')
  let sites: BindingSiteInfo[] = []
  try {
    const mod = parseModule(source, target.file)
    if (!mod.viewHtml) {
      console.error(`${rel(cwd, target.file)}: no <view> template`)
      return 1
    }
    const ast = parseTemplate(mod.viewHtml, {
      filename: target.file,
      baseLine: mod.viewStartLine,
    })
    sites = inspectTemplateBindings(ast)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`${rel(cwd, target.file)}: ${message}`)
    return 1
  }

  const hits = sites.filter((s) => s.line === target.line)
  const near =
    hits.length > 0
      ? hits
      : sites
          .filter((s) => s.line != null)
          .sort(
            (a, b) =>
              Math.abs((a.line ?? 0) - target.line) -
              Math.abs((b.line ?? 0) - target.line),
          )
          .slice(0, 3)

  if (near.length === 0) {
    console.log(
      `why ${rel(cwd, target.file)}:${target.line}\n│\n└─ no binding sites found in this template`,
    )
    return 0
  }

  const exact = hits.length > 0
  const lines = [
    `why ${rel(cwd, target.file)}:${target.line}${exact ? '' : '  (nearest sites)'} ?`,
    '│',
  ]
  for (let i = 0; i < near.length; i++) {
    const site = near[i]!
    const isLast = i === near.length - 1
    const branch = isLast ? '└─' : '├─'
    const loc = site.line != null ? `   ${rel(cwd, target.file)}:${site.line}` : ''
    const bits = [site.kind, site.label]
    if (site.mode) bits.push(site.mode)
    if (site.sourceKind) bits.push(site.sourceKind)
    lines.push(`${branch} bind ${bits.join(' · ')}${loc}`)
    if (!isLast) lines.push('│')
  }
  console.log(lines.join('\n'))
  return 0
}

function rel(cwd: string, file: string): string {
  const r = relative(cwd, file)
  return r || file
}
