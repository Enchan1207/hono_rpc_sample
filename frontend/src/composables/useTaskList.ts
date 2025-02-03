import {
  ref, toValue, watch,
} from 'vue'
import type { Ref } from 'vue'
import type { TaskListItem } from '@/entities/task'
import { deleteTask, listTask } from '@/repositories/taskRepository'

type ListTaskParams = Parameters<typeof listTask>[0]

export const useTaskList = (props: {
  key: Ref<ListTaskParams['key']>
  order: Ref<ListTaskParams['order']>
  itemPerPage: Ref<number>
}) => {
  const isLoading = ref(true)

  const tasks = ref<TaskListItem[]>([])
  const error = ref<Error>()

  const limit = ref<number>(toValue(props.itemPerPage))
  const offset = ref<number>(0)
  const hasNext = ref<boolean>(true)

  const next = async () => {
    isLoading.value = true
    error.value = undefined

    const fetchedTasks = await listTask({
      key: toValue(props.key),
      order: toValue(props.order),
      limit: limit.value,
      offset: offset.value,
    })
    tasks.value.push(...fetchedTasks)
    offset.value += fetchedTasks.length
    hasNext.value = fetchedTasks.length > 0
    isLoading.value = false
  }

  const reload = async () => {
    tasks.value = []
    limit.value = toValue(props.itemPerPage)
    offset.value = 0
    hasNext.value = true
    await next()
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

  watch([props.key, props.order, props.itemPerPage], async () => {
    await reload()
  }, { immediate: true })

  return {
    tasks,
    isLoading,
    error,
    next,
    reload,
    hasNext,
    remove,
  }
}
