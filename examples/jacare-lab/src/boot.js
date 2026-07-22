import './app.css'
import { nav } from './nav.js'
import { restoreSpaPath } from './app-base.js'
import { syncDevtools } from './lab-devtools.js'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

restoreSpaPath()

let dispose = null

async function boot() {
  await syncDevtools()
  dispose = nav.attach(root)
}

void boot()

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    dispose?.()
    dispose = null
  })
}
