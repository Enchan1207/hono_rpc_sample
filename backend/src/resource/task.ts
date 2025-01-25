export const TaskPriorities = ['high', 'middle', 'low'] as const
export type TaskPriority = (typeof TaskPriorities)[number]

/** タスク優先順位の数値 */
export const TaskPriorityLevelMap = {
  high: 100,
  middle: 50,
  low: 0,
} as const satisfies Record<TaskPriority, number>

/** タスク */
export type Task = {
  id: string
  title: string
  // TODO: use date-processing package
  limit: Date
  priority: TaskPriority
  description: string
}
