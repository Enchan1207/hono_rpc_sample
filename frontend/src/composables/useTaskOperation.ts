import type { Result } from 'neverthrow'
import { err } from 'neverthrow'
import { ref } from 'vue'

import type { AccessTokenProvider } from '@/auth'
import type { Task } from '@/entities/task'
import { deleteTask, updateTask } from '@/repositories/taskRepository'

export const useTaskOperation = (tokenProvider: AccessTokenProvider) => {
  const isOperating = ref(false)

  const update = async ({ exist, input }: {
    exist: Task
    input: Omit<Task, 'id'>
  }): Promise<Result<Task, Error>> => {
    if (isOperating.value) {
      return err(new Error('Now processing'))
    }
    isOperating.value = true
    const token = await tokenProvider()
    const result = await updateTask(token, {
      exist,
      input,
    })
    isOperating.value = false
    return result
  }

  const remove = async (id: Task['id']): Promise<Result<Task, Error>> => {
    if (isOperating.value) {
      return err(new Error('Now processing'))
    }

    isOperating.value = true
    const token = await tokenProvider()
    const result = await deleteTask(token, id)
    isOperating.value = false
    return result
  }

  return {
    isOperating,
    update,
    remove,
  }
}
