import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { jwk } from 'hono/jwk'

import tasks from '@/presentations/tasks'

const app = new Hono()
  .use('/task/*', createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const corsMiddleware = cors({
      origin: c.env.CORS_ALLOW_ORIGINS,
      credentials: true,
    })
    return corsMiddleware(c, next)
  }))
  // TODO: ペイロードのexp読んでないせいで期限切れのトークンが通っちゃう そもそもexpがおかしい?
  .use('/task/*', createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const domain = c.env.AUTH_DOMAIN
    const jwkMiddleware = jwk({ jwks_uri: `https://${domain}/.well-known/jwks.json` })
    return jwkMiddleware(c, next)
  }))
  .route('/task', tasks)

export default app
export type AppType = typeof app
