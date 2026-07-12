import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@jacare/core': resolve(__dirname, 'packages/runtime/dist/index.js'),
      '@jacare/compiler': resolve(__dirname, 'packages/compiler/dist/index.js'),
      '@jacare/vite-plugin': resolve(__dirname, 'packages/vite-plugin/dist/index.js'),
      '@jacare/devtools': resolve(__dirname, 'packages/devtools/dist/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['packages/**/tests/**/*.test.ts'],
  },
})
