import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Las peticiones a /api se redirigen al backend (en Docker: http://backend:8000)
    proxy: {
      '/api': process.env.API_URL || 'http://localhost:8000',
    },
  },
})
