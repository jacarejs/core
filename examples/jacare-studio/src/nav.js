import { createNav, lazy } from '@jacare/core'
import { APP_BASE } from './app-base.js'
import Shell from './shell.jcr'

export const nav = createNav({
  base: APP_BASE,
  layout: Shell,
  screens: {
    '/': {
      use: lazy(() => import('./pages/index.jcr')),
      title: 'Jacaré Studio',
    },
  },
})
