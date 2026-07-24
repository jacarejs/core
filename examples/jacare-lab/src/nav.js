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
    '/': { use: screen(Home), title: 'Jacaré Lab' },
    '/quick-start': { use: lazy(() => import('./pages/quick-start.jcr')), title: 'Jacaré Lab · Quick start' },
    '/module': { use: lazy(() => import('./pages/module.jcr')), title: 'Jacaré Lab · Module' },
    '/language': { use: lazy(() => import('./pages/language.jcr')), title: 'Jacaré Lab · Language' },
    '/binding-ir': { use: lazy(() => import('./pages/binding-ir.jcr')), title: 'Jacaré Lab · Binding IR' },
    '/reactivity': { use: lazy(() => import('./pages/reactivity.jcr')), title: 'Jacaré Lab · Reactivity' },
    '/bag': { use: lazy(() => import('./pages/bag.jcr')), title: 'Jacaré Lab · Pulse bags' },
    '/templates': { use: lazy(() => import('./pages/templates.jcr')), title: 'Jacaré Lab · Templates' },
    '/bindings': { use: lazy(() => import('./pages/bindings.jcr')), title: 'Jacaré Lab · Bindings' },
    '/events': { use: lazy(() => import('./pages/events.jcr')), title: 'Jacaré Lab · Events' },
    '/debug': { use: lazy(() => import('./pages/debug.jcr')), title: 'Jacaré Lab · Debug' },
    '/if': { use: lazy(() => import('./pages/conditionals.jcr')), title: 'Jacaré Lab · If' },
    '/case': { use: lazy(() => import('./pages/case.jcr')), title: 'Jacaré Lab · Case' },
    '/for': { use: lazy(() => import('./pages/lists.jcr')), title: 'Jacaré Lab · For' },
    '/components': { use: lazy(() => import('./pages/components.jcr')), title: 'Jacaré Lab · Components' },
    '/css': { use: lazy(() => import('./pages/css.jcr')), title: 'Jacaré Lab · CSS' },
    '/nav': { use: lazy(() => import('./pages/navigation.jcr')), title: 'Jacaré Lab · Navigation' },
    '/forms': { use: lazy(() => import('./pages/forms.jcr')), title: 'Jacaré Lab · Forms' },
    '/lifecycle': { use: lazy(() => import('./pages/lifecycle.jcr')), title: 'Jacaré Lab · Lifecycle' },
    '/cookbook': { use: lazy(() => import('./pages/cookbook.jcr')), title: 'Jacaré Lab · Cookbook' },
    '/playground': { use: lazy(() => import('./pages/playground.jcr')), title: 'Jacaré Lab · Playground' },
    '/ssr': { use: lazy(() => import('./pages/ssr.jcr')), title: 'Jacaré Lab · SSR' },
    '/tooling': { use: lazy(() => import('./pages/tooling.jcr')), title: 'Jacaré Lab · Tooling' },
    '/helpers': { use: lazy(() => import('./pages/helpers.jcr')), title: 'Jacaré Lab · Import catalog' },
    '/topic/:slug': {
      use: lazy(() => import('./pages/topic-param.jcr')),
      title: (ctx) => `Jacaré Lab · Topic · ${ctx.params.slug ?? '…'}`,
    },
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
  '/quick-start',
  '/module',
  '/language',
  '/binding-ir',
  '/reactivity',
  '/bag',
  '/templates',
  '/bindings',
  '/events',
  '/if',
  '/case',
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
