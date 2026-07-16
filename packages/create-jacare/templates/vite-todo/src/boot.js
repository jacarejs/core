import { nav } from './nav.js'

if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}

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
