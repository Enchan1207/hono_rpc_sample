import type dayjs from '@/logic/dayjs'

export type TaskPriority = 'high' | 'middle' | 'low'
export const TaskPriority = {
  high: 100,
  middle: 50,
  low: 0,
} as const satisfies Record<TaskPriority, number>

/** タスク */
export type Task = {
  id: string
  title: string
  limit: dayjs.Dayjs
  priority: TaskPriority
  description: string
}

/** タスクリストの各項目 */
export type TaskListItem = Omit<Task, 'description'>
