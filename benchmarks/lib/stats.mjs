export function measure(fn, { iterations = 2000, warmup = 200 } = {}) {
  for (let i = 0; i < warmup; i++) fn()
  const samples = []
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now()
    fn()
    samples.push(performance.now() - t0)
  }
  samples.sort((a, b) => a - b)
  const sum = samples.reduce((acc, value) => acc + value, 0)
  return {
    iterations,
    min: samples[0],
    p50: samples[Math.floor(samples.length * 0.5)],
    p95: samples[Math.floor(samples.length * 0.95)],
    max: samples[samples.length - 1],
    mean: sum / samples.length,
  }
}

export function ratio(a, b) {
  if (!b) return null
  return a / b
}
