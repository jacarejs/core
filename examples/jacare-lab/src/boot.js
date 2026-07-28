import './app.css'
import { effect } from '@jacare/core'
import { nav } from './nav.js'
import { restoreSpaPath } from './app-base.js'
import { syncDevtools, teardownDevtools } from './lab-devtools.js'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

restoreSpaPath()

let dispose = null
let stopScrollTop = null
let lastPath = null

async function boot() {
  await syncDevtools()
  dispose = nav.attach(root)
  stopScrollTop = effect(() => {
    const path = nav.where().path
    if (lastPath !== null && lastPath !== path) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
    lastPath = path
  }).dispose
}

void boot()

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    teardownDevtools()
    stopScrollTop?.()
    stopScrollTop = null
    dispose?.()
    dispose = null
  })
}
