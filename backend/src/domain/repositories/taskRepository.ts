import type { Task, TaskListItem } from '@/domain/entities/task'

export interface TaskRepository {
  getTask(id: Task['id']): Promise<Task | undefined>
  saveTask(newTask: Task): Promise<Task>
  deleteTask(id: Task['id']): Promise<Task | undefined>
  listTasks(
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
    order: 'asc' | 'desc',
    limit: number,
    offset?: number
  ): Promise<TaskListItem[]>
}
