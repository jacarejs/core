import { readFileSync, watch, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { compile } from '@jacare/compiler'

export function compileOnce(inputPath: string, outputPath?: string): void {
  const input = resolve(inputPath)
  const output = resolve(outputPath ?? input.replace(/\.jcr$/, '.js'))
  const source = readFileSync(input, 'utf-8')
  const result = compile(source, { filename: basename(input) })
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
  console.log(`Watching ${input}`)
}
