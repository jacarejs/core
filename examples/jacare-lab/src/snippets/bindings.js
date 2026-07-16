import { viewSnippet } from '../utils/snippet.js'

export const mirrorCode = viewSnippet(
  `const draft = pulse('')
const agreed = pulse(false)`,
  `  <div class="stack">
    <div class="row">
      <input bind-value=\${draft} placeholder="Type here" />
      <input bind-value=\${draft} placeholder="Mirrors the field above" />
    </div>
    <div class="row">
      <label class="row"><input type="checkbox" bind-checked=\${agreed} /> Agree</label>
      <label class="row"><input type="checkbox" bind-checked=\${agreed} /> Mirrors the checkbox</label>
    </div>
  </div>`,
)

export const classCode = viewSnippet(
  `const activeTag = pulse('templates')
const tags = ['reactivity', 'templates', 'bindings']

function selectTag(tag) {
  activeTag.set(tag)
}

const tasks = pulse([
  { id: 'a', label: 'Read the docs', done: true },
  { id: 'b', label: 'Build a demo', done: false },
  { id: 'c', label: 'Ship it', done: false },
])

function toggleTask(id) {
  tasks.update((list) => list.map((task) => (task.id === id ? { ...task, done: !task.done } : task)))
}`,
  `  <div class="stack">
    <div class="row">
      #for tags as tag (tag)
        <button class="btn btn-outline" class-active=\${() => activeTag() === tag} on-click=\${() => selectTag(tag)}>\${tag}</button>
      #end
    </div>
    <ul class="list">
      #for tasks() as task (task.id)
        <li class="list-item" class-done=\${task.done} on-click=\${() => toggleTask(task.id)}>
          <span class="item-label">\${task.label}</span>
        </li>
      #end
    </ul>
  </div>`,
)

export const gaugeCode = viewSnippet(
  `const value = pulse(50)
const angle = derive(() => (Number(value()) / 100) * 180 + 'deg')`,
  `  <div class="stack">
    <div class="gauge-mini" style---angle=\${angle}></div>
    <input class="input" type="range" min="0" max="100" bind-value=\${value} />
    <p class="muted">\${value}%</p>
  </div>`,
)

export const numberBindCode = viewSnippet(
  `const quantity = pulse(1)
const unitPrice = 4.5
const total = derive(() => (Number(quantity()) * unitPrice).toFixed(2))`,
  `  <div class="stack">
    <input class="input" type="number" min="1" max="99" bind-value=\${quantity} />
    <p class="muted">\${quantity} × $\${unitPrice} = $\${total}</p>
  </div>`,
)

export const multiClassCode = viewSnippet(
  `const priority = pulse('medium')
const priorities = ['low', 'medium', 'high']

function setPriority(next) {
  priority.set(next)
}`,
  `  <div class="row">
    #for priorities as level (level)
      <button
        class="btn btn-outline"
        class-active=\${() => priority() === level}
        class-badge-warn=\${() => level === 'medium' && priority() === level}
        class-badge-danger=\${() => level === 'high' && priority() === level}
        on-click=\${() => setPriority(level)}
      >
        \${level}
      </button>
    #end
  </div>`,
)
