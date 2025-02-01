/** タスクの優先度 */
export const TaskPriorities = ['high', 'middle', 'low'] as const
export type TaskPriority = typeof TaskPriorities[number]

/** タスクインタフェース */
export type Task = {
  id: string
  title: string
  due: number
  priority: TaskPriority
  description: string
}

/** タスクリストの各項目 */
export type TaskListItem = Omit<Task, 'description'>
