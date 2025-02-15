import { ref } from 'vue'
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

  const update = async (input: Omit<Task, 'id'>) => {
    const exist = task.value
    if (exist === undefined) {
      error.value = new Error('update() invoked before fetch completed')
      return
    }

    isLoading.value = true
    const updateResult = await updateTask({
      exist,
      input,
    })
    updateResult.match((updatedTask) => {
      error.value = undefined
      task.value = updatedTask
    }, (updateError) => {
      error.value = updateError
      task.value = undefined
    })
    isLoading.value = false
  }

  const remove = async () => {
    isLoading.value = true
    const result = await deleteTask(id)
    if (result === undefined) {
      error.value = new Error('No such item')
      isLoading.value = false
      return
    }
    isLoading.value = false
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
