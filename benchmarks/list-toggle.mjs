import { signal, reconcileKeyedList, bindText } from '@jacare/core'
import { pathToFileURL } from 'node:url'
import { installDom } from './lib/dom.mjs'
import { measure } from './lib/stats.mjs'

const ITEM_COUNT = 1000
const TOGGLE_INDEX = 500

installDom()

function makeItems(onAt = -1) {
  const items = []
  for (let i = 0; i < ITEM_COUNT; i++) {
    items.push({ id: i, on: i === onAt })
  }
  return items
}

function mountList() {
  const items = signal(makeItems())
  const root = document.createElement('ul')
  document.body.appendChild(root)

  const dispose = reconcileKeyedList({
    parent: root,
    items: () => items(),
    getKey: (item) => item.id,
    render: (item, _index, mount) => {
      const li = document.createElement('li')
      const text = document.createTextNode('')
      li.appendChild(text)
      const flag = signal(item.on ? 'on' : 'off')
      const unbind = bindText(text, flag)
      mount(li)
      return () => {
        unbind()
        flag.set('off')
      }
    },
  })

  return { items, root, dispose }
}

function toggleOne(items) {
  items.update((list) => {
    const next = list.slice()
    const current = next[TOGGLE_INDEX]
    next[TOGGLE_INDEX] = { id: current.id, on: !current.on }
    return next
  })
}

export function runListToggle() {
  const { items, root, dispose } = mountList()
  let on = false
  const stats = measure(
    () => {
      on = !on
      toggleOne(items)
    },
    { iterations: 500, warmup: 50 },
  )
  dispose()
  root.remove()
  document.body.textContent = ''
  return {
    name: 'list-toggle',
    description: `${ITEM_COUNT} keyed items, toggle 1 field`,
    itemCount: ITEM_COUNT,
    p95: stats.p95,
    mean: stats.mean,
    min: stats.min,
    max: stats.max,
    stats,
    targetP95Ms: 8,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runListToggle(), null, 2))
}
