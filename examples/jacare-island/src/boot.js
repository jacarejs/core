import { mountIsland } from '@jacare/core/island'
import CounterIsland from './CounterIsland.jcr'
import TipIsland from './TipIsland.jcr'

const versionEl = document.getElementById('jacare-version')
if (versionEl && import.meta.env.JACARE_VERSION) {
  versionEl.hidden = false
  versionEl.textContent = `@jacare/core v${import.meta.env.JACARE_VERSION}`
}

const disposers = [
  mountIsland('#counter-island', CounterIsland, {
    props: { start: 2, label: 'Live clicks' },
  }),
  mountIsland('#tip-island', TipIsland, {
    props: { topic: 'shadow islands' },
    shadow: true,
  }),
]

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const dispose of disposers) dispose()
  })
}
