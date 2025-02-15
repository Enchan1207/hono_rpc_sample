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

    const fetchResult = await listTask({
      key: toValue(props.key),
      order: toValue(props.order),
      limit: limit.value,
      offset: offset.value,
    })

    fetchResult.match((fetchedTasks) => {
      tasks.value.push(...fetchedTasks)
      offset.value += fetchedTasks.length
      hasNext.value = fetchedTasks.length > 0
    }, (fetchError) => {
      error.value = fetchError
    })
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
    const deletionResult = await deleteTask(id)
    deletionResult.match((deletedTask) => {
      // ローカルのtasksを全部洗い直すのはやばいので、filterで消す
      tasks.value = tasks.value.filter(task => task.id !== deletedTask.id)
    }, (deleteError) => {
      error.value = deleteError
    })
    isLoading.value = false
  }

  watch([props.key, props.order, props.itemPerPage], async (_, prevValue) => {
    // prevValueがある = 初回でないと判断、ロード中ならpreventする
    if (prevValue.length > 0 && isLoading.value) {
      return
    }

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
