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
    '/tutorial': { use: lazy(() => import('./pages/tutorial.jcr')), title: 'Showcase · Tutorial' },
    '/playground': { use: lazy(() => import('./pages/playground.jcr')), title: 'Showcase · Playground' },
    '/game': { use: lazy(() => import('./pages/game.jcr')), title: 'Showcase · River Run' },
    '/components': { use: lazy(() => import('./pages/components.jcr')), title: 'Showcase · Components' },
  },
  missing: NotFound,
})
