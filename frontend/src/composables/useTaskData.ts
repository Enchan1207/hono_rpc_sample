import { ref } from 'vue'
import type { Task } from '@/entities/task'
import {
  deleteTask, getTask, updateTask,
} from '@/repositories/taskRepository'

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

  const update = async (input: Omit<Task, 'id'>) => {
    error.value = undefined

    const exist = task.value
    if (exist === undefined) {
      error.value = new Error('update() invoked before fetch completed')
      return
    }

    isLoading.value = true

    const updatedTask = await updateTask({
      exist,
      input,
    })
    if (updatedTask === undefined) {
      error.value = new Error(`no such task with id ${id}`)
      task.value = undefined
      isLoading.value = false
      return
    }
    task.value = updatedTask
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
