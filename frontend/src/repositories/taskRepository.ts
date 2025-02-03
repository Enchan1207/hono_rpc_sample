import { client } from './client'
import dayjs from '@/logic/dayjs'
import type { Task, TaskListItem } from '@/entities/task'

// TODO: error handling or use `Result`

export const listTask = async (query: {
  key?: 'id' | 'due' | 'priority'
  order?: 'desc' | 'asc'
  limit?: number
  offset?: number
}): Promise<TaskListItem[]> => {
  const response = await client.task.$get({
    query: {
      ...query,
      limit: query.limit?.toString(),
      offset: query.offset?.toString(),
    },
  })
  const taskDatas = await response.json()
  const tasks: TaskListItem[] = taskDatas.map(task => ({
    ...task,
    due: dayjs(task.due),
  }))
  return tasks
}

export const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const response = await client.task.$post({
    json: {
      ...task,
      due: task.due.utc().valueOf(),
    },
  })

  const newTaskData = await response.json()
  return {
    ...newTaskData,
    due: dayjs(newTaskData.due),
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
    due: dayjs(taskData.due),
  }
}

export const updateTask = async (props: {
  exist: Task
  input: Partial<Omit<Task, 'id'>>
}): Promise<Task | undefined> => {
  const updatedData: Task = {
    ...props.exist,
    ...props.input,
  }
  const response = await client.task[':id'].$put({
    param: { id: props.exist.id },
    json: {
      title: updatedData.title,
      description: updatedData.description,
      due: updatedData.due.utc().valueOf(),
      priority: updatedData.priority,
    },
  })
  if (!response.ok) {
    return undefined
  }

  const updatedTask = await response.json()
  return {
    ...updatedTask,
    due: dayjs(updatedTask.due),
  }
}

export const deleteTask = async (id: Task['id']):
Promise<Task | undefined> => {
  const response = await client.task[':id'].$delete({ param: { id } })
  if (!response.ok) {
    return undefined
  }

  const deletedTaskData = await response.json()
  return {
    ...deletedTaskData,
    due: dayjs(deletedTaskData.due),
  }
}
