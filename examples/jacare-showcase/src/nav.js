import { createNav, lazy, screen } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'
import * as Home from './pages/index.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': { use: screen(Home), title: 'Jacaré Showcase' },
    '/reactivity': { use: lazy(() => import('./pages/reactivity.jcr')), title: 'Showcase · Reactivity' },
    '/lists': { use: lazy(() => import('./pages/lists.jcr')), title: 'Showcase · Lists' },
    '/bindings': { use: lazy(() => import('./pages/bindings.jcr')), title: 'Showcase · Bindings' },
    '/forms': { use: lazy(() => import('./pages/forms.jcr')), title: 'Showcase · Forms' },
    '/components': { use: lazy(() => import('./pages/components.jcr')), title: 'Showcase · Components' },
    '/poll': { use: lazy(() => import('./pages/poll.jcr')), title: 'Showcase · Poll' },
    '/cart': { use: lazy(() => import('./pages/cart.jcr')), title: 'Showcase · Cart' },
    '/timers': { use: lazy(() => import('./pages/timers.jcr')), title: 'Showcase · Timers' },
    '/performance': { use: lazy(() => import('./pages/performance.jcr')), title: 'Showcase · Performance' },
  },
  missing: NotFound,
})
