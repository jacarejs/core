import { viewSnippet } from '../utils/snippet.js'

export const PLAYGROUND_EXAMPLES = [
  {
    id: 'counter',
    label: 'Counter',
    source: viewSnippet(
      `import { pulse } from '@jacare/core'

const count = pulse(0)

function bump() {
  count.update((n) => n + 1)
}

function reset() {
  count.set(0)
}`,
      `  <div class="stack">
    <p class="metric">\${count}</p>
    <div class="row">
      <button type="button" class="btn" on-click=\${bump}>+1</button>
      <button type="button" class="btn btn-outline" on-click=\${reset}>Reset</button>
    </div>
  </div>`,
    ),
  },
  {
    id: 'derive',
    label: 'Derive',
    source: viewSnippet(
      `import { pulse, derive } from '@jacare/core'

const score = pulse(50)
const category = derive(() => {
  const n = Number(score())
  if (n < 34) return 'Low'
  if (n < 67) return 'Medium'
  return 'High'
})`,
      `  <div class="stack">
    <input class="input" type="range" min="0" max="100" bind-value=\${score} />
    <p class="metric">\${score} → \${category}</p>
  </div>`,
    ),
  },
  {
    id: 'list',
    label: 'List',
    source: viewSnippet(
      `import { pulse } from '@jacare/core'

const draft = pulse('')
const nextId = pulse(3)
const items = pulse([
  { id: '1', label: 'Compile' },
  { id: '2', label: 'Mount' },
])

function addItem() {
  const label = draft().trim()
  if (!label) return
  const id = String(nextId())
  nextId.update((n) => n + 1)
  items.update((list) => [...list, { id, label }])
  draft.set('')
}

function removeItem(id) {
  items.update((list) => list.filter((item) => item.id !== id))
}`,
      `  <div class="stack">
    <div class="row">
      <input class="input" bind-value=\${draft} placeholder="New item" />
      <button type="button" class="btn" on-click=\${addItem}>Add</button>
    </div>
    <ul class="list">
      #for items() as item (item.id)
        <li class="list-item">
          <span class="item-label">\${item.label}</span>
          <button type="button" class="btn btn-outline" on-click=\${() => removeItem(item.id)}>Remove</button>
        </li>
      #end
    </ul>
  </div>`,
    ),
  },
  {
    id: 'if',
    label: '#if',
    source: viewSnippet(
      `import { pulse } from '@jacare/core'

const open = pulse(false)

function toggle() {
  open.update((value) => !value)
}`,
      `  <div class="stack">
    <button type="button" class="btn" on-click=\${toggle}>
      \${open() ? 'Hide' : 'Show'} panel
    </button>
    #if open()
      <p class="muted">This branch only exists in the DOM while open is true.</p>
    #else
      <p class="muted">Closed — the other branch is not mounted.</p>
    #end
  </div>`,
    ),
  },
  {
    id: 'events',
    label: 'Events',
    source: viewSnippet(
      `import { pulse } from '@jacare/core'

const clicks = pulse(0)
const lastKey = pulse('(none)')

function onClick() {
  clicks.update((n) => n + 1)
}

function onKeydown(event) {
  lastKey.set(event.key)
}`,
      `  <div class="stack">
    <input class="input" placeholder="Type here" on-keydown=\${onKeydown} />
    <p class="muted">Last key: \${lastKey}</p>
    <button type="button" class="btn" on-click=\${onClick}>Clicked \${clicks} times</button>
  </div>`,
    ),
  },
  {
    id: 'bindings',
    label: 'Bindings',
    source: viewSnippet(
      `import { pulse, derive } from '@jacare/core'

const active = pulse(false)
const progress = pulse(40)
const pct = derive(() => progress() + '%')

function toggleActive() {
  active.update((on) => !on)
}`,
      `  <div class="stack">
    <button type="button" class="btn btn-outline" class-active=\${active} on-click=\${toggleActive}>Toggle active class</button>
    <div class="progress">
      <div class="progress-fill" style---pct=\${pct}></div>
    </div>
    <input class="input" type="range" min="0" max="100" bind-value=\${progress} />
  </div>`,
    ),
  },
  {
    id: 'form-field',
    label: 'Form field',
    source: viewSnippet(
      `import { pulse, derive } from '@jacare/core'

const email = pulse('')
const touched = pulse(false)
const error = derive(() => (touched() && !email().includes('@') ? 'Enter a valid email' : ''))

function onBlur() {
  touched.set(true)
}`,
      `  <div class="stack">
    <label class="field">
      <span class="field-label">Email</span>
      <input class="input" bind-value=\${email} placeholder="you@jacare.dev" on-blur=\${onBlur} />
      #if error()
        <span class="field-error">\${error}</span>
      #end
    </label>
  </div>`,
    ),
  },
]

export const DEFAULT_PLAYGROUND_SOURCE = PLAYGROUND_EXAMPLES[0].source
