import { signal, escapeHtml } from '@jacare/core'
import { pathToFileURL } from 'node:url'
import { measure } from './lib/stats.mjs'

const ITEM_COUNT = 100

function renderList() {
  const items = signal(
    Array.from({ length: ITEM_COUNT }, (_, i) => ({ id: i, label: `Item ${i}` })),
  )
  return () => {
    let html = '<ul>'
    for (const item of items()) {
      html += `<li data-id="${item.id}">${escapeHtml(item.label)}</li>`
    }
    html += '</ul>'
    return { html, state: { bindings: [] } }
  }
}

export function runSsrThroughput() {
  const render = renderList()
  const stats = measure(() => {
    render()
  }, { iterations: 2000, warmup: 200 })

  const opsPerSec = stats.mean > 0 ? 1000 / stats.mean : 0
  return {
    name: 'ssr-throughput',
    description: `SSR renderToString-style list (${ITEM_COUNT} items)`,
    itemCount: ITEM_COUNT,
    p95: stats.p95,
    mean: stats.mean,
    min: stats.min,
    max: stats.max,
    stats,
    opsPerSec,
    targetOpsPerSec: 2000,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runSsrThroughput(), null, 2))
}
