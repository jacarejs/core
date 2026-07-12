import { createNav, lazy } from '@jacare/core'
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
