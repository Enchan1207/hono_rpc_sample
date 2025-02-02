import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import tasks from '@/presentations/tasks'

const app = new Hono()
  .use('/task/*', createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const corsMiddleware = cors({
      origin: c.env.FRONTEND_URL,
      credentials: true,
    })
    return corsMiddleware(c, next)
  }))
  .route('/task', tasks)

export default app
export type AppType = typeof app
