import type { User } from '@/domain/entities/user'
import type { UserRepository } from '@/domain/repositories/userRepository'

const getUserById = (db: D1Database): UserRepository['getUserById'] => async (id: string) => {
  const stmt = 'SELECT id, name, auth0_user_id FROM users WHERE id=?'
  const result = await db.prepare(stmt).bind(id).first<User>()
  if (!result) {
    return undefined
  }
  return result
}

const getUserByAuth0Id = (db: D1Database): UserRepository['getUserByAuth0Id'] => async (id: string) => {
  const stmt = 'SELECT id, name, auth0_user_id FROM users WHERE auth0_user_id=?'
  const result = await db.prepare(stmt).bind(id).first<User>()
  if (!result) {
    return undefined
  }
  return result
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
