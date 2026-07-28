import { existsSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import { discoverRoutes } from './discover-routes.js'

export const VIRTUAL_ROUTES_ID = 'virtual:jacare-routes'
const VIRTUAL_ROUTES_RESOLVED = '\0' + VIRTUAL_ROUTES_ID

export interface JacareMetaPluginOptions {
  pagesDir?: string
}

export function jacareMeta(options: JacareMetaPluginOptions = {}): Plugin {
  let projectRoot = process.cwd()
  let pagesDir = 'src/pages'

  function pagesRoot(): string {
    return resolve(projectRoot, pagesDir)
  }

  function isUnderPages(file: string): boolean {
    const root = pagesRoot()
    return file === root || file.startsWith(root + sep)
  }

  function invalidateVirtualRoutes(server: ViteDevServer): void {
    const mod = server.moduleGraph.getModuleById(VIRTUAL_ROUTES_RESOLVED)
    if (!mod) return
    server.moduleGraph.invalidateModule(mod)
    server.ws.send({ type: 'full-reload', path: '*' })
  }

  return {
    name: 'jacare-meta',
    enforce: 'pre',

    configResolved(resolved) {
      projectRoot = resolved.root
      pagesDir = options.pagesDir ?? 'src/pages'
    },

    configureServer(server) {
      const root = pagesRoot()
      server.watcher.add(root)

      const onFsChange = (file: string) => {
        if (isUnderPages(file)) invalidateVirtualRoutes(server)
      }

      server.watcher.on('add', onFsChange)
      server.watcher.on('unlink', onFsChange)
      server.watcher.on('addDir', onFsChange)
      server.watcher.on('unlinkDir', onFsChange)
    },

    handleHotUpdate({ file, server }) {
      if (!isUnderPages(file)) return
      const mod = server.moduleGraph.getModuleById(VIRTUAL_ROUTES_RESOLVED)
      if (!mod) return
      server.moduleGraph.invalidateModule(mod)
      return [mod, ...mod.importers]
    },

    resolveId(id) {
      if (id === VIRTUAL_ROUTES_ID) return VIRTUAL_ROUTES_RESOLVED
    },

    load(id) {
      if (id !== VIRTUAL_ROUTES_RESOLVED) return

      const absPages = pagesRoot()
      this.addWatchFile(absPages)

      if (!existsSync(absPages)) {
        return "import { lazy } from '@jacare/core'\n\nexport const routeLoaders = {}\nexport const routePaths = []\n"
      }

      const routes = discoverRoutes({
        pagesDir: absPages,
        rootDir: resolve(projectRoot, 'src'),
      })

      for (const route of routes) {
        this.addWatchFile(route.file)
      }

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
