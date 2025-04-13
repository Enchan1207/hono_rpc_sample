import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import type { User } from '@/entities/user'

import { client } from './client'
import { NetworkError } from './errors'

export const getCurrentUser = async (token: string): Promise<Result<User, NetworkError>> => {
  try {
    const response = await client.user.me.$get({}, {
      //
      headers: { Authorization: `Bearer ${token}` },
    })

    // TODO: #80 バックエンドからメールアドレスを取得できるようになったらオーバーライドを外す
    return response.json().then(user => ok({
      ...user,
      email: 'mail@example.com',
    }))
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}
