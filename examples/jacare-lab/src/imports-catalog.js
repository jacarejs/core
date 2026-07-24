/** Import catalog for Lab /helpers — mirrors docs/api.md §20.
 *  Each entry: name, short usage, detailed English `about`, import line, example.
 */

export const IMPORT_CATALOG = [
  {
    pkg: '@jacare/core',
    group: 'Reactivity',
    name: 'pulse',
    importLine: "import { pulse } from '@jacare/core'",
    usage: 'Create reactive state. Call to read, .set / .update to write.',
    about:
      'pulse is Jacaré’s primary reactive cell (preferred name). Create one with an initial value, call it like a function to read, and write with .set(value) or .update(fn). Reads inside effects, derives, and template bindings subscribe automatically so only the dependent UI updates. Prefer pulse over signal in new Jacaré code.',
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
    about:
      'signal is the same runtime primitive as pulse — an alias for familiarity with other fine-grained libraries. Methods (.set, .update, .peek, .subscribe) and template use are identical. Prefer writing pulse in Jacaré apps so docs and Lab stay consistent.',
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
    about:
      'derive builds a cached computed value from other pulses or derives. The function re-runs only when a dependency it actually read has changed. Read it like a pulse: doubled(). Use it for labels, filters, totals, and any value you do not want to set by hand.',
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
    about:
      'computed is an alias of derive with the same lazy, cached dependency tracking. Prefer derive in new Jacaré code; keep computed only when matching external examples that use that name.',
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
    about:
      'effect runs a side-effect whenever its tracked pulses change (logging, document.title, fetch, imperative DOM). It may return a cleanup that runs before the next execution and on dispose(). Call dispose() when you created the effect yourself and the owner unmounts — compiled template bindings dispose for you.',
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
    about:
      'watch is an alias of effect. Prefer watch when the intent reads as “watch this state”; prefer effect when matching older examples. Same dispose and cleanup contract.',
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
    about:
      'batch groups multiple pulse writes so dependent effects and DOM updates flush once after the callback finishes. Use it when one user action updates several cells (form submit, cart count + total) to avoid intermediate flicker and extra work.',
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
    about:
      'untrack runs a function without registering pulse reads as dependencies of the current effect or derive. Use it to peek at values without re-running when they change, or to avoid accidental subscriptions. For a single cell, pulse.peek is often clearer.',
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
    about:
      'createBag registers a named shared store on the Pulse Mesh. The factory stays lazy until a property is first read. Export the bag from a module and reuse it across screens. Duplicate ids throw. Each published field becomes addressable as @id/key in templates.',
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
    about:
      'getBag looks up a bag by string id from anywhere (another module or a screen that did not import the bag). Returns undefined if missing. Reading a property on the handle still triggers lazy factory publish.',
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
    about:
      'listBags returns the ids of every bag registered in the page so far (including not-yet-published lazy bags). Useful for DevTools, debugging, and tests — rarely needed in app UI.',
    example: `import { listBags } from '@jacare/core'

listBags()  // → ['cart', 'theme', …]`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'ripple',
    importLine: "import { ripple } from '@jacare/core'",
    usage: 'Batch bag writes into one Mesh notification wave.',
    about:
      'ripple(fn) runs a function inside a batch and records which mesh cells changed so DevTools Mesh can show one notification wave. Signature is ripple(fn) — not ripple(port, fn). Wrap multi-field bag writes together.',
    example: `import { ripple } from '@jacare/core'
import { cart } from './bags.js'

ripple(() => {
  cart.count.set(1)
  cart.total.set(20)
})`,
    path: '/bag',
  },
  {
    pkg: '@jacare/core',
    group: 'Pulse bags',
    name: 'bag.snap / hydrate / reset',
    importLine: '(methods on a bag instance)',
    usage: 'Persist, restore, or reset bag ports.',
    about:
      'Methods on the bag handle from createBag. snap() copies writable pulse values to a plain object (e.g. localStorage). hydrate(data) writes those values back in one wave. reset() restores factory defaults while keeping the same cell identities so bindings stay alive.',
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
    about:
      'Mesh address syntax inside .jcr templates. ${@cart/count} reads the published port without importing the bag into the script (compiler emits getBag). Ideal for shared chrome such as a header cart badge. Prefer normal cart.count() in the module that owns the bag.',
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
    about:
      'Compiler-emitted helper that keeps a text node’s data in sync with a pulse or expression. You almost never import it — write ${count} or ${label()} in the view. Only that text node updates when the source changes.',
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
    about:
      'Emitted for :attr=${expr}. Updates or removes the attribute when the expression changes. Use for href, title, aria-*, and boolean attributes that should appear or disappear with state.',
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
    about:
      'Emitted for class-name=${bool} (for example class-open=${open}). Toggles a single CSS class via classList. Prefer this over rebuilding full className strings on every update.',
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
    about:
      'Emitted for style---name=${expr}, which maps to CSS custom properties (style---pct → --pct). Lets CSS drive layout from reactive numbers without large inline style objects.',
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
    about:
      'Emitted for bind-value and bind-checked. Keeps an input’s value or checked state aligned with a pulse and writes back on input/change. Prefer pulses or createForm fields as the source of truth.',
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
    about:
      'Runtime helpers behind #if / #elif / #else / #case. They mount one branch at a time and dispose the previous branch’s bindings when the condition changes. You write the directives; the compiler emits branch or showIf.',
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
    about:
      'Runtime behind #for list as item (key). Diffs by key: reuses existing item mounts, creates new keys, disposes removed keys, and reorders DOM nodes. Always pass a stable key (item.id), not the index, if the list can reorder.',
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
    about:
      'Runtime behind <slot> and named slots. Parent content is projected into the child component’s slot outlets. You write slot markup; the compiler emits mountSlot.',
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
    about:
      'Creates the SPA router: layout shell, screen table, missing page, optional beforeGo guard and base path. Returns nav with where (current place as a pulse), attach, go, swap, undo, and warm. One nav per app is typical.',
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
    about:
      'Marks a dynamic import as a lazy screen loader for createNav. The .jcr module loads on first visit (or after warm). Keeps the initial bundle small for multi-page apps.',
    example: `lazy(() => import('./About.jcr'))`,
    path: '/nav',
  },
  {
    pkg: '@jacare/core',
    group: 'Navigation',
    name: 'screen',
    importLine: "import { screen } from '@jacare/core'",
    usage: 'Wrap an eagerly imported screen.',
    about:
      'Wraps an already-imported screen module for eager use in createNav (for example the home page). Opposite of lazy — included in the parent chunk instead of loaded on demand.',
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
    about:
      'Instance methods after createNav. attach(el) mounts the layout and frame and listens to history. go(path) pushes a new history entry; swap replaces; undo goes back; warm(path) preloads a lazy screen without navigating.',
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
    usage: 'Helpers around nav.where.',
    about:
      'Builds a small helper object around nav.where so routeParam and routeSearch stay ergonomic. Export one route next to nav in larger apps.',
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
    usage: 'Read a path param as a reactive getter.',
    about:
      'Returns a getter for a path parameter (for example :id). Call id() in script or templates; it tracks navigation so the UI updates when the param changes.',
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
    about:
      'Same idea as routeParam for ?query= values. The getter is reactive to search changes on the current place.',
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
    about:
      'Pure helper that builds a path string from a pattern and params or search. Useful for jacare-go targets and tests. It does not navigate by itself.',
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
    about:
      'setNavTitle updates document.title (and nav title plumbing). getNavTitle reads the current title string. Often used inside an effect or a screen title function when the title depends on pulses.',
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
    about:
      'Template attributes (not JS imports). jacare-frame is the outlet where screens mount. jacare-go intercepts clicks for SPA navigation (keep href for progressive enhancement). jacare-here marks the active link match for styling.',
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
    about:
      'Builds a reactive form from a field schema (initial value + optional validate). Each field behaves like a pulse with .error(), .touched(), .dirty(), and .blur(). handleSubmit(fn) validates then calls fn(values). Pair fields with bind-value in the view.',
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
    about:
      'Export lifecycle from a screen module so nav can call onMount, onActivate, onDeactivate, and onUnmount. Use activate/deactivate for work that should run when the screen is shown or hidden without a full unmount. Return cleanups from hooks when needed.',
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
    about:
      'Registers a labeled getter in the DevTools Scope panel (for example draft state while debugging). Usually returned from onActivate so it unregisters on deactivate. Not required for production UI.',
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
    about:
      'Calls your page’s render(props) and returns the HTML string. Use on the server or in build scripts. Pair with the .jcr module’s render export — it is not a replacement for client mount.',
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
    about:
      'Async-iterates HTML chunks derived from a full render (top-level element split). Useful to start writing response bytes early. It is not a fully incremental component stream like React Server Components.',
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
    about:
      'Low-level hydration: finds [data-jacare-bind] nodes and attaches text bindings from SSR state. Prefer the compiled resume() from the .jcr module in apps; this helper is for custom SSR pipelines.',
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
    about:
      'Escapes &, <, >, and " for safe HTML text and attribute interpolation. The compiler inserts escapeHtml in SSR codegen; call it yourself only if you build HTML strings manually.',
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
    about:
      'Default client entry exported by every compiled .jcr file. mount(element, props?) creates DOM, wires bindings, and returns dispose(). Used by boot scripts and by nav when attaching screens.',
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
    about:
      'SSR export from a .jcr module. render(props?) returns { html, state }. Send html in the response and pass state to resume on the client.',
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
    about:
      'Client hydration export. resume(element, state, props?) binds to existing SSR markup instead of recreating it. Use after render or renderToString on the server.',
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
    about:
      'Turns on the in-core pulse graph registry (dependency edges and names). Apps usually call connectJacareDevtools instead, which enables this for you. Keep behind DEV flags.',
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
    about:
      'Attaches a human label (and optional file/line) to a pulse for the graph UI. The compiler often emits this in DEV automatically for const pulses in .jcr modules.',
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
    about:
      'Returns a snapshot of pulses, effects, and edges for custom tooling or tests. The overlay UI uses subscribePulseGraph; you rarely need this in application code.',
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
    about:
      'Mounts the Jacaré DevTools overlay (Pulse Graph, optional Scope and Mesh tabs). Returns a stop function. Use only in development or behind an explicit Lab toggle — not as a production default.',
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
    about:
      'Programmatic compiler: .jcr source string → JavaScript module code (and optional source map). Used by the Vite plugin, CLI, Lab playground, and tests. Production apps do not call compile in the browser.',
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
    about:
      'Lower-level parsers that return ASTs for tooling (linters, IR inspectors, IDE features). Prefer compile() unless you are building developer tools on top of Jacaré.',
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
    about:
      'Returns Binding IR sites for a template — the same data jacare check --bindings prints. Use it to teach, test, or visualize how each ${} / bind becomes a runtime helper.',
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
    about:
      'Lowers a parsed template AST into a MountPlan forest (structured mount instructions). Advanced compiler and IR tooling — see the Binding IR lesson.',
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
    about:
      'Default Vite plugin. Transforms .jcr on the fly, enables HMR, turns on CPW optimizations in production, and strips debug binds. Add plugins: [jacare()] to your Vite config.',
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
    about:
      'Helper that returns a ready-made Vite config with the Jacaré plugin and sensible defaults (title, and related options). Useful for scaffolds; customize when you outgrow it.',
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
    about:
      'Optional Vite plugin for file-based routing (a pages directory becomes a route table). Complements createNav; you still understand screens under the hood.',
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
    about:
      'Scans a pages directory and maps file paths to URL patterns (including dynamic segments). Used by meta tooling and createJacareApp.',
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
    about:
      'Bootstraps a nav from discovered file routes plus a layout — a shortcut when you want pages/** conventions instead of a hand-written screens map.',
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
    about:
      'Command-line tools (not a JavaScript import). new scaffolds an app; dev runs Vite; build writes production output; check compiles project .jcr files; check --bindings prints Binding IR. You can also run npm create jacare@latest.',
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
    about:
      'Required template block in a .jcr module — the UI tree with bindings, directives, and components. The compiler turns it into mount, render, and resume. Script above the view stays plain JavaScript.',
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
    about:
      'Optional scoped CSS for this module. Selectors are rewritten so styles do not leak globally. Styles may be static or reactive depending on content.',
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
    about:
      'Optional declaration of props, emits, slots, and related surface for tooling and validation. Helps catch misuse of components at compile or check time.',
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
    about:
      'Template event attributes. Prefer on-click=${handler}; @click is an alias. Listeners are registered on mount and removed on dispose — no manual removeEventListener in app code.',
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
    about:
      'Dev-only template tag that shows a small panel of selected values. Stripped or no-op in production builds. Handy while teaching reactivity on a page.',
    example: `<debug { count, cart } />`,
    path: '/debug',
  },
]
