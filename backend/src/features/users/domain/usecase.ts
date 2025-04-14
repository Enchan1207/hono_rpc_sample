import { ulid } from 'ulid'
import { z } from 'zod'

import type { User } from '@/features/users/domain/entity'
import type { UserRepository } from '@/features/users/domain/repository'

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

export interface UserUsecase {
  /** Auth0のユーザIDからユーザを取得する */
  lookupUserByAuth0Id(auth0UserId: string): Promise<User | undefined>

  /** 認証トークンをAuth0に投げ、暫定ユーザを作成する */
  createTentativeUser(props: {
    authDomain: string
    token: string
  }): Promise<User>
}

const lookupUserByAuth0Id = (repository: UserRepository): UserUsecase['lookupUserByAuth0Id'] =>
  async (auth0UserId: string) => {
    const user = await repository.getUserByAuth0Id(auth0UserId)
    return user
  }

const createTentativeUser = (repository: UserRepository): UserUsecase['createTentativeUser'] =>
  async (props) => {
    const userInfo = await fetchUserInfo(props)
    if (userInfo === undefined) {
      throw new Error('ユーザ情報の取得に失敗')
    }

    const newUser: User = {
      id: ulid(),
      name: userInfo.nickname,
      auth0_user_id: userInfo.sub,
    }
    const registered = await repository.saveUser(newUser)
    return registered
  }

const fetchUserInfo = async (props: {
  authDomain: string
  token: string
}):
Promise<Auth0UserInfo | undefined> => {
  const response = await fetch(`https://${props.authDomain}/userinfo`,
    { headers: { Authorization: props.token } })
    .then(response => response.json())

  const userInfo = Auth0UserInfoSchema.parse(response)
  return userInfo
}

export const useUserUsecase = (repository: UserRepository): UserUsecase => ({
  lookupUserByAuth0Id: lookupUserByAuth0Id(repository),
  createTentativeUser: createTentativeUser(repository),
})
