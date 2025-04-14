import type { User } from '@/features/users/domain/entity'

import type {
  Task, TaskData, TaskSummary,
} from './entity'
import { createTaskEntity } from './entity'
import type { TaskRepository } from './repository'

export interface TaskUsecase {
  createTask(user: User, taskData: TaskData): Promise<Task>
  getTask(user: User, id: Task['id']): Promise<Task | undefined>
  updateTask(user: User, id: Task['id'], taskData: Partial<TaskData>): Promise<Task | undefined>
  deleteTask(user: User, id: Task['id']): Promise<Task | undefined>
  listTasks(user: User, props: {
    sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>
    order: 'asc' | 'desc'
    limit: number
    offset?: number
  }): Promise<TaskSummary[]>
}

const createTask = (repository: TaskRepository): TaskUsecase['createTask'] => async (user, taskData) => {
  return await repository.saveTask(createTaskEntity(taskData, user.id))
}

const getTask = (repository: TaskRepository): TaskUsecase['getTask'] => async (user, id) => {
  // TODO: 認可エラーみたいなビジネス例外はここでResultにするべき
  const stored = await repository.getTask(id)
  if (stored === undefined) {
    console.log(`指定されたIDの項目は存在しない: ${id}`)
    return undefined
  }

  if (stored.userId !== user.id) {
    console.log(`認可エラー: ${stored.userId} != ${user.id}`)
    return undefined
  }

  return stored
}

const updateTask = (repository: TaskRepository): TaskUsecase['updateTask'] => async (user, id, taskData) => {
  const stored = await repository.getTask(id)
  if (stored === undefined) {
    console.log(`指定されたIDの項目は存在しない: ${id}`)
    return undefined
  }

  if (stored.userId !== user.id) {
    console.log(`認可エラー: ${stored.userId} != ${user.id}`)
    return undefined
  }

  const updated: Task = {
    ...stored,
    ...taskData,
  }
  return await repository.saveTask(updated)
}

const deleteTask = (repository: TaskRepository): TaskUsecase['deleteTask'] => async (user, id) => {
  const stored = await repository.getTask(id)
  if (stored === undefined) {
    console.log(`指定されたIDの項目は存在しない: ${id}`)
    return undefined
  }

  if (stored.userId !== user.id) {
    console.log(`認可エラー: ${stored.userId} != ${user.id}`)
    return undefined
  }

  return await repository.deleteTask(id)
}

const listTasks = (repository: TaskRepository): TaskUsecase['listTasks'] => async (user, props) => {
  return await repository.listTasks({
    ...props,
    userId: user.id,
  })
}

export const useTaskUsecase = (repository: TaskRepository): TaskUsecase => ({
  createTask: createTask(repository),
  getTask: getTask(repository),
  updateTask: updateTask(repository),
  deleteTask: deleteTask(repository),
  listTasks: listTasks(repository),
})
