import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { jacare } from '@jacare/vite-plugin'

const base = process.env.JACARE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), jacare()],
  optimizeDeps: {
    exclude: ['@jacare/core'],
  },
  server: {
    port: 3007,
  },
})
