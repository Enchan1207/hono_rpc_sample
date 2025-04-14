import type { User } from '@/features/users/domain/entity'

export interface UserRepository {
  getUserById(id: User['id']): Promise<User | undefined>
  getUserByAuth0Id(id: User['auth0_user_id']): Promise<User | undefined>
  saveUser(newUser: User): Promise<User>
  // 現時点ではlist, deleteは不要
}
