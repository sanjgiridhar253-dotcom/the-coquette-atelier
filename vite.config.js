import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createApiApp } from './server/app.js'

// Runs the shop API (server/app.js) inside the dev and preview servers, so `npm run dev`
// is the whole shop. In production the same API is served by server/index.js.
const shopApi = () => ({
  name: 'shop-api',
  configureServer(server) {
    server.middlewares.use(createApiApp())
  },
  configurePreviewServer(server) {
    server.middlewares.use(createApiApp())
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Hand every .env setting to the API. Vite itself only passes VITE_-prefixed settings
  // to the pages, so the Razorpay secret and template links never reach the browser.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), shopApi()],
  }
})
