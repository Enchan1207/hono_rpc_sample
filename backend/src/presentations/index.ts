import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { jwk } from 'hono/jwk'

import tasks from '@/presentations/tasks'

type JWTPayload = {
  iss: string
  sub: string
  aud: string[]
  iat: number
  exp: number
  scope: string
  azp: string
}

const app = new Hono()
  .use('/task/*', createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const corsMiddleware = cors({
      origin: c.env.CORS_ALLOW_ORIGINS,
      credentials: true,
    })
    return corsMiddleware(c, next)
  }))
  .use('/task/*', createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const jwkMiddleware = jwk({ jwks_uri: `https://${c.env.AUTH_DOMAIN}/.well-known/jwks.json` })
    return jwkMiddleware(c, next)
  }))
  .use('/task/*', createMiddleware<{
    Bindings: Env
    Variables: { jwtPayload: JWTPayload }
  }>(async (c, next) => {
    const payload = c.get('jwtPayload')

    // 期限
    if (Math.floor(Date.now() / 1000) >= payload.exp) {
      const expired = new Date(payload.exp * 1000)
      console.log(`JWT expired: ${expired.toString()}`)
      return c.text('Unauthorized', 401)
    }

    // Issuer
    if (payload.iss !== `https://${c.env.AUTH_DOMAIN}/`) {
      console.log(`Invalid issuer: ${payload.iss}`)
      return c.text('Unauthorized', 401)
    }

    // Audience
    if (!payload.aud.includes(c.env.AUTH_AUDIENCE)) {
      console.log(`Invalid audiences: ${payload.aud.join(', ')}`)
      return c.text('Unauthorized', 401)
    }

    return next()
  }))
  .route('/task', tasks)

export default app
export type AppType = typeof app
