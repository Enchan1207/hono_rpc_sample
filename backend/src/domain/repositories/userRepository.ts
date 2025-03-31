import type { User } from '../entities/user'

export interface UserRepository {
  getUser(id: User['id']): Promise<User | undefined>
  insertUser(newUser: User): Promise<User>
  // 現時点ではlist, deleteは不要
}
