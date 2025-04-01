/** RDB上に保存されるタスクのレコード */
export type TaskRecord = {
  id: string
  userId: string
  title: string
  due: number
  priority: number
  description: string
}

export type TaskSummaryRecord = Omit<TaskRecord, 'description'>
