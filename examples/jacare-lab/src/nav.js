import { createNav, createRoute, lazy, screen } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import { hideCode } from './code-viewer.js'
import Shell from './shell.jcr'
import Home from './pages/index.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': screen(Home),
    '/reactivity': lazy(() => import('./pages/reactivity.jcr')),
    '/templates': lazy(() => import('./pages/templates.jcr')),
    '/bindings': lazy(() => import('./pages/bindings.jcr')),
    '/events': lazy(() => import('./pages/events.jcr')),
    '/if': lazy(() => import('./pages/conditionals.jcr')),
    '/for': lazy(() => import('./pages/lists.jcr')),
    '/components': lazy(() => import('./pages/components.jcr')),
    '/css': lazy(() => import('./pages/css.jcr')),
    '/nav': lazy(() => import('./pages/navigation.jcr')),
    '/forms': lazy(() => import('./pages/forms.jcr')),
    '/lifecycle': lazy(() => import('./pages/lifecycle.jcr')),
    '/cookbook': lazy(() => import('./pages/cookbook.jcr')),
    '/playground': lazy(() => import('./pages/playground.jcr')),
    '/ssr': lazy(() => import('./pages/ssr.jcr')),
    '/tooling': lazy(() => import('./pages/tooling.jcr')),
    '/helpers': lazy(() => import('./pages/helpers.jcr')),
    '/topic/:slug': lazy(() => import('./pages/topic-param.jcr')),
  },
  missing: NotFound,
  beforeGo(to) {
    hideCode()
    if (typeof sessionStorage === 'undefined') return true
    if (to.path === '/nav' && sessionStorage.getItem('jacare-lab:guard') === '1') {
      sessionStorage.removeItem('jacare-lab:guard')
      return '/nav?guard=blocked'
    }
    return true
  },
})

export const route = createRoute(nav.where)

for (const path of [
  '/reactivity',
  '/templates',
  '/bindings',
  '/events',
  '/if',
  '/for',
  '/components',
  '/css',
  '/nav',
  '/forms',
  '/lifecycle',
  '/cookbook',
  '/playground',
]) {
  nav.warm(path)
}
