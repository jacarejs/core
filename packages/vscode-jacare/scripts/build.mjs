import * as esbuild from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const root = dirname(scriptsDir)

await esbuild.build({
  absWorkingDir: root,
  entryPoints: [join(root, 'src/extension.ts')],
  bundle: true,
  outfile: join(root, 'dist/extension.js'),
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  logLevel: 'info',
})
