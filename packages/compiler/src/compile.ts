import type { RawSourceMap } from 'source-map-js'
import { SourceMapGenerator } from 'source-map-js'
import { basename } from 'node:path'
import { generate } from './codegen.js'
import type { CodegenMapping } from './codegen-shared.js'
import { parseModule } from './parse-module.js'
import { parseTemplate } from './parse-template.js'
import type { CompileOptions, CompileResult } from './types.js'

export function compile(source: string, options: CompileOptions = {}): CompileResult {
  const filename = options.filename
  const parsed = parseModule(source, filename)
  const ast = parseTemplate(parsed.viewHtml!, {
    ...(filename ? { filename } : {}),
    baseLine: parsed.viewStartLine,
  })
  const generated = generate(ast, parsed.code, {
    ...(options.runtimeImport ? { runtimeImport: options.runtimeImport } : {}),
    viewStartLine: parsed.viewStartLine,
    mode: options.mode ?? 'full',
  })

  const map = filename
    ? buildSourceMap(filename, source, generated.code, parsed.moduleLineMap, generated.mappings)
    : undefined

  return {
    code: generated.code,
    script: parsed.code,
    template: parsed.viewHtml!,
    ...(map ? { map } : {}),
  }
}

function buildSourceMap(
  filename: string,
  source: string,
  output: string,
  moduleLineMap: number[],
  codegenMappings: CodegenMapping[],
): RawSourceMap {
  const generator = new SourceMapGenerator({ file: basename(filename) })
  const outputLines = output.split('\n')

  generator.addMapping({
    generated: { line: 1, column: 0 },
    original: { line: 1, column: 0 },
    source: filename,
  })

  const moduleStartLine = 3
  for (let i = 0; i < moduleLineMap.length; i++) {
    const generatedLine = moduleStartLine + i
    if (generatedLine > outputLines.length) break
    generator.addMapping({
      generated: { line: generatedLine, column: 0 },
      original: { line: moduleLineMap[i]!, column: 0 },
      source: filename,
    })
  }

  for (const mapping of codegenMappings) {
    if (mapping.generatedLine > outputLines.length) continue
    generator.addMapping({
      generated: { line: mapping.generatedLine, column: 0 },
      original: { line: mapping.originalLine, column: 0 },
      source: filename,
    })
  }

  generator.setSourceContent(filename, source)
  return generator.toJSON()
}
