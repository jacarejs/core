import { viewSnippet } from '../utils/snippet.js'

export const tasksCode = viewSnippet(
  `import {
  active, doneCount, total,
  draft, filter, filtered,
  addItem, toggleDone, removeItem,
} from '../store.js'

function onDraftKeydown(e) {
  if (e.key === 'Enter') addItem()
}`,
  `  <section class="page">
    <h1>Tarefas</h1>
    <p>abertas \${active} · feitas \${doneCount} · todas \${total}</p>

    <input bind-value=\${filter} placeholder="Filtrar…" />
    <input bind-value=\${draft} on-keydown=\${onDraftKeydown} placeholder="Nova tarefa" />
    <button on-click=\${() => addItem()}>Adicionar</button>

    <ul>
      #for filtered() as item (item.id)
        <li class-done=\${() => item.column === 'done'}>
          <button on-click=\${(e) => { e.stopPropagation(); toggleDone(item.id) }}>✓</button>
          <span>\${item.label}</span>
          <button on-click=\${() => removeItem(item.id)}>×</button>
        </li>
      #end
    </ul>
  </section>`,
)

export const kanbanCode = viewSnippet(
  `import { pulse } from '@jacare/core'
import { COLUMNS, draft, items, itemsIn, addItem, moveItem } from '../store.js'

const dropTarget = pulse(null)

function onDrop(e, column) {
  e.preventDefault()
  const id = e.dataTransfer.getData('text/plain')
  if (id) moveItem(id, column)
  dropTarget.set(null)
}`,
  `  <section class="page">
    <h1>Kanban</h1>
    <input bind-value=\${draft} />
    <button on-click=\${() => addItem('todo')}>Adicionar</button>

    <div class="board">
      #for COLUMNS as col (col.id)
        <section
          class="column"
          on-dragover=\${(e) => { e.preventDefault(); dropTarget.set(col.id) }}
          on-drop=\${(e) => onDrop(e, col.id)}
        >
          <h2>\${col.label} · \${itemsIn(col.id).length}</h2>
          #for items() as item (item.id)
            #if item.column === col.id
              <article draggable="true"
                on-dragstart=\${(e) => e.dataTransfer.setData('text/plain', item.id)}>
                \${item.label}
              </article>
            #end
          #end
        </section>
      #end
    </div>
  </section>`,
)

export const matchCode = viewSnippet(
  `import { pulse, derive } from '@jacare/core'

const board = pulse(Array(9).fill(null))
const turn = pulse('X')
const winner = pulse(null)
const scores = pulse({ X: 0, O: 0, draws: 0 })

const status = derive(() => {
  if (winner() === 'draw') return 'Empate'
  if (winner()) return winner() + ' venceu'
  return turn() + ' joga'
})

function play(index) {
  if (winner() || board()[index]) return
  const next = board().slice()
  next[index] = turn()
  board.set(next)
  // … check winner, swap turn
}`,
  `  <section class="page">
    <h1>Jogo da velha</h1>
    <p>\${status}</p>
    <div class="grid-ttt">
      #for [0,1,2,3,4,5,6,7,8] as i (i)
        <button on-click=\${() => play(i)}>
          \${board()[i] ?? ''}
        </button>
      #end
    </div>
    <p>X \${scores().X} · O \${scores().O} · = \${scores().draws}</p>
  </section>`,
)

export const storeCode = `import { pulse, derive } from '@jacare/core'

export const items = pulse([
  { id: '1', label: 'Learn Jacaré syntax', column: 'done' },
  { id: '2', label: 'Sketch the board layout', column: 'doing' },
  { id: '3', label: 'Ship the todo suite', column: 'todo' },
], { name: 'items', file: 'store.js', line: 9 })

export const draft = pulse('', { name: 'draft' })
export const filter = pulse('', { name: 'filter' })

export const filtered = derive(() => {
  const q = filter().trim().toLowerCase()
  if (!q) return items()
  return items().filter((item) => item.label.toLowerCase().includes(q))
}, { name: 'filtered' })

export function addItem(column = 'todo') { /* … */ }
export function moveItem(id, column) { /* … */ }
export function toggleDone(id) { /* … */ }
`
