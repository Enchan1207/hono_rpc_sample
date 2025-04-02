import { ulid } from 'ulid'

import type { User } from './user'

/** タスクの優先度 */
export const TaskPriorities = ['high', 'middle', 'low'] as const
export type TaskPriority = typeof TaskPriorities[number]

/** タスク */
export type Task = {
  id: string
  userId: User['id']
  title: string
  due: number
  priority: TaskPriority
  description: string
}

/** タスクがもつ情報 */
export type TaskData = Omit<Task, 'id' | 'userId'>

/** タスクのサマリ(リストの各項目) */
export type TaskSummary = Omit<Task, 'description'>

export const createTaskEntity = (taskData: TaskData, userId: User['id']): Task => ({
  id: ulid(),
  userId,
  ...taskData,
})
