import { createNav, lazy } from '@jacare/core'
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
