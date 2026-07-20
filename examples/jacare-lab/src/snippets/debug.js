import { viewSnippet } from '../utils/snippet.js'

export const singleCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const cart = pulse([
  { id: 'a', qty: 1 },
  { id: 'b', qty: 2 },
])`,
  `
  <debug>\${cart}</debug>
`,
)

export const labelCopyCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const cart = pulse([{ id: 'a', qty: 1 }])`,
  `
  <debug copy label="cart">\${cart}</debug>
`,
)

export const shorthandCode = viewSnippet(
  `import { pulse } from '@jacare/core'

const score = pulse(0)
const mood = pulse('curious')
const removed = pulse(0)`,
  `
  <debug copy label="props">\${{ score, mood, removed }}</debug>
`,
)

export const nestedCode = viewSnippet(
  `import { pulse, derive } from '@jacare/core'

const user = pulse({ name: 'Ada', role: 'admin' })
const flags = pulse({ dark: true, beta: false })
const summary = derive(() => ({
  user: user(),
  flags: flags(),
}))`,
  `
  <debug copy label="summary">\${summary}</debug>
`,
)

export const syntaxCard = `<debug>\${cart}</debug>
<debug copy label="cart">\${cart}</debug>
<debug>\${{ score, mood, removed }}</debug>

<!-- body: exactly one \${expr} -->
<!-- label="…": optional header caption -->
<!-- copy: shows Copy JSON button -->
<!-- stripped when compile({ debug: false }) -->`
