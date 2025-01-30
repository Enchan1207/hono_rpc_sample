import type { D1Database } from '@cloudflare/workers-types'
import { compare } from '@/logic/compare'
import { TaskPriorityLevelMap } from '@/domain/entities/task'
import type { Task } from '@/domain/entities/task'
import type {
  TaskRepository,
  TaskListItem,
} from '@/domain/repositories/taskRepository'

// in-memory storage
const tasks = new Map<Task['id'], Task>()

const getTask = (db: D1Database): TaskRepository['getTask'] =>
  async (id: Task['id']) => {
    const stmt = 'SELECT id, title, due, priority, description FROM tasks WHERE id=?'
    const result = await db.prepare(stmt).bind(id).first<Task>()
    return result ?? undefined
  }

const saveTask = (db: D1Database): TaskRepository['saveTask'] =>
  async (newTask: Task) => {
    const stmt = 'INSERT INTO tasks VALUES (?,?,?,?,?)'
    // FIXME: UPSERTにしないといかんのでは
    await db.prepare(stmt).bind(newTask).run()
    return newTask
  }

const deleteTask = (db: D1Database): TaskRepository['deleteTask'] =>
  async (id: Task['id']) => {
    const storedTask = await getTask(db)(id)
    if (storedTask === undefined) {
      return undefined
    }
    const stmt = 'DELETE FROM tasks WHERE id=?'
    await db.prepare(stmt).bind(id).run()
    return storedTask
  }

/**
 * 条件をもとにタスクリストのソート関数を構築する
 * @param sortBy ソート対象のキー
 * @param order 昇順・降順
 * @returns ソート関数
 */
const buildTaskListItemSortFunction = (
  sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
  order: 'asc' | 'desc',
): ((lhs: TaskListItem, rhs: TaskListItem) => number) => {
  if (sortBy === 'due') {
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

const listTasks = (db: D1Database): TaskRepository['listTasks'] => async (
  sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
  order: 'asc' | 'desc',
) => {
  // NOTE: この中でdbを使ってクエリする
  console.log(db)
  const taskListData: TaskListItem[] = Array.from(tasks.values()).map(
    ({
      id, title, due, priority,
    }) => ({
      id,
      title,
      due,
      priority,
    }),
  )

  const sortFunction = buildTaskListItemSortFunction(sortBy, order)
  return taskListData.toSorted(sortFunction)
}

export const useTaskRepositoryD1 = (db: D1Database): TaskRepository => {
  return {
    getTask: getTask(db),
    saveTask: saveTask(db),
    deleteTask: deleteTask(db),
    listTasks: listTasks(db),
  }
}
