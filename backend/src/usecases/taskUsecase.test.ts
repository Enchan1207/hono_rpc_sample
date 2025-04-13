import { env } from 'cloudflare:test'

import type { Task } from '@/domain/entities/task'
import type { User } from '@/domain/entities/user'
import { useTaskRepositoryD1 } from '@/infrastructure/repositories/taskRepository'
import { useUserRepositoryD1 } from '@/infrastructure/repositories/userRepository'

import { useTaskUsecase } from './taskUsecase'

describe('タスクの取得', () => {
  const taskRepository = useTaskRepositoryD1(env.D1)
  const userRepository = useUserRepositoryD1(env.D1)

  const taskUsecase = useTaskUsecase(taskRepository)

  const testUser: User = {
    id: 'test_user_id',
    name: 'test user',
    auth0_user_id: 'auth0_test_user',
  }

  beforeAll(async () => {
    // テストユーザを登録
    await userRepository.saveUser(testUser)

    // テストタスクを登録
    const dummyTasks: Task[] = [
      {
        id: 'test_task_id',
        userId: testUser.id,
        title: 'test task',
        due: new Date('2025-01-01T00:00:00.000Z').getTime(),
        priority: 'high',
        description: 'test task',
      },
      {
        id: 'test_task_id',
        userId: 'other_user_id',
        title: 'test task',
        due: new Date('2025-01-01T00:00:00.000Z').getTime(),
        priority: 'high',
        description: 'test task',
      },
    ]
    await Promise.all(dummyTasks.map(task => taskRepository.saveTask(task)))
  })

  test('他のユーザが作成したタスクは取得できないこと', async () => {
    const result = await taskUsecase.listTasks(testUser, {
      sortBy: 'id',
      order: 'asc',
      limit: 1,
    })

    expect(result).toStrictEqual([{
      id: 'test_task_id',
      userId: testUser.id,
      title: 'test task',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
    }])
  })
})
