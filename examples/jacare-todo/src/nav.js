import { createNav, createRoute, lazy, screen } from '@jacare/core'
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
    '/votes': { use: lazy(() => import('./pages/votes.jcr')), title: 'Jacaré · Votes' },
    '/habits': { use: lazy(() => import('./pages/habits.jcr')), title: 'Jacaré · Habits' },
    '/seats': { use: lazy(() => import('./pages/seats.jcr')), title: 'Jacaré · Seats' },
    '/league': { use: lazy(() => import('./pages/league.jcr')), title: 'Jacaré · League' },
    '/shop': { use: lazy(() => import('./pages/shop.jcr')), title: 'Jacaré · Shop' },
    '/about': { use: lazy(() => import('./pages/about.jcr')), title: 'Jacaré · About' },
    '/playground': { use: lazy(() => import('./pages/playground.jcr')), title: 'Jacaré · Playground' },
    '/tutorial': { use: lazy(() => import('./pages/tutorial/index.jcr')), title: 'Jacaré · Tutorial' },
    '/tutorial/getting-started': {
      use: lazy(() => import('./pages/tutorial/getting-started.jcr')),
      title: 'Jacaré · Getting started',
    },
    '/tutorial/reactivity': {
      use: lazy(() => import('./pages/tutorial/reactivity.jcr')),
      title: 'Jacaré · Reactivity',
    },
    '/tutorial/templates': {
      use: lazy(() => import('./pages/tutorial/templates.jcr')),
      title: 'Jacaré · Templates',
    },
    '/tutorial/components': {
      use: lazy(() => import('./pages/tutorial/components.jcr')),
      title: 'Jacaré · Components',
    },
    '/tutorial/navigation': {
      use: lazy(() => import('./pages/tutorial/navigation.jcr')),
      title: 'Jacaré · Navigation',
    },
    '/tutorial/forms': {
      use: lazy(() => import('./pages/tutorial/forms.jcr')),
      title: 'Jacaré · Forms',
    },
    '/tutorial/lifecycle': {
      use: lazy(() => import('./pages/tutorial/lifecycle.jcr')),
      title: 'Jacaré · Lifecycle',
    },
  },
  missing: NotFound,
})

export const route = createRoute(nav.where)
