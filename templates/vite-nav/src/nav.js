import { createNav, createRoute, lazy, screen } from '@jacare/core'
import Shell from './shell.jcr'
import Home from './pages/home.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  layout: Shell,
  screens: {
    '/': { use: screen(Home), title: 'Home · Jacaré' },
    '/about': {
      use: lazy(() => import('./pages/about.jcr')),
      title: 'About · Jacaré',
    },
  },
  missing: NotFound,
})

export const route = createRoute(nav.where)

nav.warm('/about')
