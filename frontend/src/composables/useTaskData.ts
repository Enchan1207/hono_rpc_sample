import { ref } from 'vue'
import type { Task } from '@/entities/task'
import { getTask } from '@/repositories/taskRepository'

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

  fetchData(id)

  return {
    task,
    isLoading,
    error,
  }
}
