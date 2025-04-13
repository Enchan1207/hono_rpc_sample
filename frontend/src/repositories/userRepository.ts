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
    return response.json().then(user => ok(user))
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}
