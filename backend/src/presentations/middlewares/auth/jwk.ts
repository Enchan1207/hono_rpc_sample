import { createMiddleware } from 'hono/factory'
import { jwk } from 'hono/jwk'
import type { JWTPayload } from 'hono/utils/jwt/types'

export type Auth0JWTPayload = JWTPayload & {
  /** subject: ユーザ識別子 */
  sub: string

  /** audiences: 対象の受信者 */
  aud: string[]

  /** issuer: 発行元 */
  iss: string
}

export const jwkMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => jwk({ jwks_uri: `https://${c.env.AUTH_DOMAIN}/.well-known/jwks.json` })(c, next))

export const jwkValidationMiddleware = createMiddleware<{
  Bindings: Env
  Variables: { jwtPayload: Auth0JWTPayload }
}>(
  async (c, next) => {
    const payload: Partial<Auth0JWTPayload> = c.get('jwtPayload')

    // 期限
    const expire = payload.exp ?? 0
    if (Math.floor(Date.now() / 1000) >= expire) {
      const expired = new Date(expire * 1000)
      console.log(`JWT expired: ${expired.toString()}`)
      return c.text('Unauthorized', 401)
    }

    // Issuer
    const issuer = payload.iss ?? ''
    if (issuer !== `https://${c.env.AUTH_DOMAIN}/`) {
      console.log(`Invalid issuer: ${issuer}`)
      return c.text('Unauthorized', 401)
    }

    // Audience
    const audience = payload.aud ?? []
    if (!audience.includes(c.env.AUTH_AUDIENCE)) {
      console.log(`Invalid audiences: ${audience.join(', ')}`)
      return c.text('Unauthorized', 401)
    }

    // Subject
    const subject = payload.sub ?? ''
    if (subject.length === 0) {
      console.log('No subject')
      return c.text('Unauthorized', 401)
    }

    return next()
  })
