import './app.css'
import { nav } from './nav.js'
import { restoreSpaPath } from './app-base.js'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

restoreSpaPath()

if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}

let dispose = nav.attach(root)

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    dispose?.()
    dispose = null
  })
}
