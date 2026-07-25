import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { jacare } from '@jacare/vite-plugin'

const base = process.env.JACARE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [vue(), jacare()],
  optimizeDeps: {
    exclude: ['@jacare/core'],
  },
  server: {
    port: 3008,
  },
})
