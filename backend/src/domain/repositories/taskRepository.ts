import type { Task, TaskSummary } from '@/domain/entities/task'

import type { User } from '../entities/user'

export interface TaskRepository {
  getTask(userId: User['id'], id: Task['id']): Promise<Task | undefined>
  saveTask(userId: User['id'], newTask: Task): Promise<Task>
  deleteTask(userId: User['id'], id: Task['id']): Promise<Task | undefined>
  listTasks(
    userId: User['id'],
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
    order: 'asc' | 'desc',
    limit: number,
    offset?: number,
  ): Promise<TaskSummary[]>
}
