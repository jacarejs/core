import { pathToFileURL } from 'node:url'
import { compileSource } from './lib/load-compiled.mjs'
import { measure } from './lib/stats.mjs'

const APP = `import { signal, computed } from '@jacare/core'

const count = signal(0)
const label = computed(() => \`Count: \${count()}\`)

function increment() {
  count.update((n) => n + 1)
}

export <view>
  <div class="app">
    <h1>\${label}</h1>
    <button type="button" on-click=\${increment}>+1</button>
    #if count() > 0
      <p class="hint">Running</p>
    #else
      <p class="hint">Idle</p>
    #end
  </div>
</view>

export <style>
.app { padding: 1rem; }
.hint { color: #666; }
</style>
`

export function runCompileApp() {
  const stats = measure(
    () => {
      compileSource(APP, { filename: 'app.jcr', mode: 'client', cpw: true })
    },
    { iterations: 200, warmup: 20 },
  )

  return {
    name: 'compile-app',
    description: 'compile() counter-style .jcr (client + CPW)',
    p95: stats.p95,
    mean: stats.mean,
    min: stats.min,
    max: stats.max,
    stats,
    targetP95Ms: 50,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runCompileApp(), null, 2))
}
