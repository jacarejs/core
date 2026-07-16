import { viewSnippet } from '../utils/snippet.js'

export const setupCode = `import { createNav, createRoute, lazy, screen } from '@jacare/core'
import Shell from './shell.jcr'
import Home from './pages/index.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: '/',                 // optional — strip this prefix from URLs (GitHub Pages uses /core/lab)
  layout: Shell,             // persistent chrome; must contain jacare-frame
  screens: {
    '/': screen(Home),       // eager screen (wrapped with lifecycle support)
    '/nav': lazy(() => import('./pages/navigation.jcr')),
    '/topic/:slug': lazy(() => import('./pages/topic-param.jcr')), // :slug → params.slug
  },
  missing: NotFound,         // unmatched paths
  beforeGo(to, from) {       // guard: return true | false | redirect path
    return true
  },
})

export const route = createRoute(nav.where)

// boot.js
nav.attach(document.getElementById('app'))`

export const routeCode = viewSnippet(
  `import { createRoute, routeHref } from '@jacare/core'
import { nav } from './nav.js'

const route = createRoute(nav.where)

const pathLabel = derive(() => route.path())
const visitedSearch = route.search('visited')
const qSearch = route.search('q')
const guardSearch = route.search('guard')
const slugParam = route.param('slug')
const hashLabel = derive(() => nav.where().hash || '—')
const paramsJson = derive(() => JSON.stringify(nav.where().params))
const searchJson = derive(() => JSON.stringify(nav.where().search))

function simulate(path) {
  nav.go(path)
}`,
  `  <div class="stack">
    <div class="nav-live">
      <div class="nav-live-row"><span>path</span><code>\${pathLabel}</code></div>
      <div class="nav-live-row"><span>?visited</span><code>\${visitedSearch() ?? '—'}</code></div>
      <div class="nav-live-row"><span>?q</span><code>\${qSearch() ?? '—'}</code></div>
      <div class="nav-live-row"><span>?guard</span><code>\${guardSearch() ?? '—'}</code></div>
      <div class="nav-live-row"><span>params.slug</span><code>\${slugParam() ?? '—'}</code></div>
      <div class="nav-live-row"><span>hash</span><code>\${hashLabel}</code></div>
    </div>
    <div class="row">
      <button on-click=\${() => simulate('/nav')}>path → /nav</button>
      <button on-click=\${() => simulate('/nav?visited=1')}>?visited=1</button>
      <button on-click=\${() => simulate('/nav?q=jacare')}>?q=jacare</button>
      <button on-click=\${() => simulate('/topic/alpha')}>params.slug=alpha</button>
    </div>
  </div>`,
)

export const navApiCode = viewSnippet(
  `function goHelpers() {
  nav.go('/nav?visited=1')
}

function swapHelpers() {
  nav.swap('/nav?visited=swap')
}

function undoHelpers() {
  nav.undo()
}

function warmForms() {
  nav.warm('/forms')
}`,
  `  <div class="stack">
    <div class="row">
      <button type="button" class="btn" on-click=\${goHelpers}>nav.go</button>
      <button type="button" class="btn btn-outline" on-click=\${swapHelpers}>nav.swap</button>
      <button type="button" class="btn btn-outline" on-click=\${undoHelpers}>nav.undo</button>
      <button type="button" class="btn btn-ghost" on-click=\${warmForms}>nav.warm('/forms')</button>
    </div>
    <p class="muted">Last action: \${lastAction}</p>
    <p class="muted">Current ?visited=: \${visitedSearch() ?? '—'}</p>
  </div>`,
)

export const linksCode = viewSnippet(
  `import { routeHref } from '@jacare/core'
import { appHref } from './app-base.js'

const topics = [
  { slug: 'alpha', label: 'alpha' },
  { slug: 'beta', label: 'beta' },
  { slug: 'gamma', label: 'gamma' },
]

function topicHref(slug) {
  return routeHref('/topic/:slug', { slug })
}`,
  `  <div class="stack">
    <div class="row">
      #for topics as topic (topic.slug)
        <a
          class="btn btn-outline"
          jacare-go=\${topicHref(topic.slug)}
          href=\${appHref(topicHref(topic.slug))}
        >
          Topic: \${topic.label}
        </a>
      #end
    </div>
    <p class="muted">routeHref('/topic/:slug', { slug: 'alpha' }) → /topic/alpha</p>
  </div>`,
)

export const queryCode = viewSnippet(
  `const draftQuery = pulse('')
const qSearch = route.search('q')

function applyQuery() {
  const value = draftQuery().trim()
  const next = value ? '/nav?q=' + encodeURIComponent(value) : '/nav'
  nav.go(next)
}

function clearQuery() {
  draftQuery.set('')
  nav.swap('/nav')
}`,
  `  <div class="stack">
    <div class="row">
      <input class="input" bind-value=\${draftQuery} placeholder="Search query" />
      <button type="button" class="btn" on-click=\${applyQuery}>Apply ?q=</button>
      <button type="button" class="btn btn-outline" on-click=\${clearQuery}>Clear</button>
    </div>
    <p class="muted">Live search: \${qSearch() ?? '—'}</p>
  </div>`,
)

export const guardCode = viewSnippet(
  `// nav.js
beforeGo(to) {
  if (to.path === '/nav' && sessionStorage.getItem('jacare-lab:guard') === '1') {
    sessionStorage.removeItem('jacare-lab:guard')
    return '/nav?guard=blocked'
  }
  return true
}

function armGuard() {
  sessionStorage.setItem('jacare-lab:guard', '1')
  nav.go('/nav')
}`,
  `  <div class="stack">
    <button type="button" class="btn" on-click=\${armGuard}>Arm guard + nav.go('/nav')</button>
    #if guardSearch() === 'blocked'
      <p class="nav-alert">Guard fired — redirected to /nav?guard=blocked.</p>
    #else
      <p class="muted">Arm the flag, then navigate. beforeGo can return a new path to redirect.</p>
    #end
  </div>`,
)

export const warmOnHoverCode = viewSnippet(
  `const prefetchTargets = [
  { path: '/css', label: 'Scoped CSS' },
  { path: '/forms', label: 'Forms' },
  { path: '/playground', label: 'Playground' },
]
const warmed = pulse([])
const warmedLabel = derive(() => (warmed().length > 0 ? warmed().join(', ') : 'none yet'))

function warmOnHover(path) {
  nav.warm(path)
  if (!warmed().includes(path)) warmed.update((list) => [...list, path])
}`,
  `  <div class="stack">
    <div class="row">
      #for prefetchTargets as item (item.path)
        <a
          class="btn btn-outline"
          jacare-go=\${item.path}
          href=\${appHref(item.path)}
          on-pointerenter=\${() => warmOnHover(item.path)}
        >
          \${item.label}
        </a>
      #end
    </div>
    <p class="muted">Warmed so far: \${warmedLabel}</p>
  </div>`,
)

export const shellCode = viewSnippet(
  `import { createNav, lazy, screen } from '@jacare/core'
import Shell from './shell.jcr'
import Home from './pages/index.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': screen(Home),
    '/nav': lazy(() => import('./pages/navigation.jcr')),
    '/topic/:slug': lazy(() => import('./pages/topic-param.jcr')),
  },
})`,
  `  <!-- shell.jcr -->
  <aside class="sidebar">…lesson links with jacare-go…</aside>
  <main class="main" jacare-frame></main>`,
)
