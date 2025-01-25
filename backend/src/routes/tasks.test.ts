import {
  assert,
  beforeAll, describe, expect, test,
} from 'vitest'
import { testClient } from 'hono/testing'
import tasks from '@/routes/tasks'
import { compare } from '@/logic/compare'
import { TaskPriorityLevelMap, type Task } from '@/resource/task'

describe('単一項目の操作', () => {
  let insertedTaskId: Task['id']

  describe('追加', () => {
    beforeAll(async () => {
      const newTask: Omit<Task, 'id'> = {
        title: 'test',
        limit: new Date('2025-01-01T00:00:00.000Z'),
        priority: 'high',
        description: 'test task',
      }

      const response = await testClient(tasks).index.$post({
        json: {
          priority: newTask.priority,
          description: newTask.description,
          title: newTask.title,
          limit: newTask.limit,
        },
      })

      const taskId = (await response.json())['id']
      insertedTaskId = taskId
    })

    test('IDが生成されること', () => {
      expect(insertedTaskId).toBeDefined()
    })
  })

  test('挿入時と同じ内容を取得できること', async () => {
    const response = await testClient(tasks)[':id']
      .$get({ param: { id: insertedTaskId } })
    assert(response.ok)

    const task = await response.json()
    // TODO: use primitive type
    const taskData = {
      ...task,
      limit: new Date(task.limit),
    }

    expect(taskData).toStrictEqual({
      id: insertedTaskId,
      title: 'test',
      limit: new Date('2025-01-01T00:00:00.000Z'),
      priority: 'high',
      description: 'test task',
    })
  })

  describe('更新', () => {
    let response: Response

    beforeAll(async () => {
      const updated = {
        id: insertedTaskId,
        title: 'updated title',
        priority: 'low',
        description: 'test task *updated*',
      }

      response = await tasks.request(`/${insertedTaskId}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    })

    test('200が返ること', () => {
      expect(response.status).toBe(200)
    })

    test('項目が更新されていること', async () => {
      const request = await testClient(tasks)[':id']
        .$get({ param: { id: insertedTaskId } })
      assert(request.ok)

      const updatedTask = await request.json()
      expect(updatedTask).toStrictEqual({
        id: insertedTaskId,
        title: 'updated title',
        limit: '2025-01-01T00:00:00.000Z',
        priority: 'low',
        description: 'test task *updated*',
      })
    })
  })

  describe('削除', () => {
    beforeAll(async () => {
      const request = await testClient(tasks)[':id']
        .$delete({ param: { id: insertedTaskId } })
      assert(request.ok)
    })

    test('項目が削除されていること', async () => {
      const request = await testClient(tasks)[':id']
        .$get({ param: { id: insertedTaskId } })

      expect(request.status).toBe(404)
    })
  })
})

describe('項目のリストアップ', () => {
  let insertedTasks: Task[]

  beforeAll(async () => {
    // ダミータスクを生成して流し込む
    const dummyTaskData: Omit<Task, 'id'>[] = Array.from({ length: 5 }).map(
      (_, i) => ({
        title: `Task-${i}`,
        limit: new Date(`2025-01-01T00:${i.toString().padStart(2, '0')}:00Z`),
        // 強引!
        priority: ['high', 'middle', 'low'][i % 3] as Task['priority'],
        description: '',
      }),
    )

    const client = testClient(tasks).index

    const requests = dummyTaskData.map(task => client.$post({ json: task }))
    const responses = await Promise.all(requests)
    const insertedTaskInfos = await Promise.all(responses.map(r => r.json()))

    // TODO: use primitive type
    insertedTasks = insertedTaskInfos.map(task => ({
      ...task,
      limit: new Date(task.limit),
    }))
  })

  // NOTE: ロジックの詳細はここでは確認しない
  test('全ての項目がIDの昇順にリストアップされること', async () => {
    const client = testClient(tasks).index
    const request = await client.$get({
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
    const client = testClient(tasks).index
    const request = await client.$get({
      query: {
        key: 'priority',
        order: 'desc',
      },
    })
    assert(request.ok)

    const response = await request.json()
    const taskIds = response.map(task => task.id)
    expect(taskIds).toStrictEqual(
      insertedTasks
        .toSorted((lhs, rhs) => {
          const lpr = lhs.priority
          const rpr = rhs.priority
          if (lpr === rpr) {
            return compare('id', 'desc')(lhs, rhs)
          }
          return TaskPriorityLevelMap[rpr] - TaskPriorityLevelMap[lpr]
        })
        .map(task => task.id),
    )
  })
})
