import { ulid } from 'ulid'
import type { Task, TaskListItem } from '@/domain/entities/task'
import type { TaskRepository } from '@/domain/repositories/taskRepository'

type TaskData = Omit<Task, 'id'>

export interface TaskUsecase {
  createTask(taskData: TaskData): Promise<Task>
  getTask(id: Task['id']): Promise<Task | undefined>
  updateTask(id: Task['id'], taskData: Partial<TaskData>): Promise<Task>
  deleteTask(id: Task['id']): Promise<Task | undefined>
  listTasks(
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
    order: 'asc' | 'desc',
    limit: number,
    offset?: number
  ): Promise<TaskListItem[]>
}

const createTask = (repository: TaskRepository): TaskUsecase['createTask'] =>
  async (taskData: Omit<Task, 'id'>) => {
    // FIXME: ここでIDを生成するのはおかしい
    const task: Task = {
      ...taskData,
      id: ulid(),
    }
    return await repository.saveTask(task)
  }

const getTask = (repository: TaskRepository): TaskUsecase['getTask'] =>
  async (id: Task['id']) => {
    return await repository.getTask(id)
  }

const updateTask = (repository: TaskRepository): TaskUsecase['updateTask'] =>
  async (id: Task['id'], taskData: Partial<TaskData>) => {
    const stored = await repository.getTask(id)
    if (stored === undefined) {
      // FIXME: Resultの出番か?
      throw new Error('!?')
    }
    const updated: Task = {
      ...stored,
      ...taskData,
    }
    return await repository.saveTask(updated)
  }

const deleteTask = (repository: TaskRepository): TaskUsecase['deleteTask'] =>
  async (id: Task['id']) => {
    return await repository.deleteTask(id)
  }

const listTasks = (repository: TaskRepository): TaskUsecase['listTasks'] =>
  async (
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
    order: 'asc' | 'desc',
    limit: number,
    offset?: number,
  ) => {
    return await repository.listTasks(sortBy, order, limit, offset)
  }

export const useTaskUsecase = (repository: TaskRepository): TaskUsecase => ({
  createTask: createTask(repository),
  getTask: getTask(repository),
  updateTask: updateTask(repository),
  deleteTask: deleteTask(repository),
  listTasks: listTasks(repository),
})
