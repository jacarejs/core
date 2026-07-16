import { createJacareViteConfig } from '@jacare/vite-plugin'
import { fileURLToPath } from 'node:url'
import jacareConfig from './jacare.config.js'

const base = createJacareViteConfig(jacareConfig)
const pathShim = fileURLToPath(new URL('./src/shims/path.js', import.meta.url))

export default {
  ...base,
  resolve: {
    ...base.resolve,
    alias: {
      ...(base.resolve?.alias ?? {}),
      'node:path': pathShim,
      path: pathShim,
    },
  },
  optimizeDeps: {
    ...base.optimizeDeps,
    include: [...(base.optimizeDeps?.include ?? []), '@jacare/compiler', 'source-map-js'],
    exclude: [...new Set([...(base.optimizeDeps?.exclude ?? []), '@jacare/core'])],
  },
}
