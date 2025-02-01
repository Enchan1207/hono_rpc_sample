/** タスクのORMエンティティ */
export type TaskEntity = {
  id: string
  title: string
  due: number
  priority: number
  description: string
}

export type TaskListItemEntity = Omit<TaskEntity, 'description'>
