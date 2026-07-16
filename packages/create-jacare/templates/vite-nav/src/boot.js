import { nav } from './nav.js'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

let dispose = nav.attach(root)

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    dispose?.()
    dispose = null
  })
}
