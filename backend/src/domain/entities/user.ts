import { ulid } from 'ulid'

/** ユーザ情報 */
export type UserData = {
  /** 表示名 */
  name: string

  /** Auth0のユーザ識別子 (subクレーム) */
  auth0_user_id: string
}

export type User = UserData & {
  /** App側の識別子 */
  id: string
}

export const createUserEntity = (userData: UserData): User => ({
  id: ulid(),
  ...userData,
})
