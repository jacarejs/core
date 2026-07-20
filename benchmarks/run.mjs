import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runPulseFanout } from './pulse-fanout.mjs'
import { runPulseUpdate } from './pulse-update.mjs'
import { runListToggle } from './list-toggle.mjs'
import { runMountCold } from './mount-cold.mjs'
import { runHydrate } from './hydrate.mjs'
import { runSsrThroughput } from './ssr-throughput.mjs'
import { runCompileApp } from './compile-app.mjs'
import { runBundle } from './bundle.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const resultsDir = join(root, 'results')

const scenarios = [
  runPulseUpdate(),
  runPulseFanout(),
  runListToggle(),
  runMountCold(),
  runHydrate(),
  runSsrThroughput(),
  runCompileApp(),
  await runBundle(),
]

const report = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  scenarios,
  targets: {
    'pulse-update-p95-ms': 0.15,
    'pulse-fanout-p95-ms': 0.5,
    'list-toggle-p95-ms': 8,
    'mount-cold-p95-ms': 2,
    'hydrate-p95-ms': 1,
    'ssr-throughput-ops': 2000,
    'compile-app-p95-ms': 50,
    'bundle-counter-app-kb-gzip': 12,
    'test-suite-s': 30,
  },
}

mkdirSync(resultsDir, { recursive: true })
const stamp = report.generatedAt.replace(/[:.]/g, '-')
const outPath = join(resultsDir, `bench-${stamp}.json`)
writeFileSync(outPath, JSON.stringify(report, null, 2))

console.log(`Benchmark results → ${outPath}\n`)

function printScenario(scenario) {
  console.log(`## ${scenario.name}`)
  console.log(scenario.description)

  if (scenario.runtime && scenario.cpw) {
    console.log(`  runtime p95: ${scenario.runtime.p95.toFixed(4)} ms`)
    console.log(`  cpw     p95: ${scenario.cpw.p95.toFixed(4)} ms`)
    if (scenario.speedupCpwVsRuntime) {
      console.log(`  speedup: ${scenario.speedupCpwVsRuntime.toFixed(2)}x`)
    }
    if (scenario.targetP95Ms) {
      const ok = scenario.cpw.p95 < scenario.targetP95Ms
      console.log(`  target p95 < ${scenario.targetP95Ms} ms: ${ok ? 'PASS' : 'WARN'}`)
    }
  } else if (scenario.gzipKb != null) {
    console.log(`  gzip: ${scenario.gzipKb.toFixed(2)} KB`)
    console.log(
      `  target gzip < ${scenario.targetGzipKb} KB: ${scenario.targetOk ? 'PASS' : 'WARN'}`,
    )
  } else if (scenario.opsPerSec != null) {
    console.log(`  mean: ${scenario.mean.toFixed(4)} ms`)
    console.log(`  ops/s: ${scenario.opsPerSec.toFixed(0)}`)
    if (scenario.targetOpsPerSec) {
      const ok = scenario.opsPerSec >= scenario.targetOpsPerSec
      console.log(
        `  target ops/s >= ${scenario.targetOpsPerSec}: ${ok ? 'PASS' : 'WARN'}`,
      )
    }
  } else if (scenario.p95 != null) {
    console.log(`  p95: ${scenario.p95.toFixed(4)} ms`)
    console.log(`  mean: ${scenario.mean.toFixed(4)} ms`)
    if (scenario.targetP95Ms) {
      const ok = scenario.p95 < scenario.targetP95Ms
      console.log(`  target p95 < ${scenario.targetP95Ms} ms: ${ok ? 'PASS' : 'WARN'}`)
    }
  }
  console.log('')
}

for (const scenario of scenarios) {
  printScenario(scenario)
}

const failed = scenarios.some((s) => {
  if (s.targetP95Ms && s.cpw) return s.cpw.p95 >= s.targetP95Ms
  if (s.targetP95Ms && s.p95 != null) return s.p95 >= s.targetP95Ms
  if (s.targetGzipKb != null) return !s.targetOk
  if (s.targetOpsPerSec != null) return s.opsPerSec < s.targetOpsPerSec
  return false
})
process.exitCode = failed ? 1 : 0
