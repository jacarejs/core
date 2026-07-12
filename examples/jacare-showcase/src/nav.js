import { createNav, lazy } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'
import Home from './pages/index.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': Home,
    '/reactivity': lazy(() => import('./pages/reactivity.jcr')),
    '/components': lazy(() => import('./pages/components.jcr')),
    '/forms': lazy(() => import('./pages/forms.jcr')),
    '/playground': lazy(() => import('./pages/playground.jcr')),
  },
  missing: NotFound,
})

nav.warm('/reactivity')
nav.warm('/components')
nav.warm('/playground')
