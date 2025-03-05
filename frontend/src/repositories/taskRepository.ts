import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'

import type { Task, TaskListItem } from '@/entities/task'
import dayjs from '@/logic/dayjs'

import { client } from './client'
import { NetworkError, NoSuchItemError } from './errors'

export const listTask = async (
  token: string,
  query: {
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
    }, { headers: { Authorization: `Bearer ${token}` } })

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

export const addTask = async (token: string, task: Omit<Task, 'id'>): Promise<Result<Task, NetworkError>> => {
  try {
    const response = await client.task.$post({
      json: {
        ...task,
        due: task.due.utc().valueOf(),
      },
    }, { headers: { Authorization: `Bearer ${token}` } })

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

export const getTask = async (token: string, id: TaskListItem['id']):
Promise<Result<Task, NoSuchItemError | NetworkError>> => {
  try {
    const response = await client.task[':id'].$get({ param: { id } },
      { headers: { Authorization: `Bearer ${token}` } })
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

export const updateTask = async (token: string, props: {
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
    }, { headers: { Authorization: `Bearer ${token}` } })
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

export const deleteTask = async (token: string, id: Task['id']):
Promise<Result<Task, NoSuchItemError | NetworkError>> => {
  try {
    const response = await client.task[':id'].$delete({ param: { id } },
      { headers: { Authorization: `Bearer ${token}` } })
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
