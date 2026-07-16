import { viewSnippet } from '../utils/snippet.js'

export const scaffoldCode = `npm install -g @jacare/cli
jacare new my-app
cd my-app && npm install && jacare dev

# or with create-jacare
npm create jacare@latest my-app
cd my-app && npm install && npm run dev

# or from the Jacaré monorepo
yarn jacare new demo
cd demo && yarn dev`

export const appJcrCode = viewSnippet(
  `import { signal } from '@jacare/core'

const count = signal(0)

function increment() {
  count.update((n) => n + 1)
}`,
  `  <div class="counter">
    <p>\${count}</p>
    <button on-click=\${increment}>+1</button>
  </div>`,
)

export const bootJsCode = `import mount from './app.jcr'

const root = document.getElementById('app')
const dispose = mount(root)

if (import.meta.hot) {
  import.meta.hot.dispose(() => dispose?.())
}`

export const htmlShellCode = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/boot.js"></script>
  </body>
</html>`
