import { createNav, lazy, screen } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'
import * as Tasks from './pages/tasks.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': screen(Tasks),
    '/board': lazy(() => import('./pages/kanban.jcr')),
    '/match': lazy(() => import('./pages/tictactoe.jcr')),
    '/focus': lazy(() => import('./pages/focus.jcr')),
    '/invite': lazy(() => import('./pages/invite.jcr')),
    '/split': lazy(() => import('./pages/split.jcr')),
    '/league': lazy(() => import('./pages/league.jcr')),
  },
  missing: NotFound,
})

nav.warm('/board')
nav.warm('/match')
nav.warm('/focus')
nav.warm('/invite')
nav.warm('/split')
nav.warm('/league')
