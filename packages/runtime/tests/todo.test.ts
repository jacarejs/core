import { describe, expect, it } from 'vitest'
import { compile } from '@jacare/compiler'
import * as runtime from '@jacare/core'

const TODO = `import { pulse, derive, view } from '@jacare/core'

const items = pulse([
  { id: '1', label: 'Learn Jacare' },
  { id: '2', label: 'Build apps' },
])

const filter = pulse('')
const filtered = derive(() => {
  const q = filter().trim().toLowerCase()
  if (!q) return items()
  return items().filter((item) => item.label.toLowerCase().includes(q))
})

function addItem() {
  const id = String(Date.now())
  items.update((list) => [...list, { id, label: 'Item ' + (list.length + 1) }])
}

function removeItem(id) {
  items.update((list) => list.filter((item) => item.id !== id))
}

export default view\`
  <div class="todo">
    <input on-input=\${(e) => filter.set(e.target.value)} />
    <button on-click=\${addItem}>Add</button>
    #if filtered().length === 0
      <p class="empty">No items</p>
    #else
      <ul>
        #for filtered() as item (item.id)
          <li>
            <span>\${item.label}</span>
            <button on-click=\${() => removeItem(item.id)}>×</button>
          </li>
        #end
      </ul>
    #end
  </div>
\``

function loadApp(source: string) {
  const { code } = compile(source)
  const body = code
    .replace(/^import[^\n]*\n/, '')
    .replace(/^export default mount\s*/m, '')
    .replace(/^export /gm, '')
  return new Function(
    'runtime',
    `const { signal, computed, pulse, derive, effect, bindText, bindAttribute, bindModel, bindClass, showIf, branch, reconcileKeyedList, resumeBindings } = runtime
${body}
return { mount, filter, items }`,
  )(runtime) as {
    mount: (target: HTMLElement) => () => void
    filter: { set: (value: string) => void }
    items: { update: (fn: (list: { id: string; label: string }[]) => { id: string; label: string }[]) => void }
  }
}

describe('todo app', () => {
  it('adds, filters, and removes items', async () => {
    const { mount, filter } = loadApp(TODO)
    const root = document.createElement('div')
    const dispose = mount(root)

    expect(root.querySelectorAll('li')).toHaveLength(2)

    filter.set('jacare')
    await Promise.resolve()
    expect(root.querySelectorAll('li')).toHaveLength(1)

    filter.set('')
    await Promise.resolve()
    expect(root.querySelectorAll('li')).toHaveLength(2)

    ;(root.querySelector('.todo > button') as HTMLButtonElement).click()
    await Promise.resolve()
    expect(root.querySelectorAll('li')).toHaveLength(3)

    filter.set('zzz')
    await Promise.resolve()
    expect(root.querySelector('.empty')?.textContent).toBe('No items')
    expect(root.querySelector('ul')).toBeNull()

    filter.set('')
    await Promise.resolve()
    expect(root.querySelectorAll('li')).toHaveLength(3)

    ;(root.querySelector('li button') as HTMLButtonElement).click()
    await Promise.resolve()
    expect(root.querySelectorAll('li')).toHaveLength(2)

    dispose()
  })
})
