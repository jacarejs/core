import { viewSnippet } from '../utils/snippet.js'

export const keyedCode = viewSnippet(
  `const nextId = pulse(4)
const items = pulse([
  { id: '1', label: 'Alpha' },
  { id: '2', label: 'Beta' },
  { id: '3', label: 'Gamma' },
])
const draft = pulse('')

function addItem() {
  const label = draft().trim()
  if (!label) return
  const id = String(nextId())
  nextId.update((n) => n + 1)
  items.update((list) => [...list, { id, label }])
  draft.set('')
}

function onDraftKeydown(event) {
  if (event.key === 'Enter') addItem()
}

function removeItem(id) {
  items.update((list) => list.filter((item) => item.id !== id))
}

function moveUp(id) {
  items.update((list) => {
    const index = list.findIndex((item) => item.id === id)
    if (index <= 0) return list
    const next = list.slice()
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    return next
  })
}

function moveDown(id) {
  items.update((list) => {
    const index = list.findIndex((item) => item.id === id)
    if (index === -1 || index >= list.length - 1) return list
    const next = list.slice()
    ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
    return next
  })
}`,
  `  <div class="stack">
    <div class="row">
      <input bind-value=\${draft} placeholder="New item" on-keydown=\${onDraftKeydown} />
      <button class="btn" on-click=\${addItem}>Add</button>
    </div>
    <ul class="list">
      #for items() as item (item.id)
        <li class="list-item">
          <span class="item-label">\${item.label}</span>
          <div class="row">
            <button class="btn btn-ghost" on-click=\${() => moveUp(item.id)}>↑</button>
            <button class="btn btn-ghost" on-click=\${() => moveDown(item.id)}>↓</button>
            <button class="btn btn-outline" on-click=\${() => removeItem(item.id)}>Remove</button>
          </div>
        </li>
      #end
    </ul>
  </div>`,
)

export const indexCode = viewSnippet(
  `const ranked = ['Reactivity', 'Templates', 'Bindings']`,
  `  <ol class="list">
    #for ranked as rank, index (rank)
      <li class="list-item"><span class="item-label">\${index + 1}. \${rank}</span></li>
    #end
  </ol>`,
)

export const emptyPatternCode = viewSnippet(
  `const bucket = pulse([])

function addToBucket() {
  bucket.update((list) => [...list, { id: String(Date.now()) + '-' + list.length, label: 'Item ' + (list.length + 1) }])
}

function clearBucket() {
  bucket.set([])
}`,
  `  <div class="stack">
    <div class="row">
      <button class="btn" on-click=\${addToBucket}>Add item</button>
      <button class="btn btn-outline" on-click=\${clearBucket}>Clear</button>
    </div>

    <div>
      <p class="muted">Pattern A — the loop is nested inside the empty check:</p>
      #if bucket().length === 0
        <p class="muted">Bucket is empty.</p>
      #else
        <ul class="list">
          #for bucket() as item (item.id)
            <li class="list-item"><span class="item-label">\${item.label}</span></li>
          #end
        </ul>
      #end
    </div>

    <div>
      <p class="muted">Pattern B — preferred: a stable list, only the message toggles:</p>
      #if bucket().length === 0
        <p class="muted">Bucket is empty.</p>
      #end
      <ul class="list">
        #for bucket() as item (item.id)
          <li class="list-item"><span class="item-label">\${item.label}</span></li>
        #end
      </ul>
    </div>
  </div>`,
)

export const catalogCode = viewSnippet(
  `const catalog = [
  { id: 'mug', name: 'Jacaré Mug' },
  { id: 'tee', name: 'Logo T-Shirt' },
  { id: 'sticker', name: 'Sticker Pack' },
]`,
  `  <ul class="list">
    #for catalog as product (product.id)
      <li class="list-item"><span class="item-label">\${product.name}</span></li>
    #end
  </ul>`,
)

export const filterCode = viewSnippet(
  `const onlyUnfinished = pulse(false)
const chores = pulse([
  { id: '1', label: 'Water the plants', done: true },
  { id: '2', label: 'Feed the fish', done: false },
  { id: '3', label: 'Sweep the porch', done: false },
])

const visibleChores = derive(() => (onlyUnfinished() ? chores().filter((chore) => !chore.done) : chores()))

function toggleChore(id) {
  chores.update((list) => list.map((chore) => (chore.id === id ? { ...chore, done: !chore.done } : chore)))
}

function toggleFilter() {
  onlyUnfinished.update((on) => !on)
}`,
  `  <div class="stack">
    <label class="row"><input type="checkbox" bind-checked=\${onlyUnfinished} /> Show only unfinished</label>
    <ul class="list">
      #for visibleChores() as chore (chore.id)
        <li class="list-item" class-done=\${chore.done} on-click=\${() => toggleChore(chore.id)}>
          <span class="item-label">\${chore.label}</span>
        </li>
      #end
    </ul>
  </div>`,
)

export const moveTopCode = viewSnippet(
  `const podium = pulse([
  { id: 'a', name: 'Ada' },
  { id: 'b', name: 'Grace' },
  { id: 'c', name: 'Alan' },
])

function moveToTop(id) {
  podium.update((list) => {
    const index = list.findIndex((entry) => entry.id === id)
    if (index <= 0) return list
    const next = list.slice()
    const [entry] = next.splice(index, 1)
    next.unshift(entry)
    return next
  })
}`,
  `  <ol class="list">
    #for podium() as entry (entry.id)
      <li class="list-item">
        <span class="item-label">\${entry.name}</span>
        <button class="btn btn-outline" on-click=\${() => moveToTop(entry.id)}>Move to top</button>
      </li>
    #end
  </ol>`,
)
