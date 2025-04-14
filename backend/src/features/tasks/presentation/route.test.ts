import { env, fetchMock } from 'cloudflare:test'
import { sign } from 'hono/jwt'
import { testClient } from 'hono/testing'
import { ulid } from 'ulid'

import type {
  Task, TaskData, TaskPriority,
} from '@/features/tasks/domain/entity'
import { useTaskRepositoryD1 } from '@/features/tasks/infrastructure/repositoryImpl'
import tasks from '@/features/tasks/presentation/route'
import type { User } from '@/features/users/domain/entity'
import { useUserRepositoryD1 } from '@/features/users/infrastructure/repositoryImpl'
import { compare } from '@/logic/compare'

describe('単一項目の操作', () => {
  const client = testClient(tasks, env)
  const taskRepository = useTaskRepositoryD1(env.D1)
  const userRepository = useUserRepositoryD1(env.D1)

  const testUser: User = {
    id: 'test_user_id',
    name: 'test user',
    auth0_user_id: 'auth0_test_user',
  }

  let token: string

  beforeAll(async () => {
    token = await sign({
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iss: `https://${env.AUTH_DOMAIN}/`,
      sub: testUser.auth0_user_id,
      aud: [env.AUTH_AUDIENCE],
    }, env.TEST_PRIVATE_KEY, 'RS256')

    // テストユーザを登録
    await userRepository.saveUser(testUser)
  })

  afterEach(() => {
    fetchMock.assertNoPendingInterceptors()
  })

  describe('POST /task', () => {
    const taskData: TaskData = {
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    test('DBにレコードが登録されること', async () => {
      const response = await client.index.$post({ json: taskData }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })
      const { id } = await response.json()

      const stored = await taskRepository.getTask(id)
      expect(stored).toStrictEqual({
        id,
        userId: testUser.id,
        ...taskData,
      })
    })
  })

  describe('GET /task/:id', () => {
    const validTaskId = ulid()
    const invalidTaskId = ulid()

    const dummyTask: Task = {
      id: validTaskId,
      userId: testUser.id,
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    beforeEach(async () => {
      await taskRepository.saveTask(dummyTask)
    })

    test('項目を取得できること', async () => {
      const result = await client[':id'].$get({ param: { id: validTaskId } }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })
      const stored = await result.json()
      expect(stored).toStrictEqual(dummyTask)
    })

    test('存在しない項目は取得できないこと', async () => {
      const result = await client[':id'].$get({ param: { id: invalidTaskId } }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })
      expect(result.ok).toBeFalsy()
    })
  })

  describe('PUT /task/:id', () => {
    const taskId = ulid()
    const taskData: Task = {
      id: taskId,
      userId: testUser.id,
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    beforeEach(async () => {
      await taskRepository.saveTask(taskData)
    })

    test('項目が更新されること', async () => {
      const input: TaskData = {
        title: 'modified',
        due: new Date('2025-01-02T00:00:00.000Z').getTime(),
        priority: 'low',
        description: 'modified task',
      }
      await client[':id'].$put({
        json: input,
        param: { id: taskId },
      }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })

      const updated = await taskRepository.getTask(taskId)
      expect(updated).toStrictEqual({
        id: taskId,
        userId: testUser.id,
        ...input,
      })
    })

    test('存在しない項目は更新できないこと', async () => {
      const response = await client[':id'].$put({
        json: {},
        param: { id: 'INVALID' },
      }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })
      expect(response.ok).toBeFalsy()
    })
  })

  describe('DELETE /task/:id', () => {
    const taskId = ulid()
    const taskData: Task = {
      id: taskId,
      userId: testUser.id,
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    beforeEach(async () => {
      await taskRepository.saveTask(taskData)
    })

    test('項目が削除されること', async () => {
      await client[':id'].$delete({ param: { id: taskId } }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })

      const removed = await taskRepository.getTask(taskId)
      expect(removed).toBeUndefined()
    })
  })
})

describe('項目のリストアップ', () => {
  const client = testClient(tasks, env)
  const userRepository = useUserRepositoryD1(env.D1)

  let insertedTasks: Task[]

  let token: string

  afterEach(() => {
    fetchMock.assertNoPendingInterceptors()
  })

  beforeAll(async () => {
    const auth0UserId = 'test_user'

    token = await sign({
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iss: `https://${env.AUTH_DOMAIN}/`,
      sub: auth0UserId,
      aud: [env.AUTH_AUDIENCE],
    }, env.TEST_PRIVATE_KEY, 'RS256')

    // テストユーザを登録
    await userRepository.saveUser({
      id: 'test_user_id',
      name: 'test user',
      auth0_user_id: auth0UserId,
    })

    // ダミータスクを生成して流し込む
    const dummyTaskData: TaskData[] = Array.from({ length: 5 }).map(
      (_, i) => {
        const hourString = i.toString().padStart(2, '0')
        const dummyDue = new Date(`2025-01-01T00:${hourString}:00Z`)
        return {
          title: `Task-${i}`,
          due: dummyDue.getTime(),
          // 強引!
          priority: ['high', 'middle', 'low'][i % 3] as Task['priority'],
          description: '',
        }
      },
    )
    const requests = dummyTaskData
      .map(task => client.index.$post({ json: task }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      }))
    const responses = await Promise.all(requests)
    insertedTasks = await Promise.all(responses.map(r => r.json()))
  })

  // NOTE: ロジックの詳細はここでは確認しない
  test('全ての項目がIDの昇順にリストアップされること', async () => {
    const request = await client.index.$get({
      query: {
        key: 'id',
        order: 'asc',
      },
    }, {
      headers: {
        //
        Authorization: `Bearer ${token}`,
      },
    })
    assert(request.ok)

    const response = await request.json()
    const taskIds = response.map(task => task.id)
    expect(taskIds).toStrictEqual(
      insertedTasks.toSorted(compare('id', 'asc')).map(task => task.id),
    )
  })

  test('全ての項目が優先度の降順にリストアップされること', async () => {
    const request = await client.index.$get({
      query: {
        key: 'priority',
        order: 'desc',
      },
    }, {
      headers: {
        //
        Authorization: `Bearer ${token}`,
      },
    })
    assert(request.ok)

    const response = await request.json()
    const taskIds = response.map(task => task.id)
    const priorityMap: Record<TaskPriority, number> = {
      high: 100,
      middle: 50,
      low: 0,
    }

    expect(taskIds).toStrictEqual(
      insertedTasks
        .toSorted((lhs, rhs) => {
          const lpr = lhs.priority
          const rpr = rhs.priority
          if (lpr === rpr) {
            return compare('id', 'asc')(lhs, rhs)
          }
          return priorityMap[rpr] - priorityMap[lpr]
        })
        .map(task => task.id),
    )
  })
})
