import { env } from 'cloudflare:test'
import { ulid } from 'ulid'

import type { User } from '@/features/users/domain/entity'
import type { UserRepository } from '@/features/users/domain/repository'

import { useUserRepositoryD1 } from './repositoryImpl'

describe('単一項目のCRUD', () => {
  let repo: UserRepository

  beforeAll(() => {
    repo = useUserRepositoryD1(env.D1)
  })

  test('項目を作成できること', async () => {
    const user: User = {
      id: ulid(),
      name: 'test-user',
      auth0_user_id: 'auth0|0123456789',
    }
    const inserted = await repo.saveUser(user)
    expect(user).toStrictEqual(inserted)
  })

  test('IDを指定して項目を取得できること', async () => {
    const user: User = {
      id: ulid(),
      name: 'test-user',
      auth0_user_id: 'auth0|0123456789',
    }
    const { id } = await repo.saveUser(user)

    const stored = await repo.getUserById(id)
    expect(stored).toBeDefined()
  })

  test('Auth0 IDを指定して項目を取得できること', async () => {
    const user: User = {
      id: ulid(),
      name: 'test-user',
      auth0_user_id: 'auth0|0123456789',
    }
    const { auth0_user_id } = await repo.saveUser(user)

    const stored = await repo.getUserByAuth0Id(auth0_user_id)
    expect(stored).toBeDefined()
  })

  test('挿入した項目を更新できること', async () => {
    const user: User = {
      id: ulid(),
      name: 'test-user',
      auth0_user_id: 'auth0|0123456789',
    }
    const stored = await repo.saveUser(user)

    const input: User = {
      ...stored,
      name: 'updated',
      auth0_user_id: 'auth0|9876543210',
    }
    const updated = await repo.saveUser(input)
    expect(updated).toStrictEqual(input)
  })
})
