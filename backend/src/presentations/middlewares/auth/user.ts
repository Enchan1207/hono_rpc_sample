import { createMiddleware } from 'hono/factory'

import type { User } from '@/domain/entities/user'
import { useUserRepositoryD1 } from '@/infrastructure/repositories/userRepository'

import type { Auth0JWTPayload } from './jwk'

export const userMiddleware = createMiddleware<{
  Bindings: Env
  Variables: {
    jwtPayload: Auth0JWTPayload
    user: User
  }
}>(async (c, next) => {
  const { sub } = c.get('jwtPayload')
  const repo = useUserRepositoryD1(c.env.D1)
  const user = await repo.getUserByAuth0Id(sub)

  if (user === undefined) {
    // TODO: ユーザ情報がなければ登録する
    console.log(`no user registered with id ${sub}`)
    return c.text('Unauthorized', 401)
  }

  c.set('user', user)
  await next()
})
