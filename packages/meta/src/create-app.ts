import { createNav } from '@jacare/core'
import type { Nav, NavMount, NavOptions } from '@jacare/core'
import type { DiscoveredRoute } from './discover-routes.js'

export interface JacareAppConfig {
  base?: string
  layout: NavMount
  missing?: NavMount
  /** Project pages dir — for defineJacareConfig / tooling only; not used at runtime. */
  pagesDir?: string
  /** Discovered route metadata — for tooling only; not used at runtime. Pass `screens` or use `createJacareAppFromRoutes`. */
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

export function createJacareApp(config: JacareAppConfig): Nav {
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
    'createJacareApp requires `screens`. For file-based routes use jacareMeta() with createJacareAppFromRoutes({ routeLoaders }) from virtual:jacare-routes.',
  )
}

export function defineJacareConfig<T extends JacareAppConfig>(config: T): T {
  return config
}
