import { createNav, lazy, screen } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'
import Tasks from './pages/tasks.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': screen(Tasks),
    '/about': lazy(() => import('./pages/about.jcr')),
    '/tutorial': lazy(() => import('./pages/tutorial/index.jcr')),
    '/tutorial/getting-started': lazy(() => import('./pages/tutorial/getting-started.jcr')),
    '/tutorial/reactivity': lazy(() => import('./pages/tutorial/reactivity.jcr')),
    '/tutorial/templates': lazy(() => import('./pages/tutorial/templates.jcr')),
    '/tutorial/components': lazy(() => import('./pages/tutorial/components.jcr')),
    '/tutorial/navigation': lazy(() => import('./pages/tutorial/navigation.jcr')),
    '/tutorial/forms': lazy(() => import('./pages/tutorial/forms.jcr')),
    '/tutorial/lifecycle': lazy(() => import('./pages/tutorial/lifecycle.jcr')),
    '/playground': lazy(() => import('./pages/playground.jcr')),
  },
  missing: NotFound,
})

nav.warm('/about')
nav.warm('/tutorial')
nav.warm('/playground')
