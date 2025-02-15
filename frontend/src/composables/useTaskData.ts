import { ref } from 'vue'
import { err } from 'neverthrow'
import type { Result } from 'neverthrow'
import type { Task } from '@/entities/task'
import {
  deleteTask, getTask, updateTask,
} from '@/repositories/taskRepository'

export const useTaskData = (id: Task['id']) => {
  const isLoading = ref(true)

  const task = ref<Task>()

  const error = ref<Error>()

  const fetchData = async (id: Task['id']) => {
    isLoading.value = true
    const fetchResult = await getTask(id)
    fetchResult.match((fetchedTask) => {
      error.value = undefined
      task.value = fetchedTask
    }, (fetchError) => {
      error.value = fetchError
      task.value = undefined
    })
    isLoading.value = false
  }

  const update = async (input: Omit<Task, 'id'>): Promise<Result<Task, Error>> => {
    const exist = task.value
    if (exist === undefined) {
      return err(new Error('update() invoked before fetch completed'))
    }

    isLoading.value = true
    const result = await updateTask({
      exist,
      input,
    })
    isLoading.value = false
    return result
  }

  const remove = async (): Promise<Result<Task, Error>> => {
    isLoading.value = true
    const result = await deleteTask(id)
    isLoading.value = false
    return result
  }

  fetchData(id)

  return {
    task,
    isLoading,
    error,
    update,
    remove,
  }
}
