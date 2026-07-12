import App from './app.jcr'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

let dispose = App(root)

if (import.meta.hot) {
  import.meta.hot.accept('./app.jcr', (mod) => {
    dispose()
    dispose = (mod?.default ?? mod.mount)(root)
  })
  import.meta.hot.dispose(() => dispose())
}
