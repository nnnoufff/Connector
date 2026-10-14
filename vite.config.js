import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// DEEPL_API_KEY lives in .env.local (no VITE_ prefix, so it is never sent to the browser).
// Browser calls to /deepl/... are forwarded to DeepL with the key added here, which also avoids CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const key = env.DEEPL_API_KEY || ''
  const target = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'
  return {
    plugins: [react()],
    optimizeDeps: { exclude: ['onnxruntime-web'] },
    build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
    server: {
      proxy: {
        '/deepl': {
          target,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/deepl/, ''),
          headers: key ? { Authorization: `DeepL-Auth-Key ${key}` } : {},
        },
      },
    },
  }
})
