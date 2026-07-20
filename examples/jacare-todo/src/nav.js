import { createNav, lazy, screen } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'
import * as Tasks from './pages/tasks.jcr'
import NotFound from './pages/not-found.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': { use: screen(Tasks), title: 'Jacaré · Tasks' },
    '/board': { use: lazy(() => import('./pages/kanban.jcr')), title: 'Jacaré · Kanban' },
    '/match': { use: lazy(() => import('./pages/tictactoe.jcr')), title: 'Jacaré · Match' },
    '/focus': { use: lazy(() => import('./pages/focus.jcr')), title: 'Jacaré · Focus' },
    '/invite': { use: lazy(() => import('./pages/invite.jcr')), title: 'Jacaré · Invite' },
    '/split': { use: lazy(() => import('./pages/split.jcr')), title: 'Jacaré · Split' },
    '/league': { use: lazy(() => import('./pages/league.jcr')), title: 'Jacaré · League' },
  },
  missing: NotFound,
})
