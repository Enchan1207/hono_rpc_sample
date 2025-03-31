import { createMiddleware } from 'hono/factory'
import { ulid } from 'ulid'
import { z } from 'zod'

import type { User } from '@/domain/entities/user'
import { useUserRepositoryD1 } from '@/infrastructure/repositories/userRepository'

import type { Auth0JWTPayload } from './jwk'

const Auth0UserInfoSchema = z.object({
  sub: z.string(),
  nickname: z.string(),
  name: z.string(),
  email: z.string(),
  picture: z.string(),
  updated_at: z.string(),
  email_verified: z.boolean(),
})
type Auth0UserInfo = z.infer<typeof Auth0UserInfoSchema>

export const userMiddleware = createMiddleware<{
  Bindings: Env
  Variables: {
    jwtPayload: Auth0JWTPayload
    user: User
  }
}>(async (c, next) => {
  const token = c.get('jwtPayload')
  const repo = useUserRepositoryD1(c.env.D1)

  const user = await repo.getUserByAuth0Id(token.sub)

  if (user !== undefined) {
    c.set('user', user)
    await next()
    return
  }

  const authToken = c.req.header('Authorization') ?? ''
  const userInfo = await fetchUserInfo(authToken)
  if (userInfo === undefined) {
    console.log('No user info found')
    return c.text('Unauthorized', 401)
  }

  const newUser: User = {
    id: ulid(),
    name: userInfo.nickname,
    auth0_user_id: userInfo.sub,
  }
  await repo.saveUser(newUser)
  console.log(`new user ${newUser.name}(${newUser.id}) registered.`)
  c.set('user', newUser)

  await next()
})

const fetchUserInfo = async (authorizationToken: string):
Promise<Auth0UserInfo | undefined> => {
  const response = await fetch('https://enchan.jp.auth0.com/userinfo', { headers: { Authorization: authorizationToken } })
  const responseJson = await response.json()
  console.log(responseJson)

  const parseResult = Auth0UserInfoSchema.safeParse(responseJson)
  if (!parseResult.success) {
    return undefined
  }
  return parseResult.data
}
