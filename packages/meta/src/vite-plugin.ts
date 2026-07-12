import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { discoverRoutes } from './discover-routes.js'

export const VIRTUAL_ROUTES_ID = 'virtual:jacare-routes'

export interface JacareMetaPluginOptions {
  pagesDir?: string
}

export function jacareMeta(options: JacareMetaPluginOptions = {}): Plugin {
  let projectRoot = process.cwd()
  let pagesDir = 'src/pages'

  return {
    name: 'jacare-meta',
    enforce: 'pre',

    configResolved(resolved) {
      projectRoot = resolved.root
      pagesDir = options.pagesDir ?? 'src/pages'
    },

    resolveId(id) {
      if (id === VIRTUAL_ROUTES_ID) return '\0' + VIRTUAL_ROUTES_ID
    },

    load(id) {
      if (id !== '\0' + VIRTUAL_ROUTES_ID) return

      const absPages = resolve(projectRoot, pagesDir)
      if (!existsSync(absPages)) {
        return "import { lazy } from '@jacare/core'\n\nexport const routeLoaders = {}\nexport const routePaths = []\n"
      }

      const routes = discoverRoutes({
        pagesDir: absPages,
        rootDir: resolve(projectRoot, 'src'),
      })

      const lines = [
        "import { lazy } from '@jacare/core'",
        '',
        'export const routeLoaders = {',
      ]

      for (const route of routes) {
        const importPath = '/' + join('src', route.importPath.replace(/^\.\//, '')).replace(/\\/g, '/')
        lines.push(`  ${JSON.stringify(route.path)}: lazy(() => import(${JSON.stringify(importPath)})),`)
      }

      lines.push('}', '')
      lines.push('export const routePaths = [')
      for (const route of routes) {
        lines.push(`  ${JSON.stringify(route.path)},`)
      }
      lines.push(']', '')

      return lines.join('\n')
    },
  }
}

export { discoverRoutes, filePathToRoute, generateRoutesModule } from './discover-routes.js'
export { createJacareApp, createJacareAppFromRoutes, defineJacareConfig } from './create-app.js'
export type { DiscoveredRoute, DiscoverRoutesOptions } from './discover-routes.js'
export type { JacareAppConfig, JacareAppFromRoutesConfig } from './create-app.js'
