import type { MiddlewareHandler } from 'hono'
import { every } from 'hono/combine'
import { createMiddleware } from 'hono/factory'

import type { User } from '@/features/users/domain/entity'
import { useUserUsecase } from '@/features/users/domain/usecase'
import { useUserRepositoryD1 } from '@/features/users/infrastructure/repositoryImpl'
import type { Auth0JWTPayload } from '@/logic/middlewares/jwk'
import { jwkMiddleware, jwkValidationMiddleware } from '@/logic/middlewares/jwk'

/** JWTペイロードからログインユーザをルックアップする */
const userMiddleware = createMiddleware<{
  Bindings: Env
  Variables: {
    jwtPayload: Auth0JWTPayload
    user: User
  }
}>(async (c, next) => {
  const { sub } = c.get('jwtPayload')
  const repo = useUserRepositoryD1(c.env.D1)
  const usecase = useUserUsecase(repo)

  const storedUser = await usecase.lookupUserByAuth0Id(sub)
  if (storedUser !== undefined) {
    c.set('user', storedUser)
    await next()
    return
  }

  const token = c.req.header('Authorization') ?? ''
  const newUser = await usecase.createTentativeUser({
    authDomain: c.env.AUTH_DOMAIN,
    token,
  })
  console.log(`New user registered. ${JSON.stringify(newUser)}`)

  c.set('user', newUser)
  await next()
})

/** ユーザの認証・認可を行う */
export const userAuthMiddleware: MiddlewareHandler<{
  Bindings: Env
  Variables: { user: User }
}> = every(
  jwkMiddleware,
  jwkValidationMiddleware,
  userMiddleware,
)
