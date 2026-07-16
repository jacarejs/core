import { createNav, screen } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'
import Home from './pages/index.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': screen(Home),
  },
  missing: NotFound,
})
