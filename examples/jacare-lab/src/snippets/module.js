import { viewSnippet } from '../utils/snippet.js'

export const layoutCode = `// 1. Imports
import { signal, computed } from '@jacare/core'
import Card from './Card.jcr'

// 2. State and logic
const title = signal('Hello')
const subtitle = computed(() => \`Updated: \${title()}\`)

function onSave() {
  title.set('Saved')
}

// 3. View (required)
export <view>
  <Card :title=\${title} :subtitle=\${subtitle}>
    <button on-click=\${onSave}>Save</button>
  </Card>
</view>

// 4. Scoped styles (optional, last)
export <style>
.card { padding: 1rem; }
</style>`

export const viewSyntaxCode = `// Block (recommended)
export <view>...</view>

// Block with default
export default <view>...</view>

// Tagged template
export default view\`...\`

// Return block (factory modules)
return <view>...</view>`

export const styleSyntaxCode = `// Block (recommended)
export <style>...</style>

// With preprocessor lang (parsed as styleLang)
export <style lang="scss">...</style>

// Tagged template after the view
style\`...\``

export const compiledExportsCode = `// Every .jcr file compiles to:
mount(target, props?)   // client render → dispose fn
render(props?)          // server HTML + binding state
resume(target, state, props?)  // hydrate from SSR state
default                 // alias for mount`

export const liveModuleCode = viewSnippet(
  `import { pulse, derive } from '@jacare/core'

const title = pulse('Hello')
const subtitle = derive(() => 'Updated: ' + title())

function onSave() {
  title.set('Saved')
}`,
  `  <div class="stack">
    <p class="metric">\${title}</p>
    <p class="muted">\${subtitle}</p>
    <div class="row">
      <input class="input" bind-value=\${title} />
      <button type="button" class="btn" on-click=\${onSave}>Save</button>
    </div>
  </div>`,
  `.metric { letter-spacing: -0.03em; }`,
)
