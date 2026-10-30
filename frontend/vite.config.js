import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              // Gracefully handle backend offline without triggering Vite HMR / reload loop
              if (res && res.writeHead && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ offline: true, message: 'Backend service offline, fallback to mock data' }))
              }
            })
          },
        },
      },
    },
    define: {
      // Expose VITE_API_URL to the browser bundle
      __API_BASE__: JSON.stringify(env.VITE_API_URL || ''),
    },
  }
})
