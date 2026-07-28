import { existsSync, readFileSync, watch, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compile } from '@jacare/compiler'

export function compileOnce(inputPath: string, outputPath?: string): void {
  const input = resolve(inputPath)
  const output = resolve(outputPath ?? input.replace(/\.jcr$/, '.js'))
  if (output === input) {
    throw new Error('Refusing to overwrite the input file; use a .jcr input or pass an output path')
  }
  const source = readFileSync(input, 'utf-8')
  const result = compile(source, { filename: input })
  writeFileSync(output, result.code, 'utf-8')
  console.log(`Compiled ${input} → ${output}`)
}

export function compileWatch(inputPath: string, outputPath?: string): void {
  const input = resolve(inputPath)
  const run = (): void => {
    try {
      compileOnce(input, outputPath)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  run()
  watch(input, run)
  const sibling = `${input}.ts`
  if (existsSync(sibling)) {
    watch(sibling, run)
  }
  console.log(`Watching ${input}`)
}
