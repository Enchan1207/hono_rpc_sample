import { err, ok } from 'neverthrow'
import type { Result } from 'neverthrow'
import { client } from './client'
import { NoSuchItemError, NetworkError } from './errors'
import dayjs from '@/logic/dayjs'
import type { Task, TaskListItem } from '@/entities/task'

export const listTask = async (query: {
  key?: 'id' | 'due' | 'priority'
  order?: 'desc' | 'asc'
  limit?: number
  offset?: number
}): Promise<Result<TaskListItem[], NetworkError>> => {
  try {
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
    return ok(tasks)
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}

export const addTask = async (task: Omit<Task, 'id'>): Promise<Result<Task, NetworkError>> => {
  try {
    const response = await client.task.$post({
      json: {
        ...task,
        due: task.due.utc().valueOf(),
      },
    })

    const newTaskData = await response.json()
    return ok({
      ...newTaskData,
      due: dayjs(newTaskData.due),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}

export const getTask = async (id: TaskListItem['id']):
Promise<Result<Task, NoSuchItemError | NetworkError>> => {
  try {
    const response = await client.task[':id'].$get({ param: { id } })
    if (!response.ok) {
      return err(new NoSuchItemError(id))
    }

    const taskData = await response.json()
    return ok({
      ...taskData,
      due: dayjs(taskData.due),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}

export const updateTask = async (props: {
  exist: Task
  input: Partial<Omit<Task, 'id'>>
}): Promise<Result<Task, NoSuchItemError | NetworkError>> => {
  try {
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
      return err(new NoSuchItemError(props.exist.id))
    }

    const updatedTask = await response.json()
    return ok({
      ...updatedTask,
      due: dayjs(updatedTask.due),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}

export const deleteTask = async (id: Task['id']):
Promise<Result<Task, NoSuchItemError | NetworkError>> => {
  try {
    const response = await client.task[':id'].$delete({ param: { id } })
    if (!response.ok) {
      return err(new NoSuchItemError(id))
    }

    const deletedTaskData = await response.json()
    return ok({
      ...deletedTaskData,
      due: dayjs(deletedTaskData.due),
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return err(new NetworkError(message))
  }
}
