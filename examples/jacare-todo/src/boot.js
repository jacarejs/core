import { nav } from './nav.js'
import { restoreSpaPath } from './app-base.js'

if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

restoreSpaPath()

let dispose = nav.attach(root)

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    dispose?.()
    dispose = null
  })
}
