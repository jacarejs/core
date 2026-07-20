import { pulse, derive } from '@jacare/core'

export const COLUMNS = [
  { id: 'todo', label: 'To do', hint: 'Queued' },
  { id: 'doing', label: 'Doing', hint: 'In motion' },
  { id: 'done', label: 'Done', hint: 'Shipped' },
]

export const items = pulse(
  [
    { id: '1', label: 'Learn Jacaré syntax', column: 'done' },
    { id: '2', label: 'Sketch the board layout', column: 'doing' },
    { id: '3', label: 'Ship the todo suite', column: 'todo' },
    { id: '4', label: 'Play a round of tic-tac-toe', column: 'todo' },
  ],
  { name: 'items', file: 'store.js', line: 9 },
)

export const draft = pulse('', { name: 'draft', file: 'store.js', line: 18 })
export const filter = pulse('', { name: 'filter', file: 'store.js', line: 19 })
export const selectedId = pulse(null, { name: 'selectedId', file: 'store.js', line: 20 })

export const total = derive(() => items().length, { name: 'total', file: 'store.js', line: 22 })
export const active = derive(
  () => items().filter((item) => item.column !== 'done').length,
  { name: 'active', file: 'store.js', line: 23 },
)
export const doneCount = derive(
  () => items().filter((item) => item.column === 'done').length,
  { name: 'doneCount', file: 'store.js', line: 26 },
)

export const filtered = derive(
  () => {
    const q = filter().trim().toLowerCase()
    if (!q) return items()
    return items().filter((item) => item.label.toLowerCase().includes(q))
  },
  { name: 'filtered', file: 'store.js', line: 30 },
)

export const isEmpty = derive(() => items().length === 0, {
  name: 'isEmpty',
  file: 'store.js',
  line: 38,
})
export const noMatches = derive(
  () => filter().trim().length > 0 && filtered().length === 0,
  { name: 'noMatches', file: 'store.js', line: 42 },
)

export function addItem(column = 'todo') {
  const label = draft().trim()
  if (!label) return
  const id = String(Date.now())
  items.update((list) => [...list, { id, label, column }])
  draft.set('')
  selectedId.set(id)
}

export function removeItem(id) {
  items.update((list) => list.filter((item) => item.id !== id))
  if (selectedId() === id) selectedId.set(null)
}

export function toggleDone(id) {
  items.update((list) =>
    list.map((item) => {
      if (item.id !== id) return item
      return {
        ...item,
        column: item.column === 'done' ? 'todo' : 'done',
      }
    }),
  )
}

export function moveItem(id, column) {
  items.update((list) =>
    list.map((item) => (item.id === id ? { ...item, column } : item)),
  )
}

export function selectItem(id) {
  selectedId.set(id)
}

export function itemsIn(column) {
  return items().filter((item) => item.column === column)
}
