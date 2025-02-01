import { ulid } from 'ulid'
import {
  beforeAll, describe, expect, test, beforeEach,
} from 'vitest'
import { env } from 'cloudflare:test'
import { useTaskRepositoryD1 } from './taskRepository'
import type { Task } from '@/domain/entities/task'
import type { TaskRepository } from '@/domain/repositories/taskRepository'

// NOTE: @cloudflare/vitest-pool-workers を使ったテストでは、test単位で実行がロルバされる
// NOTE: cf.https://github.com/cloudflare/workers-sdk/blob/f9fd9df8f6e11d87bb34ed5005730de1d593989a/fixtures/vitest-pool-workers-examples/d1/test/queries.test.ts#L28

describe('単一項目のCRUD', () => {
  let repo: TaskRepository

  beforeAll(() => {
    repo = useTaskRepositoryD1(env.D1)
  })

  test('項目を作成できること', async () => {
    const task: Task = {
      id: ulid(),
      title: 'test task',
      due: new Date().getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const inserted = await repo.saveTask(task)
    expect(task).toStrictEqual(inserted)
  })

  test('IDを指定して項目を取得できること', async () => {
    const task: Task = {
      id: ulid(),
      title: 'test task',
      due: new Date().getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const { id } = await repo.saveTask(task)

    const stored = await repo.getTask(id)
    expect(stored).toBeDefined()
  })

  test('挿入した項目を更新できること', async () => {
    const task: Task = {
      id: ulid(),
      title: 'test task',
      due: new Date('2024-08-08 00:00:00').getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const stored = await repo.saveTask(task)

    const input: Task = {
      ...stored,
      title: 'modified',
      priority: 'high',
      due: new Date('2024-12-07 00:00:00').getTime(),
      description: 'modified',
    }
    const updated = await repo.saveTask(input)
    expect(updated).toStrictEqual(input)
  })

  test('挿入した項目を削除できること', async () => {
    const task: Task = {
      id: ulid(),
      title: 'test task',
      due: new Date('2024-08-08 00:00:00').getTime(),
      priority: 'middle',
      description: 'test task description',
    }
    const { id } = await repo.saveTask(task)

    await repo.deleteTask(id)

    const stored = await repo.getTask(id)
    expect(stored).toBeUndefined()
  })
})

describe('複数項目のリストとソート', () => {
  let repo: TaskRepository

  beforeAll(() => {
    repo = useTaskRepositoryD1(env.D1)
  })

  const dummyTasks: Task[] = Array.from({ length: 5 }).map((_, i) => ({
    id: i.toString(),
    title: `Task-${i}`,
    due: i,
    // 強引!
    priority: ['high', 'middle', 'low'][i % 3] as Task['priority'],
    description: `task #${i} info`,
  }))

  beforeEach(async () => {
    await Promise.all(dummyTasks.map(task => repo.saveTask(task)))
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
      expect(taskIds).toStrictEqual([0, 3, 1, 4, 2].map(n => n.toString()))
    })
  })
})
