import { env, fetchMock } from 'cloudflare:test'
import { sign } from 'hono/jwt'
import { testClient } from 'hono/testing'
import { ulid } from 'ulid'
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe, expect, test,
} from 'vitest'

import type { Task, TaskPriority } from '@/domain/entities/task'
import { useTaskRepositoryD1 } from '@/infrastructure/repositories/taskRepository'
import { compare } from '@/logic/compare'
import tasks from '@/presentations/tasks'

import * as keys from './keys.json'

// NOTE: cf. https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/#cloudflaretest-module-definition
beforeAll(() => {
  fetchMock.activate()
  fetchMock.disableNetConnect()

  fetchMock.get(`https://${env.AUTH_DOMAIN}`).intercept({
    method: 'GET',
    path: '/.well-known/jwks.json',
  }).reply(200, { keys: keys.public_keys })
})

afterEach(() => {
  fetchMock.assertNoPendingInterceptors()
})

describe('単一項目の操作', () => {
  const client = testClient(tasks, env)
  const repo = useTaskRepositoryD1(env.D1)

  describe('POST /task', () => {
    const taskData: Omit<Task, 'id'> = {
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    test('DBにレコードが登録されること', async () => {
      const token = await sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        iss: `https://${env.AUTH_DOMAIN}/`,
        aud: [env.AUTH_AUDIENCE],
      }, keys.private_key, 'RS256')
      const response = await client.index.$post({ json: taskData }, {
        headers: {
          //
          Authorization: `Bearer ${token}`,
        },
      })
      const { id } = await response.json()

      const stored = await repo.getTask(id)
      expect(stored).toStrictEqual({
        id,
        ...taskData,
      })
    })
  })

  describe('GET /task/:id', () => {
    const validTaskId = ulid()
    const invalidTaskId = ulid()
    const taskData: Task = {
      id: validTaskId,
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    beforeEach(async () => {
      await repo.saveTask(taskData)
    })

    test('項目を取得できること', async () => {
      const result = await client[':id'].$get({ param: { id: validTaskId } })
      const stored = await result.json()
      expect(stored).toStrictEqual(taskData)
    })

    test('存在しない項目は取得できないこと', async () => {
      const result = await client[':id'].$get({ param: { id: invalidTaskId } })
      expect(result.ok).toBeFalsy()
    })
  })

  describe('PUT /task/:id', () => {
    const taskId = ulid()
    const taskData: Task = {
      id: taskId,
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    beforeEach(async () => {
      await repo.saveTask(taskData)
    })

    test('項目が更新されること', async () => {
      const input: Omit<Task, 'id'> = {
        title: 'modified',
        due: new Date('2025-01-02T00:00:00.000Z').getTime(),
        priority: 'low',
        description: 'modified task',
      }
      await client[':id'].$put({
        json: input,
        param: { id: taskId },
      })

      const updated = await repo.getTask(taskId)
      expect(updated).toStrictEqual({
        id: taskId,
        ...input,
      })
    })

    test('存在しない項目は更新できないこと', async () => {
      const response = await client[':id'].$put({
        json: {},
        param: { id: 'INVALID' },
      })
      expect(response.ok).toBeFalsy()
    })
  })

  describe('DELETE /task/:id', () => {
    const taskId = ulid()
    const taskData: Task = {
      id: taskId,
      title: 'test',
      due: new Date('2025-01-01T00:00:00.000Z').getTime(),
      priority: 'high',
      description: 'test task',
    }

    beforeEach(async () => {
      await repo.saveTask(taskData)
    })

    test('項目が削除されること', async () => {
      await client[':id'].$delete({ param: { id: taskId } })

      const removed = await repo.getTask(taskId)
      expect(removed).toBeUndefined()
    })
  })
})

describe('項目のリストアップ', () => {
  const client = testClient(tasks, env)
  let insertedTasks: Task[]

  beforeAll(async () => {
    // ダミータスクを生成して流し込む
    const dummyTaskData: Omit<Task, 'id'>[] = Array.from({ length: 5 }).map(
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
      .map(task => client.index.$post({ json: task }))
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
