import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Listen on all interfaces
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',  // Django backend URL
        changeOrigin: true,
        secure: false,
        // Remove rewrite if you want to keep /api prefix
      }
    }
  },
  build: {
    outDir: 'dist',
  },
  define: {
    global: 'globalThis',
  }
})
