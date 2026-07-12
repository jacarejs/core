import { effect, signal } from '@jacare/core'
import { bindText } from '@jacare/core'
import { Window } from 'happy-dom'
import { pathToFileURL } from 'node:url'
import { measure } from './lib/stats.mjs'

const window = new Window()
const document = window.document

function runtimeBinding() {
  const count = signal(0)
  const text = document.createTextNode('')
  document.body.appendChild(text)
  const dispose = bindText(text, count)
  let n = 0
  const stats = measure(() => {
    count.set(++n)
  })
  dispose()
  document.body.textContent = ''
  return stats
}

function cpwBinding() {
  const count = signal(0)
  const text = document.createTextNode('')
  document.body.appendChild(text)
  let cache = count.peek
  text.data = String(cache)
  const dispose = count.subscribe(() => {
    const next = count.peek
    if (Object.is(next, cache)) return
    cache = next
    text.data = String(next)
  })
  let n = 0
  const stats = measure(() => {
    count.set(++n)
  })
  dispose()
  document.body.textContent = ''
  return stats
}

function effectBinding() {
  const count = signal(0)
  const text = document.createTextNode('')
  document.body.appendChild(text)
  const dispose = effect(() => {
    text.data = String(count())
  }).dispose
  let n = 0
  const stats = measure(() => {
    count.set(++n)
  })
  dispose()
  document.body.textContent = ''
  return stats
}

export function runPulseUpdate() {
  const runtime = runtimeBinding()
  const cpw = cpwBinding()
  const effectPath = effectBinding()
  return {
    name: 'pulse-update',
    description: '1 signal → 1 text node update',
    runtime,
    cpw,
    effect: effectPath,
    speedupCpwVsRuntime: runtime.p95 / cpw.p95,
    speedupCpwVsEffect: effectPath.p95 / cpw.p95,
    targetP95Ms: 0.15,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(runPulseUpdate(), null, 2))
}
