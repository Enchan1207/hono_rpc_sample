import { ulid } from 'ulid'

/** タスクの優先度 */
export const TaskPriorities = ['high', 'middle', 'low'] as const
export type TaskPriority = typeof TaskPriorities[number]

/** タスクがもつ情報 */
export type TaskData = {
  title: string
  due: number
  priority: TaskPriority
  description: string
}

/** タスク */
export type Task = TaskData & { id: string }

/** タスクのサマリ(リストの各項目) */
export type TaskSummary = Omit<Task, 'description'>

export const createTaskEntity = (taskData: TaskData): Task => ({
  id: ulid(),
  ...taskData,
})
