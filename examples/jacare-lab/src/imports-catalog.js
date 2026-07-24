/** Import catalog for Lab /helpers — mirrors docs/api.md §20 (simple English examples). */

export const IMPORT_CATALOG = [
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'pulse',
    importLine: "import { pulse } from '@jacare/core'",
    usage: 'Create reactive state. Call to read, .set / .update to write.',
    example: `import { pulse } from '@jacare/core'

const count = pulse(0)
count()           // → 0
count.set(1)      // → 1
count.update(n => n + 1)  // → 2`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'signal',
    importLine: "import { signal } from '@jacare/core'",
    usage: 'Alias of pulse — same API.',
    example: `import { signal } from '@jacare/core'

const open = signal(false)
open()
open.set(true)`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'derive',
    importLine: "import { derive } from '@jacare/core'",
    usage: 'Computed value that updates when dependencies change.',
    example: `import { pulse, derive } from '@jacare/core'

const n = pulse(2)
const doubled = derive(() => n() * 2)
doubled()  // → 4`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'computed',
    importLine: "import { computed } from '@jacare/core'",
    usage: 'Alias of derive.',
    example: `import { pulse, computed } from '@jacare/core'

const price = pulse(10)
const tax = computed(() => price() * 0.1)`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'effect',
    importLine: "import { effect } from '@jacare/core'",
    usage: 'Run side effects when pulses change. Call .dispose() to stop.',
    example: `import { pulse, effect } from '@jacare/core'

const n = pulse(0)
const { dispose } = effect(() => {
  console.log('n is', n())
})
// later: dispose()`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'watch',
    importLine: "import { watch } from '@jacare/core'",
    usage: 'Alias of effect.',
    example: `import { pulse, watch } from '@jacare/core'

const title = pulse('Hi')
watch(() => {
  document.title = title()
})`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'batch',
    importLine: "import { batch } from '@jacare/core'",
    usage: 'Group writes so effects run once after all updates.',
    example: `import { pulse, batch, effect } from '@jacare/core'

const a = pulse(0)
const b = pulse(0)
effect(() => console.log(a() + b()))

batch(() => {
  a.set(1)
  b.set(2)
})  // effect runs once → 3`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'untrack',
    importLine: "import { untrack } from '@jacare/core'",
    usage: 'Read pulses without subscribing the current effect.',
    example: `import { pulse, effect, untrack } from '@jacare/core'

const a = pulse(1)
const b = pulse(2)
effect(() => {
  console.log(a(), untrack(() => b()))
  // only a() triggers re-runs
})`,
    path: '/reactivity',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'createBag',
    importLine: "import { createBag, pulse } from '@jacare/core'",
    usage: 'Register a shared bag of pulses (Mesh).',
    example: `import { createBag, pulse } from '@jacare/core'

export const cart = createBag('cart', () => ({
  count: pulse(0),
  total: pulse(0),
}))

cart.count.set(3)`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'getBag',
    importLine: "import { getBag } from '@jacare/core'",
    usage: 'Look up a bag by id from anywhere.',
    example: `import { getBag } from '@jacare/core'

const cart = getBag('cart')
cart?.count()  // → current count`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'listBags',
    importLine: "import { listBags } from '@jacare/core'",
    usage: 'List registered bag ids.',
    example: `import { listBags } from '@jacare/core'

listBags()  // → ['cart', 'theme', …]`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'ripple',
    importLine: "import { ripple } from '@jacare/core'",
    usage: 'React when a bag port (or pulse) changes.',
    example: `import { ripple } from '@jacare/core'
import { cart } from './bags.js'

ripple(cart.total, () => {
  console.log('total changed', cart.total())
})`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'bag.snap / hydrate / reset',
    importLine: '(methods on a bag instance)',
    usage: 'Persist, restore, or reset bag ports.',
    example: `const data = cart.snap()
localStorage.setItem('cart', JSON.stringify(data))

cart.hydrate(JSON.parse(localStorage.getItem('cart')))
cart.reset()`,
    path: '/bag',
  },
  {
    pkg: '.jcr template',
    group: 'Pulse bags',
    name: '${@bag/key}',
    importLine: '(Mesh address in templates)',
    usage: 'Read a bag port directly in the view.',
    example: `<span>Items: \${@cart/count}</span>
<button on-click=\${() => cart.count.update(n => n + 1)}>
  Add
</button>`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'DOM (emitted)',
    name: 'bindText',
    importLine: 'Emitted from ${expr} text',
    usage: 'You write ${count}; compiler emits bindText.',
    example: `<!-- .jcr -->
<span>\${count}</span>

<!-- roughly emitted -->
bindText(node, () => count())`,
    path: '/bindings',
  },
  {
    pkg: '@jacare/core',
    group: 'DOM (emitted)',
    name: 'bindAttribute',
    importLine: 'Emitted from :attr=${expr}',
    usage: 'Dynamic HTML attributes.',
    example: `<!-- .jcr -->
<a :href=\${url} :title=\${label}>Open</a>`,
    path: '/bindings',
  },
  {
    pkg: '@jacare/core',
    group: 'DOM (emitted)',
    name: 'bindClass',
    importLine: 'Emitted from class-name=${bool}',
    usage: 'Toggle a CSS class from a boolean.',
    example: `<!-- .jcr -->
<div class-open=\${open} class-busy=\${loading}>…</div>`,
    path: '/bindings',
  },
  {
    pkg: '@jacare/core',
    group: 'DOM (emitted)',
    name: 'bindStyleVar',
    importLine: 'Emitted from style---name=${expr}',
    usage: 'Set a CSS custom property.',
    example: `<!-- .jcr -->
<div style---pct=\${pct}>…</div>
/* CSS: width: calc(var(--pct) * 1%) */`,
    path: '/bindings',
  },
  {
    pkg: '@jacare/core',
    group: 'DOM (emitted)',
    name: 'bindModel',
    importLine: 'Emitted from bind-value / bind-checked',
    usage: 'Two-way input binding.',
    example: `<!-- .jcr -->
<input bind-value=\${name} />
<input type="checkbox" bind-checked=\${ok} />`,
    path: '/bindings',
  },
  {
    pkg: '@jacare/core',
    group: 'Control flow (emitted)',
    name: 'branch / showIf',
    importLine: 'Emitted from #if / #case',
    usage: 'Conditional blocks in templates.',
    example: `#if loading()
  <p>Loading…</p>
#elif error()
  <p>Error</p>
#else
  <p>Ready</p>
#end`,
    path: '/if',
  },
  {
    pkg: '@jacare/core',
    group: 'Control flow (emitted)',
    name: 'reconcileKeyedList',
    importLine: 'Emitted from #for',
    usage: 'Keyed list reconciliation.',
    example: `#for items() as item (item.id)
  <li>\${item.name}</li>
#end`,
    path: '/for',
  },
  {
    pkg: '@jacare/core',
    group: 'Slots (emitted)',
    name: 'mountSlot',
    importLine: 'Emitted from <slot>',
    usage: 'Default and named slots.',
    example: `<!-- parent -->
<Card>
  <slot name="title">Hello</slot>
  <p>Body</p>
</Card>

<!-- Card.jcr -->
<header><slot name="title" /></header>
<slot />`,
    path: '/components',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'createNav',
    importLine: "import { createNav } from '@jacare/core'",
    usage: 'Create the app router.',
    example: `import { createNav, lazy, screen } from '@jacare/core'
import Shell from './Shell.jcr'
import Home from './Home.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': { use: screen(Home), title: 'Home' },
    '/about': { use: lazy(() => import('./About.jcr')), title: 'About' },
  },
})`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'lazy',
    importLine: "import { lazy } from '@jacare/core'",
    usage: 'Lazy-load a screen module.',
    example: `lazy(() => import('./About.jcr'))`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'screen',
    importLine: "import { screen } from '@jacare/core'",
    usage: 'Wrap an eagerly imported screen.',
    example: `import Home from './Home.jcr'
screen(Home)`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'nav.attach / go / swap / undo / warm',
    importLine: '(methods on createNav() instance)',
    usage: 'Mount, navigate, preload.',
    example: `nav.attach(document.getElementById('app'))
nav.go('/about')
nav.warm('/cart')   // preload
nav.undo()          // back`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'createRoute',
    importLine: "import { createRoute } from '@jacare/core'",
    usage: 'Typed helpers around nav.where.',
    example: `import { createRoute } from '@jacare/core'
import { nav } from './nav.js'

export const route = createRoute(nav.where)`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'routeParam',
    importLine: "import { routeParam } from '@jacare/core'",
    usage: 'Read a path param as a pulse-like getter.',
    example: `import { routeParam } from '@jacare/core'
import { route } from './route.js'

const id = routeParam(route, 'id')
id()  // → '42' when path is /item/42`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'routeSearch',
    importLine: "import { routeSearch } from '@jacare/core'",
    usage: 'Read a query string value.',
    example: `import { routeSearch } from '@jacare/core'
import { route } from './route.js'

const q = routeSearch(route, 'q')
q()  // → 'tea' when URL has ?q=tea`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'routeHref',
    importLine: "import { routeHref } from '@jacare/core'",
    usage: 'Build an href from path + params/search.',
    example: `import { routeHref } from '@jacare/core'

routeHref('/item/:id', { id: 7 })  // → '/item/7'`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'setNavTitle / getNavTitle',
    importLine: "import { setNavTitle, getNavTitle } from '@jacare/core'",
    usage: 'Update document.title at runtime.',
    example: `import { setNavTitle, getNavTitle, effect } from '@jacare/core'

effect(() => {
  setNavTitle(\`Cart · \${count()}\`)
})
getNavTitle()  // current title string`,
    path: '/lifecycle',
  },
  {
    pkg: '.jcr template',
    group: 'Navigation',
    name: 'jacare-frame / jacare-go / jacare-here',
    importLine: '(attributes in view)',
    usage: 'Outlet + SPA links + active match.',
    example: `<main jacare-frame></main>
<a jacare-go="/about" href="/about">About</a>
<a jacare-go="/shop" jacare-here class-active>Shop</a>`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Forms',
    name: 'createForm',
    importLine: "import { createForm } from '@jacare/core'",
    usage: 'Reactive form fields, validation, submit.',
    example: `import { createForm } from '@jacare/core'

const form = createForm({
  email: {
    value: '',
    validate: (v) => (v.includes('@') ? undefined : 'Invalid email'),
  },
})

<form on-submit=\${form.handleSubmit((values) => console.log(values))}>
  <input bind-value=\${form.fields.email} />
  <span>\${form.fields.email.error()}</span>
</form>`,
    path: '/forms',
  },
  {
    pkg: '@jacare/core',
    group: 'Lifecycle',
    name: 'createLifecycle',
    importLine: "import { createLifecycle } from '@jacare/core'",
    usage: 'Screen mount / activate / deactivate hooks.',
    example: `import { createLifecycle } from '@jacare/core'

export const lifecycle = createLifecycle({
  onMount() { console.log('mounted') },
  onActivate() { console.log('visible') },
  onDeactivate() { console.log('hidden') },
  onUnmount() { console.log('gone') },
})`,
    path: '/lifecycle',
  },
  {
    pkg: '@jacare/core',
    group: 'Lifecycle',
    name: 'registerScope',
    importLine: "import { registerScope } from '@jacare/core'",
    usage: 'Expose a value in the DevTools Scope panel.',
    example: `import { createLifecycle, registerScope } from '@jacare/core'

export const lifecycle = createLifecycle({
  onActivate() {
    return registerScope('draft', 'Draft', () => draft())
  },
})`,
    path: '/lifecycle',
  },
  {
    pkg: '@jacare/core',
    group: 'SSR',
    name: 'renderToString',
    importLine: "import { renderToString } from '@jacare/core'",
    usage: 'SSR a page render() to one HTML string.',
    example: `import { renderToString } from '@jacare/core'
import { render } from './Page.jcr'

const html = renderToString(render, { title: 'Hi' })`,
    path: '/ssr',
  },
  {
    pkg: '@jacare/core',
    group: 'SSR',
    name: 'renderToStream',
    importLine: "import { renderToStream } from '@jacare/core'",
    usage: 'Stream SSR chunks (async iterable).',
    example: `import { renderToStream } from '@jacare/core'
import { render } from './Page.jcr'

for await (const chunk of renderToStream(render)) {
  res.write(chunk)
}`,
    path: '/ssr',
  },
  {
    pkg: '@jacare/core',
    group: 'SSR',
    name: 'resumeBindings',
    importLine: "import { resumeBindings } from '@jacare/core'",
    usage: 'Low-level: rebind data-jacare-bind nodes.',
    example: `import { resumeBindings } from '@jacare/core'

resumeBindings(rootEl, state)
// Prefer resume() from the .jcr module in apps.`,
    path: '/ssr',
  },
  {
    pkg: '@jacare/core',
    group: 'SSR',
    name: 'escapeHtml',
    importLine: "import { escapeHtml } from '@jacare/core'",
    usage: 'Escape text before injecting into SSR HTML.',
    example: `import { escapeHtml } from '@jacare/core'

escapeHtml('<script>')  // → '&lt;script&gt;'`,
    path: '/ssr',
  },
  {
    pkg: '.jcr module',
    group: 'SSR / client',
    name: 'mount',
    importLine: "import { mount } from './Page.jcr'",
    usage: 'Client: create DOM + bind. Returns dispose.',
    example: `import { mount } from './Counter.jcr'

const dispose = mount(document.getElementById('app'), { start: 0 })
// later: dispose()`,
    path: '/module',
  },
  {
    pkg: '.jcr module',
    group: 'SSR / client',
    name: 'render',
    importLine: "import { render } from './Page.jcr'",
    usage: 'SSR: return { html, state }.',
    example: `import { render } from './Page.jcr'

const { html, state } = render({ title: 'Hi' })`,
    path: '/ssr',
  },
  {
    pkg: '.jcr module',
    group: 'SSR / client',
    name: 'resume',
    importLine: "import { resume } from './Page.jcr'",
    usage: 'Hydrate existing SSR HTML.',
    example: `import { resume } from './Page.jcr'

resume(document.getElementById('app'), window.__STATE__)`,
    path: '/ssr',
  },
  {
    pkg: '@jacare/core',
    group: 'DevTools (core)',
    name: 'enableDevtools',
    importLine: "import { enableDevtools } from '@jacare/core'",
    usage: 'Turn on pulse graph collection.',
    example: `import { enableDevtools } from '@jacare/core'

enableDevtools()
// Prefer connectJacareDevtools from @jacare/devtools`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/core',
    group: 'DevTools (core)',
    name: 'namePulse',
    importLine: "import { namePulse } from '@jacare/core'",
    usage: 'Label a pulse in the graph.',
    example: `import { pulse, namePulse } from '@jacare/core'

const count = pulse(0)
namePulse(count, 'count')`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/core',
    group: 'DevTools (core)',
    name: 'getPulseGraph',
    importLine: "import { getPulseGraph } from '@jacare/core'",
    usage: 'Snapshot of the pulse graph.',
    example: `import { getPulseGraph } from '@jacare/core'

const graph = getPulseGraph()
console.log(graph.pulses)`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/devtools',
    group: 'DevTools UI',
    name: 'connectJacareDevtools',
    importLine: "import { connectJacareDevtools } from '@jacare/devtools'",
    usage: 'Mount the overlay UI. Returns dispose.',
    example: `import { connectJacareDevtools } from '@jacare/devtools'

const stop = connectJacareDevtools({
  position: 'bottom-right',
  scope: true,
  mesh: true,
})
// stop() removes the overlay`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/compiler',
    group: 'Compiler API',
    name: 'compile',
    importLine: "import { compile } from '@jacare/compiler'",
    usage: 'Compile .jcr source to JS (tooling / tests).',
    example: `import { compile } from '@jacare/compiler'

const { code } = compile(source, {
  filename: 'Page.jcr',
  mode: 'module',
})`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/compiler',
    group: 'Compiler API',
    name: 'parseModule / parseTemplate',
    importLine: "import { parseModule, parseTemplate } from '@jacare/compiler'",
    usage: 'Parse AST for tools.',
    example: `import { parseModule } from '@jacare/compiler'

const ast = parseModule(source, 'Page.jcr')`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/compiler',
    group: 'Compiler API',
    name: 'inspectTemplateBindings',
    importLine: "import { inspectTemplateBindings } from '@jacare/compiler'",
    usage: 'Binding IR sites (same as jacare check --bindings).',
    example: `import { inspectTemplateBindings } from '@jacare/compiler'

const sites = inspectTemplateBindings(source, 'Page.jcr')
console.log(sites)`,
    path: '/binding-ir',
  },
  {
    pkg: '@jacare/compiler',
    group: 'Compiler API',
    name: 'lowerMountAst',
    importLine: "import { lowerMountAst } from '@jacare/compiler'",
    usage: 'Lower template AST to MountPlan forest.',
    example: `import { parseTemplate, lowerMountAst } from '@jacare/compiler'

const ast = parseTemplate(viewSource)
const plan = lowerMountAst(ast)`,
    path: '/binding-ir',
  },
  {
    pkg: '@jacare/vite-plugin',
    group: 'Vite',
    name: 'jacare',
    importLine: "import jacare from '@jacare/vite-plugin'",
    usage: 'Vite plugin for .jcr transform + HMR.',
    example: `import { defineConfig } from 'vite'
import jacare from '@jacare/vite-plugin'

export default defineConfig({
  plugins: [jacare()],
})`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/vite-plugin',
    group: 'Vite',
    name: 'createJacareViteConfig',
    importLine: "import { createJacareViteConfig } from '@jacare/vite-plugin'",
    usage: 'Opinionated Vite config helper.',
    example: `import { createJacareViteConfig } from '@jacare/vite-plugin'

export default createJacareViteConfig({
  title: 'My App',
})`,
    path: '/tooling',
  },
  {
    pkg: '@jacare/meta',
    group: 'Meta / file routes',
    name: 'jacareMeta',
    importLine: "import { jacareMeta } from '@jacare/meta'",
    usage: 'Vite plugin for file-based routes.',
    example: `import { jacareMeta } from '@jacare/meta'

plugins: [jacareMeta({ pagesDir: 'src/pages' })]`,
    path: '/helpers',
  },
  {
    pkg: '@jacare/meta',
    group: 'Meta / file routes',
    name: 'discoverRoutes',
    importLine: "import { discoverRoutes } from '@jacare/meta'",
    usage: 'Map pages/** files to route paths.',
    example: `import { discoverRoutes } from '@jacare/meta'

const routes = discoverRoutes('src/pages')
// → [{ path: '/', file: '…' }, …]`,
    path: '/helpers',
  },
  {
    pkg: '@jacare/meta',
    group: 'Meta / file routes',
    name: 'createJacareApp',
    importLine: "import { createJacareApp } from '@jacare/meta'",
    usage: 'Bootstrap nav + screens from discovered routes.',
    example: `import { createJacareApp } from '@jacare/meta'

const app = createJacareApp({
  pagesDir: 'src/pages',
  layout: Shell,
})
app.attach(document.getElementById('app'))`,
    path: '/helpers',
  },
  {
    pkg: '@jacare/cli',
    group: 'CLI',
    name: 'jacare new / dev / build / check',
    importLine: '(CLI — not a JS import)',
    usage: 'Scaffold, develop, build, and inspect.',
    example: `npm create jacare@latest my-app
jacare new my-app --template=todo
jacare dev
jacare build
jacare check --bindings`,
    path: '/tooling',
  },
  {
    pkg: '.jcr syntax',
    group: 'Language',
    name: 'export <view>',
    importLine: '(required module block)',
    usage: 'The page or component template.',
    example: `import { pulse } from '@jacare/core'

const count = pulse(0)

export <view>
  <button on-click=\${() => count.update(n => n + 1)}>
    \${count}
  </button>
</view>`,
    path: '/language',
  },
  {
    pkg: '.jcr syntax',
    group: 'Language',
    name: 'export <style>',
    importLine: '(optional scoped CSS)',
    usage: 'CSS scoped to this module.',
    example: `export <style>
  button { color: green; }
</style>`,
    path: '/language',
  },
  {
    pkg: '.jcr syntax',
    group: 'Language',
    name: 'export <contract>',
    importLine: '(optional contract surface)',
    usage: 'Declare props / events for tooling.',
    example: `export <contract>
  props: { title: string }
</contract>`,
    path: '/language',
  },
  {
    pkg: '.jcr syntax',
    group: 'Language',
    name: 'on-* / @* events',
    importLine: '(template attributes)',
    usage: 'DOM events with automatic cleanup.',
    example: `<button on-click=\${() => count.update(n => n + 1)}>
  Click
</button>`,
    path: '/events',
  },
  {
    pkg: '.jcr syntax',
    group: 'Language',
    name: '<debug>',
    importLine: '(template tag — stripped in prod)',
    usage: 'Inline debug panel for selected values.',
    example: `<debug { count, cart } />`,
    path: '/debug',
  },
]
