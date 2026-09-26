import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development `/api/*` is forwarded to the local API server (server/, port 5000).
// In production the frontend calls VITE_API_URL instead (see README).
const apiProxy = { '/api': { target: 'http://localhost:5000', changeOrigin: true } }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
