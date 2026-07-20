import { pathToFileURL } from 'node:url'
import { installDom } from './lib/dom.mjs'
import { loadCompiled } from './lib/load-compiled.mjs'
import { measure } from './lib/stats.mjs'

const COUNTER = `import { signal } from '@jacare/core'

const count = signal(0)

function increment() {
  count.update((n) => n + 1)
}

export <view>
  <div class="counter">
    <p class="value">\${count}</p>
    <button type="button" on-click=\${increment}>+1</button>
  </div>
</view>
`

installDom()

export function runMountCold() {
  const { module } = loadCompiled(COUNTER, ['mount'], { mode: 'client', cpw: true })
  const { mount } = module

  const stats = measure(
    () => {
      const root = document.createElement('div')
      document.body.appendChild(root)
      const dispose = mount(root)
      dispose()
      root.remove()
    },
    { iterations: 300, warmup: 30 },
  )

  document.body.textContent = ''
  return {
    name: 'mount-cold',
    description: 'Cold mount of a compiled counter view',
    p95: stats.p95,
    mean: stats.mean,
    min: stats.min,
    max: stats.max,
    stats,
    targetP95Ms: 2,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runMountCold(), null, 2))
}
