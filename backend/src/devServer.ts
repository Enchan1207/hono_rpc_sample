import { serve } from '@hono/node-server'
import app from './routes'

const port = Number(process.env.SERVER_PORT ?? '3000')
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
