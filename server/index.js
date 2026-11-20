// Production server: `npm run build`, then `npm start`. It serves the built site from
// dist/ together with the shop API. (In development, `npm run dev` runs the same API
// inside Vite, so this file is not used.)

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createApiApp } from './app.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

try {
  process.loadEnvFile(path.join(root, '.env'))
} catch {
  // No .env file: the host is expected to provide the settings as environment variables.
}

const app = express()
app.disable('x-powered-by')
app.use(createApiApp())
app.use(express.static(dist))

// Every other address (/cart, /checkout, /order) is a page drawn by the app in the browser.
app.use((request, response, next) => {
  if (request.method !== 'GET') return next()
  response.sendFile(path.join(dist, 'index.html'))
})

const port = Number(process.env.PORT) || 4173
app.listen(port, () => {
  console.log(`The Coquette Atelier is open at http://localhost:${port}`)
})
