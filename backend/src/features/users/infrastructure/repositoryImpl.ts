import type { User } from '@/features/users/domain/entity'
import type { UserRepository } from '@/features/users/domain/repository'
import { condition } from '@/logic/queryBuilder/conditionTree'
import { d1 } from '@/logic/queryBuilder/d1'

import { UserRecord } from './entity'

const getUserById = (db: D1Database): UserRepository['getUserById'] => async (id: string) => {
  const stmt = d1(db)
    .select(UserRecord, 'users')
    .where(condition('id', '==', id))
    .build()
  return stmt.first<UserRecord>().then(item => item === null ? undefined : item)
}

const getUserByAuth0Id = (db: D1Database): UserRepository['getUserByAuth0Id'] => async (id: string) => {
  const stmt = d1(db)
    .select(UserRecord, 'users')
    .where(condition('auth0_user_id', '==', id))
    .build()
  return stmt.first<UserRecord>().then(item => item === null ? undefined : item)
}

const saveUser = (db: D1Database): UserRepository['saveUser'] => async (newUser: User) => {
  const stmt = `INSERT INTO users 
    VALUES (?1,?2,?3)
    ON CONFLICT (id) DO UPDATE SET
        name = ?2,
        auth0_user_id = ?3
  `

  await db.prepare(stmt).bind(
    newUser.id,
    newUser.name,
    newUser.auth0_user_id,
  ).run()

  return newUser
}

export const useUserRepositoryD1 = (db: D1Database): UserRepository => {
  return {
    getUserById: getUserById(db),
    getUserByAuth0Id: getUserByAuth0Id(db),
    saveUser: saveUser(db),
  }
}
