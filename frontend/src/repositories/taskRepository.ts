import { client } from './client'
import dayjs from '@/logic/dayjs'
import type { Task, TaskListItem } from '@/entities/task'

// TODO: error handling or use `Result`

export const listTask = async (query: {
  key?: 'id' | 'limit' | 'priority'
  order?: 'desc' | 'asc'
}): Promise<TaskListItem[]> => {
  const response = await client.task.$get({ query })
  const taskDatas = await response.json()
  const tasks: TaskListItem[] = taskDatas.map(task => ({
    ...task,
    limit: dayjs(task.limit),
  }))
  return tasks
}

export const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const response = await client.task.$post({
    json: {
      ...task,
      limit: task.limit.utc().valueOf(),
    },
  })

  const newTaskData = await response.json()
  return {
    ...newTaskData,
    limit: dayjs(newTaskData.limit),
  }
}

export const getTask = async (id: TaskListItem['id']):
Promise<Task | undefined> => {
  const response = await client.task[':id'].$get({ param: { id } })
  if (!response.ok) {
    return undefined
  }

  const taskData = await response.json()
  return {
    ...taskData,
    limit: dayjs(taskData.limit),
  }
}

// TODO: updateTask?

export const deleteTask = async (id: Task['id']):
Promise<Task['id'] | undefined> => {
  const response = await client.task[':id'].$delete({ param: { id } })
  if (!response.ok) {
    return undefined
  }

  return id

  // TODO: 本当はこうあるべき、バックエンドのrouter実装が正しくない
  /*
  const deletedTaskData = await response.json()
  return {
    ...deletedTaskData,
    limit: dayjs(deletedTaskData.limit),
  }
*/
}
