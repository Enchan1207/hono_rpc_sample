/** タスクの優先度 */
export type TaskPriority = 'high' | 'middle' | 'low'

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
