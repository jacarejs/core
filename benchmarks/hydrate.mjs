import { signal, resumeBindings, escapeHtml } from '@jacare/core'
import { pathToFileURL } from 'node:url'
import { installDom } from './lib/dom.mjs'
import { measure } from './lib/stats.mjs'

installDom()

function renderCounter(count) {
  const html = `<div class="counter"><span data-jacare-bind="c0">${escapeHtml(String(count()))}</span></div>`
  return {
    html,
    state: {
      bindings: [{ id: 'c0', kind: 'signal', read: count }],
    },
  }
}

export function runHydrate() {
  const stats = measure(
    () => {
      const count = signal(0)
      const { html, state } = renderCounter(count)
      const root = document.createElement('div')
      document.body.appendChild(root)
      root.innerHTML = html
      const cleanups = resumeBindings(root, state)
      count.set(1)
      for (const cleanup of cleanups) cleanup()
      root.remove()
    },
    { iterations: 400, warmup: 40 },
  )

  document.body.textContent = ''
  return {
    name: 'hydrate',
    description: 'SSR HTML → resumeBindings (text)',
    p95: stats.p95,
    mean: stats.mean,
    min: stats.min,
    max: stats.max,
    stats,
    targetP95Ms: 1,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runHydrate(), null, 2))
}
