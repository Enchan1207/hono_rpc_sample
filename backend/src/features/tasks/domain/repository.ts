import type { User } from '@/features/users/domain/entity'

import type { Task, TaskSummary } from './entity'

export interface TaskRepository {
  getTask(id: Task['id']): Promise<Task | undefined>
  saveTask(newTask: Task): Promise<Task>
  deleteTask(id: Task['id']): Promise<Task | undefined>
  listTasks(props: {
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>
    order: 'asc' | 'desc'
    limit: number
    offset?: number
    userId?: User['id']
  }): Promise<TaskSummary[]>
}
