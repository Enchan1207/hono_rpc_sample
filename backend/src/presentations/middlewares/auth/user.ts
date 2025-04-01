import { createMiddleware } from 'hono/factory'

import type { User } from '@/domain/entities/user'
import { useUserRepositoryD1 } from '@/infrastructure/repositories/userRepository'
import { useUserUsecase } from '@/usecases/userUsecase'

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
