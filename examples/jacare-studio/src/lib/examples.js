import { viewSnippet } from './snippet.js'

export function emptyComponentSource(name) {
  return `export <view>
  <div class="stack">
    <p>${name.replace(/\.jcr$/, '')} component</p>
  </div>
</view>
`
}

export const STUDIO_EXAMPLES = [
  {
    id: 'blank',
    label: 'Blank',
    blurb: 'start from zero',
    source: `export <view>
  <main class="stack">
  </main>
</view>
`,
  },
  {
    id: 'counter',
    label: 'Counter',
    blurb: 'pulse + click',
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
      <button type="button" class="btn btn-ghost" on-click=\${reset}>Reset</button>
    </div>
  </div>`,
    ),
  },
  {
    id: 'derive',
    label: 'Derive',
    blurb: 'score → band',
    source: viewSnippet(
      `import { pulse, derive } from '@jacare/core'

const score = pulse(50)
const band = derive(() => {
  const n = Number(score())
  if (n < 34) return 'Low'
  if (n < 67) return 'Medium'
  return 'High'
})`,
      `  <div class="stack">
    <input class="input" type="range" min="0" max="100" bind-value=\${score} />
    <p class="metric">\${score} → \${band}</p>
  </div>`,
    ),
  },
  {
    id: 'list',
    label: 'List',
    blurb: '#for keyed',
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
          <span>\${item.label}</span>
          <button type="button" class="btn btn-ghost" on-click=\${() => removeItem(item.id)}>×</button>
        </li>
      #end
    </ul>
  </div>`,
    ),
  },
  {
    id: 'if',
    label: '#if',
    blurb: 'branch mount',
    source: viewSnippet(
      `import { pulse } from '@jacare/core'

const open = pulse(true)

function toggle() {
  open.update((value) => !value)
}`,
      `  <div class="stack">
    <button type="button" class="btn" on-click=\${toggle}>
      \${open() ? 'Hide' : 'Show'} panel
    </button>
    #if open()
      <p class="muted">Mounted while open is true — the other branch is gone.</p>
    #else
      <p class="muted">Closed branch. No leftover DOM from the open panel.</p>
    #end
  </div>`,
    ),
  },
  {
    id: 'case',
    label: '#case',
    blurb: 'match arms',
    source: viewSnippet(
      `import { pulse } from '@jacare/core'

const role = pulse('member')

function setRole(next) {
  role.set(next)
}`,
      `  <div class="stack">
    <div class="row">
      <button type="button" class="btn btn-ghost" on-click=\${() => setRole('admin')}>admin</button>
      <button type="button" class="btn btn-ghost" on-click=\${() => setRole('guest')}>guest</button>
      <button type="button" class="btn btn-ghost" on-click=\${() => setRole('member')}>member</button>
    </div>
    #case role()
      #when 'admin'
        <p class="muted">Admin panel unlocked.</p>
      #when 'guest'
        <p class="muted">Guest preview only.</p>
      #else
        <p class="muted">Member workspace.</p>
    #end
  </div>`,
    ),
  },
  {
    id: 'bindings',
    label: 'Bindings',
    blurb: 'class + CSS var',
    source: viewSnippet(
      `import { pulse, derive } from '@jacare/core'

const active = pulse(false)
const progress = pulse(42)
const pct = derive(() => progress() + '%')

function toggleActive() {
  active.update((on) => !on)
}`,
      `  <div class="stack">
    <button type="button" class="btn btn-ghost" class-active=\${active} on-click=\${toggleActive}>
      Toggle active
    </button>
    <div class="progress">
      <div class="progress-fill" style---pct=\${pct}></div>
    </div>
    <input class="input" type="range" min="0" max="100" bind-value=\${progress} />
  </div>`,
    ),
  },
  {
    id: 'form',
    label: 'Form',
    blurb: 'field + error',
    source: viewSnippet(
      `import { pulse, derive } from '@jacare/core'

const email = pulse('')
const touched = pulse(false)
const error = derive(() =>
  touched() && !email().includes('@') ? 'Enter a valid email' : '',
)

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
  {
    id: 'components',
    label: 'Components',
    blurb: 'props + events',
    files: [
      {
        name: 'App.jcr',
        source: `import { pulse } from '@jacare/core'
import Greeting from './Greeting.jcr'

const name = pulse('Jacaré')
const messages = pulse(0)

function rename(nextName) {
  name.set(nextName)
  messages.update((count) => count + 1)
}

export <view>
  <div class="stack">
    <Greeting :name=\${name} on-rename=\${rename} />
    <p class="muted">The child updated the parent \${messages} times.</p>
  </div>
</view>
`,
      },
      {
        name: 'Greeting.jcr',
        source: `export <contract>
  props: {
    name: { type: 'string', required: true }
  }
  emits: ['rename']
</contract>

export <view>
  <div class="stack">
    <p class="metric">Hello, \${name}!</p>
    <div class="row">
      <button type="button" class="btn" on-click=\${() => emit('rename', 'Studio')}>
        Call me Studio
      </button>
      <button type="button" class="btn btn-ghost" on-click=\${() => emit('rename', 'Jacaré')}>
        Reset name
      </button>
    </div>
  </div>
</view>
`,
      },
    ],
  },
  {
    id: 'timer',
    label: 'Timer',
    blurb: 'start + pause',
    source: viewSnippet(
      `import { pulse, createLifecycle } from '@jacare/core'

const seconds = pulse(0)
const running = pulse(false)
let timer = null

function start() {
  if (timer) return
  running.set(true)
  timer = setInterval(() => seconds.update((n) => n + 1), 1000)
}

function pause() {
  clearInterval(timer)
  timer = null
  running.set(false)
}

function reset() {
  pause()
  seconds.set(0)
}

export const lifecycle = createLifecycle({
  onMount() {
    return pause
  },
})`,
      `  <div class="stack">
    <p class="metric">\${seconds}s</p>
    <div class="row">
      <button type="button" class="btn" on-click=\${running() ? pause : start}>
        \${running() ? 'Pause' : 'Start'}
      </button>
      <button type="button" class="btn btn-ghost" on-click=\${reset}>Reset</button>
    </div>
    <p class="muted">The timer is cleaned up when Studio remounts the preview.</p>
  </div>`,
    ),
  },
]

export const DEFAULT_STUDIO_SOURCE = STUDIO_EXAMPLES[0].source
