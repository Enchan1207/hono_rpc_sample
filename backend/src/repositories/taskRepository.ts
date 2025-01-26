import { compare } from '@/logic/compare'
import { TaskPriorityLevelMap } from '@/entities/task'
import type { Task } from '@/entities/task'

// in-memory storage
const tasks = new Map<Task['id'], Task>()

export const getTask = (id: Task['id']): Task | undefined => {
  return tasks.get(id)
}

export const saveTask = (newTask: Task): Task => {
  tasks.set(newTask.id, newTask)
  return newTask
}

export const deleteTask = (id: Task['id']): Task | undefined => {
  const storedTask = tasks.get(id)
  if (storedTask === undefined) {
    return undefined
  }
  tasks.delete(id)
  return storedTask
}

export type TaskListItem = Omit<Task, 'description'>

/**
 * 条件をもとにタスクリストのソート関数を構築する
 * @param sortBy ソート対象のキー
 * @param order 昇順・降順
 * @returns ソート関数
 */
const buildTaskListItemSortFunction = (
  sortBy: keyof Pick<Task, 'id' | 'limit' | 'priority'>,
  order: 'asc' | 'desc',
): ((lhs: TaskListItem, rhs: TaskListItem) => number) => {
  if (sortBy === 'limit') {
    // 同じ期限ならIDで比較する
    return compare<TaskListItem>(
      sortBy,
      order,
      compare<TaskListItem>('id', order),
    )
  }

  if (sortBy === 'priority') {
    return (lhs, rhs) => {
      const lpr = lhs.priority
      const rpr = rhs.priority
      if (lpr === rpr) {
        // 同じ優先度ならIDで比較する
        return compare<TaskListItem>('id', order)(lhs, rhs)
      }

      // 優先度は数値に変換して比較する
      const lprLevel = TaskPriorityLevelMap[lpr]
      const rprLevel = TaskPriorityLevelMap[rpr]
      const direction = order === 'asc' ? 1 : -1
      return (lprLevel > rprLevel ? 1 : -1) * direction
    }
  }

  return compare<TaskListItem>(sortBy, order)
}

export const listTasks = (
  sortBy: keyof Pick<Task, 'id' | 'limit' | 'priority'>,
  order: 'asc' | 'desc',
): TaskListItem[] => {
  const taskListData: TaskListItem[] = Array.from(tasks.values()).map(
    ({
      id, title, limit, priority,
    }) => ({
      id,
      title,
      limit,
      priority,
    }),
  )

  const sortFunction = buildTaskListItemSortFunction(sortBy, order)
  return taskListData.toSorted(sortFunction)
}
