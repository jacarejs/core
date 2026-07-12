#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { compile } from './compile.js'

const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: jacare-compile <input.jcr> [output.js]')
  process.exit(1)
}

const input = resolve(args[0]!)
const output = resolve(args[1] ?? input.replace(/\.jcr$/, '.js'))

const source = readFileSync(input, 'utf-8')
const result = compile(source, { filename: basename(input) })
writeFileSync(output, result.code, 'utf-8')
console.log(`Compiled ${input} → ${output}`)
