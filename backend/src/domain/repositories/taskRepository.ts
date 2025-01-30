import type { Task } from '@/domain/entities/task'

export type TaskListItem = Omit<Task, 'description'>

export interface TaskRepository {
  getTask(id: Task['id']): Promise<Task | undefined>
  saveTask(newTask: Task): Promise<Task>
  deleteTask(id: Task['id']): Promise<Task | undefined>
  listTasks(
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
    order: 'asc' | 'desc',
  ): Promise<TaskListItem[]>
}
