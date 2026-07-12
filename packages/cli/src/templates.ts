import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cliRoot = dirname(fileURLToPath(import.meta.url))

export type ScaffoldTemplate =
  | 'minimal'
  | 'nav'
  | 'todo'
  | 'vite-minimal'
  | 'vite-nav'
  | 'vite-todo'

export const VITE_SCAFFOLD_TEMPLATES = ['vite-minimal', 'vite-nav', 'vite-todo'] as const

export function isViteScaffoldTemplate(template: ScaffoldTemplate): boolean {
  return VITE_SCAFFOLD_TEMPLATES.includes(template as (typeof VITE_SCAFFOLD_TEMPLATES)[number])
}

export interface ScaffoldPlan {
  files: Record<string, string>
  assets: Array<{ name: string; src: string }>
}

export function buildScaffold(
  name: string,
  template: ScaffoldTemplate,
  version: string,
): ScaffoldPlan {
  const shared = sharedFiles(name, version, template)
  switch (template) {
    case 'nav':
      return { files: { ...shared, ...navFiles(name) }, assets: logoAsset() }
    case 'todo':
      return { files: { ...shared, ...todoFiles(name) }, assets: logoAsset() }
    default:
      return { files: { ...shared, ...minimalFiles(name) }, assets: [] }
  }
}

export function copyScaffoldAssets(targetDir: string, assets: ScaffoldPlan['assets']): void {
  for (const asset of assets) {
    if (!existsSync(asset.src)) continue
    copyFileSync(asset.src, join(targetDir, 'public', asset.name))
  }
}

function logoAsset(): ScaffoldPlan['assets'] {
  return [{ name: 'jacare-logo.png', src: join(cliRoot, '../assets/jacare-logo.png') }]
}

function sharedFiles(
  name: string,
  version: string,
  template: ScaffoldTemplate,
): Record<string, string> {
  const withDevtools = template === 'todo'
  return {
    'package.json': JSON.stringify(
      {
        name,
        private: true,
        license: 'MIT',
        type: 'module',
        scripts: {
          dev: 'node ./node_modules/@jacare/cli/dist/index.js dev',
          build: 'node ./node_modules/@jacare/cli/dist/index.js build',
          check: 'node ./node_modules/@jacare/cli/dist/index.js check',
        },
        dependencies: {
          '@jacare/core': version,
        },
        devDependencies: {
          '@jacare/cli': version,
          ...(withDevtools ? { '@jacare/devtools': version } : {}),
        },
      },
      null,
      2,
    ),
    'jacare.config.js': `export default {
  title: '${name}',
  port: 3000,
}
`,
    'jacare.d.ts': `declare module '*.jcr' {
  export function mount(target: HTMLElement, props?: Record<string, unknown>): () => void
  export function render(props?: Record<string, unknown>): { html: string; state: unknown }
  export function resume(target: HTMLElement, state: unknown): () => void
  const _default: typeof mount
  export default _default
}
`,
    'README.md': `# ${name}

Jacaré app (${template} template).

\`\`\`bash
yarn install
yarn dev
yarn check
\`\`\`
`,
  }
}

