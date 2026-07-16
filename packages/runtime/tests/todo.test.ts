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

const FOR_IN_IF = `import { pulse, view } from '@jacare/core'

const show = pulse(true)
const items = pulse([
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
])

export default view\`
  #if show()
    #for items() as item (item.id)
      <li>\${item.label}</li>
    #end
  #end
\``

function loadForInIf(source: string) {
  const { code } = compile(source)
  const body = code
    .replace(/^import[^\n]*\n/, '')
    .replace(/^export default mount\s*/m, '')
    .replace(/^export /gm, '')
  return new Function(
    'runtime',
    `const { signal, computed, pulse, derive, effect, bindText, bindAttribute, bindModel, bindClass, showIf, branch, reconcileKeyedList, resumeBindings } = runtime
${body}
return { mount, show, items }`,
  )(runtime) as {
    mount: (target: HTMLElement) => () => void
    show: { set: (value: boolean) => void }
    items: {
      set: (list: { id: string; label: string }[]) => void
      update: (fn: (list: { id: string; label: string }[]) => { id: string; label: string }[]) => void
    }
  }
}

describe('#for nested in #if', () => {
  it('mounts, updates, and toggles without ReferenceError', async () => {
    const { mount, show, items } = loadForInIf(FOR_IN_IF)
    const root = document.createElement('div')
    const dispose = mount(root)

    expect([...root.querySelectorAll('li')].map((el) => el.textContent)).toEqual(['Alpha', 'Beta'])

    items.set([
      { id: 'b', label: 'Beta' },
      { id: 'a', label: 'Alpha' },
      { id: 'c', label: 'Gamma' },
    ])
    await Promise.resolve()
    expect([...root.querySelectorAll('li')].map((el) => el.textContent)).toEqual([
      'Beta',
      'Alpha',
      'Gamma',
    ])

    show.set(false)
    await Promise.resolve()
    expect(root.querySelectorAll('li')).toHaveLength(0)

    show.set(true)
    await Promise.resolve()
    expect([...root.querySelectorAll('li')].map((el) => el.textContent)).toEqual([
      'Beta',
      'Alpha',
      'Gamma',
    ])

    dispose()
  })
})

const REACTIVITY_DEMO = `import { pulse, derive, view } from '@jacare/core'

const demoCount = pulse(0)
const demoDoubled = derive(() => demoCount() * 2)

export default view\`
  <p class="playground-output">doubled = \${demoDoubled}</p>
\``

describe('reactivity demo', () => {
  it('renders derived values in mixed text', async () => {
    const { code } = compile(REACTIVITY_DEMO)
    const body = code
      .replace(/^import[^\n]*\n/gm, '')
      .replace(/^export default mount\s*/m, '')
      .replace(/^export /gm, '')
    const mod = new Function(
      'runtime',
      `const { signal, computed, pulse, derive, effect, bindText, resumeBindings } = runtime
${body}
return { mount, demoCount }`,
    )(runtime) as {
      mount: (target: HTMLElement) => () => void
      demoCount: { update: (fn: (n: number) => number) => void }
    }

    const root = document.createElement('div')
    const dispose = mod.mount(root)
    const output = root.querySelector('.playground-output')

    expect(output?.textContent).toBe('doubled = 0')

    mod.demoCount.update((n) => n + 1)
    await Promise.resolve()
    expect(output?.textContent).toBe('doubled = 2')

    dispose()
  })
})
