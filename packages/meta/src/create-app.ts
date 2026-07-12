import { createNav } from '@jacare/core'
import type { Nav, NavMount, NavOptions } from '@jacare/core'
import { discoverRoutes, type DiscoveredRoute } from './discover-routes.js'

export interface JacareAppConfig {
  base?: string
  layout: NavMount
  missing?: NavMount
  pagesDir?: string
  routes?: DiscoveredRoute[]
  screens?: NavOptions['screens']
  beforeGo?: NavOptions['beforeGo']
}

export interface JacareAppFromRoutesConfig extends Omit<JacareAppConfig, 'pagesDir' | 'routes'> {
  routeLoaders: NavOptions['screens']
}

export function createJacareAppFromRoutes(config: JacareAppFromRoutesConfig): Nav {
  return createNav({
    ...(config.base ? { base: config.base } : {}),
    layout: config.layout,
    screens: config.screens ?? config.routeLoaders,
    ...(config.missing ? { missing: config.missing } : {}),
    ...(config.beforeGo ? { beforeGo: config.beforeGo } : {}),
  })
}

export function createJacareApp(config: JacareAppConfig & { pagesDir: string }): Nav {
  const routes = config.routes ?? discoverRoutes({ pagesDir: config.pagesDir, rootDir: config.pagesDir })

  if (config.screens) {
    return createNav({
      ...(config.base ? { base: config.base } : {}),
      layout: config.layout,
      screens: config.screens,
      ...(config.missing ? { missing: config.missing } : {}),
      ...(config.beforeGo ? { beforeGo: config.beforeGo } : {}),
    })
  }

  throw new Error(
    'createJacareApp requires build-time route discovery. Use jacareMeta() vite plugin with createJacareAppFromRoutes() and virtual:jacare-routes.',
  )
}

export function defineJacareConfig<T extends JacareAppConfig>(config: T): T {
  return config
}