function minimalFiles(name: string): Record<string, string> {
  return {
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0a0a0a;
        color: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/boot.js"></script>
  </body>
</html>
`,
    'src/boot.js': bootMinimal(),
    'src/app.jcr': `import { signal, computed, view } from '@jacare/core'

const count = signal(0)
const label = computed(() => \`Count: \${count()}\`)

function add() {
  count.update((n) => n + 1)
}

export default view\`
  <main>
    <p>\${label}</p>
    <button on-click=\${add}>+1</button>
  </main>
\`
`,
  }
}

function navFiles(name: string): Record<string, string> {
  return {
    'index.html': lightIndexHtml(name),
    'src/boot.js': bootNav(),
    'src/nav.js': `import { createNav, lazy } from '@jacare/core'
import Shell from './shell.jcr'
import Home from './pages/home.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': Home,
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  missing: NotFound,
})

nav.warm('/about')
`,
    'src/shell.jcr': `import { view } from '@jacare/core'

export default view\`
  <div class="app">
    <header class="header">
      <div class="brand">
        <img class="logo" src="/jacare-logo.png" alt="Jacaré" />
        <span class="title">${name}</span>
      </div>
      <nav class="nav">
        <a class="nav-link" jacare-go="/" href="/">Home</a>
        <a class="nav-link" jacare-go="/about" href="/about">About</a>
      </nav>
    </header>
    <main class="main" jacare-frame></main>
  </div>
\`
`,
    'src/pages/home.jcr': `import { view } from '@jacare/core'

export default view\`
  <section class="page">
    <h2 class="page-title">Home</h2>
    <p class="lead">Jacaré nav with layout, lazy screens, and warm preload.</p>
  </section>
\`
`,
    'src/pages/about.jcr': `import { view } from '@jacare/core'

export default view\`
  <section class="page">
    <h2 class="page-title">About</h2>
    <p class="lead">This screen was lazy-loaded.</p>
  </section>
\`
`,
    'src/pages/not-found.jcr': `import { view } from '@jacare/core'

export default view\`
  <section class="page">
    <h2 class="page-title">404</h2>
    <p class="lead">Screen not found.</p>
    <a class="nav-link" jacare-go="/" href="/">Back home</a>
  </section>
\`
`,
  }
}

function todoFiles(name: string): Record<string, string> {
  return {
    'index.html': loadTodoIndexHtml(name),
    'src/boot.js': bootTodo(),
    'src/nav.js': `import { createNav, lazy } from '@jacare/core'
import Shell from './shell.jcr'
import Tasks from './pages/tasks.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': Tasks,
    '/about': lazy(() => import('./pages/about.jcr')),
  },
  missing: NotFound,
})

nav.warm('/about')
`,
    'src/shell.jcr': `import { view } from '@jacare/core'

export default view\`
  <div class="app">
    <div class="layout">
      <header class="header">
        <div class="brand">
          <img class="logo" src="/jacare-logo.png" alt="Jacaré" />
          <span class="title">${name}</span>
        </div>
        <nav class="nav">
          <a class="nav-link" jacare-go="/" href="/">Tasks</a>
          <a class="nav-link" jacare-go="/about" href="/about">About</a>
        </nav>
      </header>
      <main class="main" jacare-frame></main>
    </div>
  </div>
\`
`,
    'src/pages/tasks.jcr': `import { signal, computed, view } from '@jacare/core'

const items = signal([
  { id: '1', label: 'Learn Jacaré syntax', done: false },
  { id: '2', label: 'Build something fast', done: false },
])

const draft = signal('')

function addItem() {
  const label = draft().trim()
  if (!label) return
  items.update((list) => [...list, { id: String(Date.now()), label, done: false }])
  draft.set('')
}

function toggleItem(id) {
  items.update((list) =>
    list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
  )
}

function removeItem(id) {
  items.update((list) => list.filter((item) => item.id !== id))
}

export default view\`
  <section class="page">
    <div class="add-row">
      <input
        type="text"
        class="input add-input"
        placeholder="What needs to be done?"
        bind-value=\${draft}
      />
      <button class="btn btn-primary" on-click=\${addItem}>Add</button>
    </div>

    <ul class="list">
      #for items() as item (item.id)
        <li class-done=\${item.done}>
          <button class="check" on-click=\${() => toggleItem(item.id)}></button>
          <span class="label">\${item.label}</span>
          <button class="remove" on-click=\${() => removeItem(item.id)}>×</button>
        </li>
      #end
    </ul>
  </section>
\`
`,
    'src/pages/about.jcr': `import { view } from '@jacare/core'

export default view\`
  <section class="page about">
    <h2 class="page-title">About Jacaré</h2>
    <p class="lead">Fine-grained reactivity with direct DOM updates.</p>
  </section>
\`
`,
    'src/pages/not-found.jcr': `import { view } from '@jacare/core'

export default view\`
  <section class="page missing">
    <h2 class="page-title">404</h2>
    <p class="lead">This screen does not exist.</p>
    <a class="btn btn-primary" jacare-go="/" href="/">Back to tasks</a>
  </section>
\`
`,
  }
}

function bootMinimal(): string {
  return `import App from './app.jcr'

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
`
}

function bootNav(): string {
  return `import { nav } from './nav.js'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

let dispose = nav.attach(root)

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    dispose?.()
    dispose = nav.attach(root)
  })
  import.meta.hot.dispose(() => dispose?.())
}
`
}

function bootTodo(): string {
  return `import { nav } from './nav.js'

if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools()
}

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

let dispose = nav.attach(root)

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    dispose?.()
    dispose = nav.attach(root)
  })
  import.meta.hot.dispose(() => dispose?.())
}
`
}

function loadTodoIndexHtml(title: string): string {
  const examplePath = join(cliRoot, '../../../examples/jacare-todo/index.html')
  if (existsSync(examplePath)) {
    return readFileSync(examplePath, 'utf-8')
      .replaceAll('Jacaré Tasks', title)
      .replace('<title>Jacaré Tasks</title>', `<title>${title}</title>`)
  }
  return lightIndexHtml(title)
}

function lightIndexHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="icon" href="/jacare-logo.png" type="image/png" />
    <style>
      :root {
        --bg: #f4f4f5;
        --surface: #ffffff;
        --border: #e4e4e7;
        --text: #18181b;
        --text-muted: #71717a;
        --accent: #2563eb;
        --accent-soft: #eff6ff;
        --radius: 8px;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, sans-serif;
        color: var(--text);
        background: var(--bg);
      }
      .app { min-height: 100vh; padding: 2rem 1rem; }
      .layout { max-width: 36rem; margin: 0 auto; }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }
      .brand { display: flex; align-items: center; gap: 0.65rem; }
      .logo { height: 3rem; width: auto; }
      .title { font-size: 1.25rem; font-weight: 600; }
      .nav { display: flex; gap: 0.25rem; }
      .nav-link {
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius);
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.875rem;
      }
      .nav-link.jacare-here { color: var(--accent); background: var(--accent-soft); }
      .main { min-height: 16rem; }
      .page { display: grid; gap: 1rem; }
      .page-title { margin: 0; font-size: 1.125rem; }
      .lead { margin: 0; color: var(--text-muted); }
      .add-row { display: flex; gap: 0.5rem; }
      .input {
        flex: 1;
        padding: 0.6rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
      }
      .btn {
        border: none;
        border-radius: var(--radius);
        padding: 0.6rem 1rem;
        cursor: pointer;
      }
      .btn-primary { background: var(--accent); color: white; }
      .list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
      .list li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
      }
      .list li.class-done .label { text-decoration: line-through; color: var(--text-muted); }
      .label { flex: 1; }
      .check, .remove { border: none; background: transparent; cursor: pointer; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/boot.js"></script>
  </body>
</html>
`
}
