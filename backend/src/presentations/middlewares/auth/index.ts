import type { MiddlewareHandler } from 'hono'
import { every } from 'hono/combine'

import type { User } from '@/domain/entities/user'

import { jwkMiddleware, jwkValidationMiddleware } from './jwk'
import { userMiddleware } from './user'

/** ユーザの認証・認可を行う */
export const userAuthMiddleware: MiddlewareHandler<{
  Bindings: Env
  Variables: { user: User }
}> = every(
  jwkMiddleware,
  jwkValidationMiddleware,
  userMiddleware,
)
