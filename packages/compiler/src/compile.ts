import type { RawSourceMap } from 'source-map-js'
import { SourceMapGenerator } from 'source-map-js'
import { basename } from 'node:path'
import { generate, resolveMountProps, detectSignals, detectImportedNames } from './codegen.js'
import type { CodegenMapping } from './codegen-shared.js'
import { parseModule } from './parse-module.js'
import { parseTemplate } from './parse-template.js'
import { hasContractSurface } from './parse-contract.js'
import { isReactiveStyle, parseStyle } from './parse-style.js'
import { scopeCss, scopeIdFromFilename } from './scope-css.js'
import { collectMeshPorts } from './ir/mesh-ports.js'
import type { CompileOptions, CompileResult } from './types.js'

export function compile(source: string, options: CompileOptions = {}): CompileResult {
  const filename = options.filename
  const parsed = parseModule(source, filename)
  const ast = parseTemplate(parsed.viewHtml!, {
    ...(filename ? { filename } : {}),
    baseLine: parsed.viewStartLine,
  })
  const scopeId = options.scopeId ?? (filename ? scopeIdFromFilename(filename) : undefined)
  const styleAst =
    parsed.styleCss != null
      ? parseStyle(parsed.styleCss, filename ? { filename } : {})
      : null
  const reactiveStyle = styleAst != null && isReactiveStyle(styleAst)
  const scopedStyle =
    parsed.styleCss && scopeId && !reactiveStyle ? scopeCss(parsed.styleCss, scopeId) : undefined
  const contract =
    parsed.contract && hasContractSurface(parsed.contract) ? parsed.contract : undefined
  const signals = detectSignals(parsed.code)
  const importedNames = detectImportedNames(parsed.code)
  const meshPorts = collectMeshPorts(ast, { signals, importedNames }, contract)
  const generated = generate(ast, parsed.code, {
    ...(options.runtimeImport ? { runtimeImport: options.runtimeImport } : {}),
    viewStartLine: parsed.viewStartLine,
    mode: options.mode ?? 'full',
    ...(scopeId ? { scopeId } : {}),
    ...(scopedStyle ? { scopedStyle } : {}),
    ...(reactiveStyle && styleAst ? { styleAst } : {}),
    ...(options.cpw ? { cpw: options.cpw } : {}),
    ...(contract ? { contract } : {}),
    ...(options.debug === false ? { debug: false } : {}),
    ...(filename ? { filename } : {}),
    ...(parsed.moduleLineMap.length > 0 ? { lineMap: parsed.moduleLineMap } : {}),
    ...(meshPorts.length > 0 ? { meshPorts } : {}),
  })

  const map = filename
    ? buildSourceMap(filename, source, generated.code, parsed.moduleLineMap, generated.mappings)
    : undefined

  const props = resolveMountProps(parsed.code, ast, contract)

  return {
    code: generated.code,
    script: parsed.code,
    template: parsed.viewHtml!,
    props,
    ...(contract ? { contract } : {}),
    ...(meshPorts.length > 0 ? { meshPorts } : {}),
    ...(scopeId ? { scopeId } : {}),
    ...(scopedStyle ? { scopedStyle } : {}),
    ...(parsed.styleLang ? { styleLang: parsed.styleLang } : {}),
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
