import { jacare } from '@jacare/vite-plugin'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default {
  root,
  base: '/',
  plugins: [jacare({ cpw: true })],
  resolve: {
    alias: {
      '@jacare/core': resolve(root, '../../../packages/runtime/dist/index.js'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}
