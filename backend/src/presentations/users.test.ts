import { env, fetchMock } from 'cloudflare:test'
import { sign } from 'hono/jwt'
import { testClient } from 'hono/testing'

import type { User } from '@/domain/entities/user'
import { useUserRepositoryD1 } from '@/infrastructure/repositories/userRepository'
import users from '@/presentations/users'

describe('単一項目の操作', () => {
  const client = testClient(users, env)
  const userRepository = useUserRepositoryD1(env.D1)

  const testUser: User = {
    id: 'test_user_id',
    name: 'test user',
    auth0_user_id: 'test_user',
  }

  let token: string

  beforeAll(async () => {
    token = await sign({
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iss: `https://${env.AUTH_DOMAIN}/`,
      sub: testUser.id,
      aud: [env.AUTH_AUDIENCE],
    }, env.TEST_PRIVATE_KEY, 'RS256')

    // テストユーザを登録
    await userRepository.saveUser(testUser)

    fetchMock.get(`https://${env.AUTH_DOMAIN}`).intercept({
      method: 'GET',
      path: '/userinfo',
    }).reply(200, {
      sub: testUser.auth0_user_id,
      nickname: testUser.name,
      name: testUser.name,
      email: '',
      picture: '',
      updated_at: '',
      email_verified: true,
    }).persist()
  })

  afterEach(() => {
    fetchMock.assertNoPendingInterceptors()
  })

  describe('GET /user/me', () => {
    test('項目を取得できること', async () => {
      const result = await client.me.$get(undefined, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })

      const stored = await result.json()
      expect(stored).toStrictEqual(testUser)
    })
  })
})
