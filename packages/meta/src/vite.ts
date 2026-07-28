export {
  jacareMeta,
  VIRTUAL_ROUTES_ID,
} from './vite-plugin.js'
export type { JacareMetaPluginOptions } from './vite-plugin.js'
export {
  discoverRoutes,
  filePathToRoute,
  generateRoutesModule,
} from './discover-routes.js'
export type { DiscoveredRoute, DiscoverRoutesOptions } from './discover-routes.js'
export {
  createJacareApp,
  createJacareAppFromRoutes,
  defineJacareConfig,
} from './create-app.js'
export type { JacareAppConfig, JacareAppFromRoutesConfig } from './create-app.js'
