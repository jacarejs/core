import { viewSnippet } from '../utils/snippet.js'

export const quickStartCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const count = pulse(0)

function increment() {
  count.update((n) => n + 1)
}`,
  `  <div class="stack">
    <div class="row">
      <span class="metric">\${count}</span>
      <button type="button" class="btn" on-click=\${increment}>+1</button>
    </div>
    <p class="muted">This is the whole counter shown in the code panel — no extra wiring.</p>
  </div>`,
)

export const bootCode = `import './app.css'
import { nav } from './nav.js'

const root = document.getElementById('app')
let dispose = nav.attach(root)

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    dispose?.()
    dispose = null
  })
}`

export const greetingCode = viewSnippet(
  `const learnerName = pulse('friend')
const greeting = derive(() => 'Hello, ' + learnerName() + '!')`,
  `  <div class="stack">
    <input class="input" bind-value=\${learnerName} placeholder="Your name" />
    <p class="metric">\${greeting}</p>
  </div>`,
)

export const highlightCode = viewSnippet(
  `const highlighted = pulse(false)

function toggleHighlight() {
  highlighted.update((on) => !on)
}`,
  `  <div class="row">
    <span class="badge" class-badge-warn=\${highlighted}>Lesson preview</span>
    <button type="button" class="btn btn-outline" on-click=\${toggleHighlight}>Toggle class</button>
  </div>`,
)
