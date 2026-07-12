import { signal } from '@jacare/core'
import { bindText } from '@jacare/core'
import { Window } from 'happy-dom'
import { pathToFileURL } from 'node:url'
import { measure } from './lib/stats.mjs'

const FANOUT = 64

const window = new Window()
const document = window.document

function runtimeFanout() {
  const count = signal(0)
  const nodes = []
  const disposes = []
  for (let i = 0; i < FANOUT; i++) {
    const text = document.createTextNode('')
    document.body.appendChild(text)
    nodes.push(text)
    disposes.push(bindText(text, count))
  }
  let n = 0
  const stats = measure(() => {
    count.set(++n)
  })
  for (const dispose of disposes) dispose()
  document.body.textContent = ''
  return stats
}

function cpwFanout() {
  const count = signal(0)
  const nodes = []
  const disposes = []
  for (let i = 0; i < FANOUT; i++) {
    const text = document.createTextNode('')
    document.body.appendChild(text)
    nodes.push(text)
    let cache = count.peek
    text.data = String(cache)
    disposes.push(
      count.subscribe(() => {
        const next = count.peek
        if (Object.is(next, cache)) return
        cache = next
        text.data = String(next)
      }),
    )
  }
  let n = 0
  const stats = measure(() => {
    count.set(++n)
  })
  for (const dispose of disposes) dispose()
  document.body.textContent = ''
  return stats
}

export function runPulseFanout() {
  const runtime = runtimeFanout()
  const cpw = cpwFanout()
  return {
    name: 'pulse-fanout',
    description: `1 signal → ${FANOUT} text nodes`,
    fanout: FANOUT,
    runtime,
    cpw,
    speedupCpwVsRuntime: runtime.p95 / cpw.p95,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runPulseFanout(), null, 2))
}
