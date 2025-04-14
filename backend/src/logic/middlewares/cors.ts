import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'

export const corsMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const corsMiddleware = cors({
      origin: c.env.CORS_ALLOW_ORIGINS,
      credentials: true,
    })
    return corsMiddleware(c, next)
  })
