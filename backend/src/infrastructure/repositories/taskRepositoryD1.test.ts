import { ulid } from 'ulid'
import {
  assert, beforeAll, describe, expect, test,
} from 'vitest'
import { useTaskRepositoryD1 } from './taskRepositoryD1'
import { db } from './miniflare'
import type { Task } from '@/domain/entities/task'
import type { TaskRepository } from '@/domain/repositories/taskRepository'

describe('単一項目のCRUD', () => {
  let storedTaskId: Task['id']
  let repo: TaskRepository

  beforeAll(() => {
    repo = useTaskRepositoryD1(db)
  })

  test('項目を作成できること', async () => {
    const newTask: Task = {
      id: ulid(),
      title: 'test task',
      due: new Date().getTime(),
      priority: 'middle',
      description: '',
    }
    const insertedTask = await repo.saveTask(newTask)
    expect(insertedTask).toBeDefined()
    storedTaskId = insertedTask.id
  })

  test('IDを指定して項目を取得できること', async () => {
    const storedTask = await repo.getTask(storedTaskId)
    expect(storedTask).toBeDefined()
  })

  test('既存の項目を更新できること', async () => {
    const storedTask = await repo.getTask(storedTaskId)
    assert(storedTask !== undefined)
    const updated: Task = {
      ...storedTask,
      title: 'Updated',
      priority: 'high',
      description: 'updated description',
    }
    await repo.saveTask(updated)

    const updatedTask = await repo.getTask(storedTaskId)
    expect(updatedTask).toBe(updated)
  })

  test('項目を削除できること', async () => {
    const deletedTask = await repo.deleteTask(storedTaskId)
    assert(deletedTask !== undefined)
    expect(await repo.getTask(deletedTask.id)).toBeUndefined()
  })
})

describe('複数項目のリストとソート', () => {
  let repo: TaskRepository

  beforeAll(() => {
    repo = useTaskRepositoryD1(db)
  })

  const dummyTasks: Task[] = Array.from({ length: 5 }).map((_, i) => ({
    id: i.toString(),
    title: `Task-${i}`,
    due: new Date().getTime(),
    // 強引!
    priority: ['high', 'middle', 'low'][i % 3] as Task['priority'],
    description: `task #${i} info`,
  }))

  beforeAll(async () => {
    await Promise.all(dummyTasks.map(task => repo.deleteTask(task.id)))
  })

  describe('IDでソート', () => {
    test('昇順', async () => {
      const taskIds = (await repo.listTasks('id', 'asc', 30)).map(({ id }) => id)
      expect(taskIds).toStrictEqual([0, 1, 2, 3, 4].map(n => n.toString()))
    })

    test('降順', async () => {
      const taskIds = (await repo.listTasks('id', 'desc', 30)).map(({ id }) => id)
      expect(taskIds).toStrictEqual([4, 3, 2, 1, 0].map(n => n.toString()))
    })
  })

  describe('期限でソート', () => {
    test('昇順', async () => {
      const taskIds = (await repo.listTasks('due', 'asc', 30)).map(({ id }) => id)
      expect(taskIds).toStrictEqual([0, 1, 2, 3, 4].map(n => n.toString()))
    })

    test('降順', async () => {
      const taskIds = (await repo.listTasks('due', 'desc', 30)).map(({ id }) => id)
      expect(taskIds).toStrictEqual([4, 3, 2, 1, 0].map(n => n.toString()))
    })
  })

  describe('優先度でソート', () => {
    test('昇順', async () => {
      const taskIds = (await repo.listTasks('priority', 'asc', 30)).map(({ id }) => id)
      expect(taskIds).toStrictEqual([2, 1, 4, 0, 3].map(n => n.toString()))
    })

    test('降順', async () => {
      const taskIds = (await repo.listTasks('priority', 'desc', 30)).map(({ id }) => id)
      expect(taskIds).toStrictEqual([3, 0, 4, 1, 2].map(n => n.toString()))
    })
  })
})
