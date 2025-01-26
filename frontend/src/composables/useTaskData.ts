import { ref } from 'vue'
import type { Task } from '@/entities/task'
import { getTask } from '@/repositories/taskRepository'

export const useTaskData = (id: Task['id']) => {
  const isLoading = ref(true)

  // TODO: ここってResultだったりしないか
  const task = ref<Task>()
  const error = ref<Error>()

  const fetchData = async (id: Task['id']) => {
    isLoading.value = true
    error.value = undefined

    const fetchedTask = await getTask(id)
    if (fetchedTask === undefined) {
      error.value = new Error(`no such task with id ${id}`)
      task.value = undefined
      isLoading.value = false
      return
    }
    task.value = fetchedTask
    isLoading.value = false
  }

  fetchData(id)

  return {
    task,
    isLoading,
    error,
  }
}
