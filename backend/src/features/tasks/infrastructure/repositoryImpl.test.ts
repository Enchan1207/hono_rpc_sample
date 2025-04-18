import { env } from 'cloudflare:test'
import { ulid } from 'ulid'

import type { Task } from '@/features/tasks/domain/entity'
import type { TaskRepository } from '@/features/tasks/domain/repository'
import { useTaskRepositoryD1 } from '@/features/tasks/infrastructure/repositoryImpl'
import type { User } from '@/features/users/domain/entity'
import { useUserRepositoryD1 } from '@/features/users/infrastructure/repositoryImpl'

// NOTE: @cloudflare/vitest-pool-workers を使ったテストでは、test単位で実行がロルバされる
// NOTE: cf.https://github.com/cloudflare/workers-sdk/blob/f9fd9df8f6e11d87bb34ed5005730de1d593989a/fixtures/vitest-pool-workers-examples/d1/test/queries.test.ts#L28

describe('単一項目のCRUD', () => {
  let taskRepository: TaskRepository

  const dummyUser: User = {
    id: ulid(),
    name: 'dummy',
    auth0_user_id: 'auth0|00000000',
    email: 'test@example.com',
  }

  beforeAll(async () => {
    taskRepository = useTaskRepositoryD1(env.D1)

    const userRepository = useUserRepositoryD1(env.D1)
    await userRepository.saveUser(dummyUser)
  })

  afterAll(async () => {
    // TODO: repoレベルではダミーユーザを削除できるようにしておきたい
    // await userRepository.deleteUser(dummyUser.id)
  })

  test('項目を作成できること', async () => {
    const task: Task = {
      id: ulid(),
      userId: dummyUser.id,
      title: 'test task',
      due: new Date().getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const inserted = await taskRepository.saveTask(task)
    expect(task).toStrictEqual(inserted)
  })

  test('IDを指定して項目を取得できること', async () => {
    const task: Task = {
      id: ulid(),
      userId: dummyUser.id,
      title: 'test task',
      due: new Date().getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const { id } = await taskRepository.saveTask(task)

    const stored = await taskRepository.getTask(id)
    expect(stored).toBeDefined()
  })

  test('挿入した項目を更新できること', async () => {
    const task: Task = {
      id: ulid(),
      userId: dummyUser.id,
      title: 'test task',
      due: new Date('2024-08-08 00:00:00').getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const stored = await taskRepository.saveTask(task)

    const input: Task = {
      ...stored,
      title: 'modified',
      priority: 'high',
      due: new Date('2024-12-07 00:00:00').getTime(),
      description: 'modified',
    }
    const updated = await taskRepository.saveTask(input)
    expect(updated).toStrictEqual(input)
  })

  test('挿入した項目を削除できること', async () => {
    const task: Task = {
      id: ulid(),
      userId: dummyUser.id,
      title: 'test task',
      due: new Date('2024-08-08 00:00:00').getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const { id } = await taskRepository.saveTask(task)

    await taskRepository.deleteTask(id)

    const stored = await taskRepository.getTask(id)
    expect(stored).toBeUndefined()
  })
})

describe('複数項目のリストとソート', () => {
  let taskRepository: TaskRepository

  const dummyUser: User = {
    id: ulid(),
    name: 'dummy',
    auth0_user_id: 'auth0|00000000',
    email: 'test@example.com',
  }

  beforeAll(async () => {
    taskRepository = useTaskRepositoryD1(env.D1)

    const userRepository = useUserRepositoryD1(env.D1)
    await userRepository.saveUser(dummyUser)
  })

  afterAll(async () => {
    // TODO: repoレベルではダミーユーザを削除できるようにしておきたい
    // await userRepository.deleteUser(dummyUser.id)
  })

  const dummyTasks: Task[] = Array.from({ length: 5 }).map((_, i) => ({
    id: i.toString(),
    userId: dummyUser.id,
    title: `Task-${i}`,
    due: i,
    // 強引!
    priority: ['high', 'middle', 'low'][i % 3] as Task['priority'],
    description: `task #${i} info`,
  }))

  beforeEach(async () => {
    await Promise.all(dummyTasks.map(task =>
      taskRepository.saveTask(task)))
  })

  describe('IDでソート', () => {
    test('昇順', async () => {
      const taskIds = (await taskRepository.listTasks({
        sortBy: 'id',
        order: 'asc',
        limit: 30,
      })).map(({ id }) => id)
      expect(taskIds).toStrictEqual([0, 1, 2, 3, 4].map(n => n.toString()))
    })

    test('降順', async () => {
      const taskIds = (await taskRepository.listTasks({
        sortBy: 'id',
        order: 'desc',
        limit: 30,
      })).map(({ id }) => id)
      expect(taskIds).toStrictEqual([4, 3, 2, 1, 0].map(n => n.toString()))
    })
  })

  describe('期限でソート', () => {
    test('昇順', async () => {
      const taskIds = (await taskRepository.listTasks({
        sortBy: 'due',
        order: 'asc',
        limit: 30,
      })).map(({ id }) => id)
      expect(taskIds).toStrictEqual([0, 1, 2, 3, 4].map(n => n.toString()))
    })

    test('降順', async () => {
      const taskIds = (await taskRepository.listTasks({
        sortBy: 'due',
        order: 'desc',
        limit: 30,
      })).map(({ id }) => id)
      expect(taskIds).toStrictEqual([4, 3, 2, 1, 0].map(n => n.toString()))
    })
  })

  describe('優先度でソート', () => {
    test('昇順', async () => {
      const taskIds = (await taskRepository.listTasks({
        sortBy: 'priority',
        order: 'asc',
        limit: 30,
      })).map(({ id }) => id)
      expect(taskIds).toStrictEqual([2, 1, 4, 0, 3].map(n => n.toString()))
    })

    test('降順', async () => {
      const taskIds = (await taskRepository.listTasks({
        sortBy: 'priority',
        order: 'desc',
        limit: 30,
      })).map(({ id }) => id)
      expect(taskIds).toStrictEqual([0, 3, 1, 4, 2].map(n => n.toString()))
    })
  })
})
