import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runPulseFanout } from './pulse-fanout.mjs'
import { runPulseUpdate } from './pulse-update.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const resultsDir = join(root, 'results')

const scenarios = [runPulseUpdate(), runPulseFanout()]

const report = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  scenarios,
  targets: {
    'pulse-update-p95-ms': 0.15,
    'bundle-counter-app-kb-gzip': 12,
    'compile-app-jcr-ms': 50,
    'test-suite-s': 30,
  },
}

mkdirSync(resultsDir, { recursive: true })
const stamp = report.generatedAt.replace(/[:.]/g, '-')
const outPath = join(resultsDir, `bench-${stamp}.json`)
writeFileSync(outPath, JSON.stringify(report, null, 2))

console.log(`Benchmark results → ${outPath}\n`)
for (const scenario of scenarios) {
  console.log(`## ${scenario.name}`)
  console.log(scenario.description)
  console.log(`  runtime p95: ${scenario.runtime.p95.toFixed(4)} ms`)
  console.log(`  cpw     p95: ${scenario.cpw.p95.toFixed(4)} ms`)
  if (scenario.speedupCpwVsRuntime) {
    console.log(`  speedup: ${scenario.speedupCpwVsRuntime.toFixed(2)}x`)
  }
  if (scenario.targetP95Ms) {
    const ok = scenario.cpw.p95 < scenario.targetP95Ms
    console.log(`  target p95 < ${scenario.targetP95Ms} ms: ${ok ? 'PASS' : 'WARN'}`)
  }
  console.log('')
}

const failed = scenarios.some(
  (s) => s.targetP95Ms && s.cpw.p95 >= s.targetP95Ms,
)
process.exitCode = failed ? 1 : 0
