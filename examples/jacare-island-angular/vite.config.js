import { defineConfig } from 'vite'
import { jacare } from '@jacare/vite-plugin'

const base = process.env.JACARE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [jacare()],
  optimizeDeps: {
    exclude: ['@jacare/core'],
    include: ['zone.js', '@angular/compiler'],
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  },
  server: {
    port: 3009,
  },
})
