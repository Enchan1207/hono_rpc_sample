import {
  ref, toValue, watchEffect,
} from 'vue'
import type { Ref } from 'vue'
import type { TaskListItem } from '@/entities/task'
import { deleteTask, listTask } from '@/repositories/taskRepository'

type ListTaskParams = Parameters<typeof listTask>[0]
type Referencable<T> = Ref<T> | T

export const useTaskList = (props: {
  key: Referencable<ListTaskParams['key']>
  order: Referencable<ListTaskParams['order']>
}) => {
  const isLoading = ref(true)

  const tasks = ref<TaskListItem[]>([])
  const error = ref<Error>()

  // TODO: 今は想定していないけど、ページングする時のことを考えてnextにしている
  const next = async () => {
    isLoading.value = true
    error.value = undefined

    const fetchedTasks = await listTask({
      key: toValue(props.key),
      order: toValue(props.order),
    })
    tasks.value = fetchedTasks
    isLoading.value = false
  }

  const remove = async (id: TaskListItem['id']) => {
    isLoading.value = true
    const result = await deleteTask(id)
    if (result === undefined) {
      error.value = new Error('No such item')
      isLoading.value = false
      return
    }

    // ローカルのtasksを全部洗い直すのはやばいので、filterで消す
    tasks.value = tasks.value.filter(task => task.id !== result.id)
    isLoading.value = false
  }

  watchEffect(() => {
    // keyかorderが変わった時はリストをクリアする このとき、重複ロードしないように
    if (!isLoading.value) {
      tasks.value = []
      next()
    }
  })

  return {
    tasks,
    isLoading,
    error,
    next,
    remove,
  }
}
