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
    '/board': lazy(() => import('./pages/kanban.jcr')),
    '/match': lazy(() => import('./pages/tictactoe.jcr')),
  },
  missing: NotFound,
})

nav.warm('/board')
nav.warm('/match')
