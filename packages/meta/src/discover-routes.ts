import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const PARAM_SEGMENT = /^\[(\.\.\.)?([\w-]+)\]$/

export interface DiscoveredRoute {
  path: string
  file: string
  importPath: string
}

export interface DiscoverRoutesOptions {
  pagesDir: string
  rootDir?: string
  extensions?: string[]
}

export function discoverRoutes(options: DiscoverRoutesOptions): DiscoveredRoute[] {
  const rootDir = options.rootDir ?? options.pagesDir
  const extensions = options.extensions ?? ['.jcr']
  const routes: DiscoveredRoute[] = []

  walk(options.pagesDir, (file) => {
    const ext = extensions.find((e) => file.endsWith(e))
    if (!ext) return

    const rel = relative(options.pagesDir, file).replace(/\\/g, '/')
    const routePath = filePathToRoute(rel.slice(0, -ext.length))
    const importPath = './' + relative(rootDir, file).replace(/\\/g, '/')

    routes.push({ path: routePath, file, importPath })
  })

  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

function walk(dir: string, onFile: (path: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, onFile)
    } else if (stat.isFile()) {
      onFile(full)
    }
  }
}

export function filePathToRoute(filePath: string): string {
  const segments = filePath.split('/').filter(Boolean)
  const routeSegments: string[] = []

  for (const segment of segments) {
    if (segment === 'index') continue

    const param = PARAM_SEGMENT.exec(segment)
    if (param) {
      if (param[1]) {
        routeSegments.push(`:${param[2]}*`)
      } else {
        routeSegments.push(`:${param[2]}`)
      }
      continue
    }

    routeSegments.push(segment)
  }

  if (routeSegments.length === 0) return '/'
  return '/' + routeSegments.join('/')
}

export function generateRoutesModule(
  routes: DiscoveredRoute[],
  options: { lazyImport?: string; coreImport?: string } = {},
): string {
  const lazyImport = options.lazyImport ?? '@jacare/core'
  const lines: string[] = [
    `import { lazy } from '${lazyImport}'`,
    '',
    'export const routeLoaders = {',
  ]

  for (const route of routes) {
    lines.push(`  ${JSON.stringify(route.path)}: lazy(() => import(${JSON.stringify(route.importPath)})),`)
  }

  lines.push('}', '')
  lines.push('export const routePaths = [')
  for (const route of routes) {
    lines.push(`  ${JSON.stringify(route.path)},`)
  }
  lines.push(']', '')

  return lines.join('\n')
}
