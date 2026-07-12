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
      return { files: { ...shared, ...minimalFiles(name) }, assets: logoAsset() }
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
    <meta name="description" content="Jacaré starter — reactive UI with fine-grained signals" />
    <title>${name}</title>
    <link rel="icon" href="/jacare-logo.png" type="image/png" />
    <style>
      :root {
        --j-deep: #001818;
        --j-forest: #003030;
        --j-primary: #189030;
        --j-leaf: #30a830;
        --j-bright: #60a818;
        --j-lime: #78c018;
        --j-mint: #d8f3dc;
        --j-surface: #f4fbf6;
        --j-surface-2: #ffffff;
        --j-border: #b8e0c4;
        --j-text: #001818;
        --j-muted: #3d6b52;
        --j-radius: 12px;
        --j-shadow: 0 12px 40px rgba(0, 24, 24, 0.12);
        --font: system-ui, -apple-system, 'Segoe UI', sans-serif;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: var(--font);
        font-size: 16px;
        line-height: 1.55;
        color: var(--j-text);
        background:
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(120, 192, 24, 0.18), transparent),
          linear-gradient(180deg, var(--j-surface) 0%, #eef8f0 100%);
        -webkit-font-smoothing: antialiased;
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
    'src/app.jcr': `import { signal, computed } from '@jacare/core'

const count = signal(0)
const label = computed(() => count())
const mood = computed(() => {
  const value = count()
  if (value === 0) return 'Tap +1 to start'
  if (value < 5) return 'Warming up'
  if (value < 12) return 'Signals are live'
  return 'Jacaré scales'
})

function increment() {
  count.update((n) => n + 1)
}

function decrement() {
  count.update((n) => Math.max(0, n - 1))
}

function reset() {
  count.set(0)
}

export <view>
  <div class="page">
    <header class="header">
      <img class="logo" src="/jacare-logo.png" alt="Jacaré" />
      <div class="brand">
        <h1 class="title">${name}</h1>
        <p class="subtitle">Reactive UI without the virtual DOM tax</p>
      </div>
    </header>

    <section class="card counter-card">
      <p class="eyebrow">Live signal</p>
      <p class="count">\${label}</p>
      <p class="hint">\${mood}</p>
      <div class="actions">
        <button class="btn btn-ghost" type="button" on-click=\${decrement}>−1</button>
        <button class="btn btn-primary" type="button" on-click=\${increment}>+1</button>
        <button class="btn btn-ghost" type="button" on-click=\${reset}>Reset</button>
      </div>
    </section>

    <footer class="footer">
      <a class="footer-link" href="https://github.com/jacarejs/core" target="_blank" rel="noreferrer">Docs</a>
      <a class="footer-link" href="https://marketplace.visualstudio.com/items?itemName=heberalmeida.jacare" target="_blank" rel="noreferrer">VS Code extension</a>
      <a class="footer-link" href="https://jacarejs.github.io/core/showcase/" target="_blank" rel="noreferrer">Showcase</a>
    </footer>
  </div>
</view>

export <style>
.page {
  max-width: 34rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 3rem;
  display: grid;
  gap: 1.5rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--j-border);
  border-radius: calc(var(--j-radius) + 4px);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: var(--j-shadow);
}

.logo {
  width: 4.5rem;
  height: auto;
  flex-shrink: 0;
}

.brand { display: grid; gap: 0.2rem; }

.title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--j-forest);
}

.subtitle {
  margin: 0;
  font-size: 0.92rem;
  color: var(--j-muted);
}

.card {
  border: 1px solid var(--j-border);
  border-radius: calc(var(--j-radius) + 6px);
  background: var(--j-surface-2);
  box-shadow: var(--j-shadow);
}

.counter-card {
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  display: grid;
  gap: 0.65rem;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--j-leaf);
}

.count {
  margin: 0;
  font-size: clamp(3.5rem, 16vw, 5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--j-deep);
}

.hint {
  margin: 0;
  color: var(--j-muted);
  font-size: 0.95rem;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.75rem;
}

.btn {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.65rem 1.2rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}

.btn:hover { transform: translateY(-1px); }

.btn-primary {
  background: linear-gradient(135deg, var(--j-primary), var(--j-bright));
  color: #fff;
  box-shadow: 0 8px 24px rgba(24, 144, 48, 0.28);
}

.btn-primary:hover {
  box-shadow: 0 10px 28px rgba(24, 144, 48, 0.34);
}

.btn-ghost {
  background: var(--j-surface);
  border-color: var(--j-border);
  color: var(--j-forest);
}

.footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
}

.footer-link {
  color: var(--j-forest);
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--j-primary);
  text-decoration: underline;
}
</style>
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
