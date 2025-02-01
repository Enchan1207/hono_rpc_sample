import type { D1Database } from '@cloudflare/workers-types'
import type { Task } from '@/domain/entities/task'
import type {
  TaskListItem,
  TaskRepository,
} from '@/domain/repositories/taskRepository'

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
    await db.prepare(stmt).bind(
      newTask.id,
      newTask.title,
      newTask.due,
      newTask.priority,
      newTask.description,
    ).run()
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

const listTasks = (db: D1Database): TaskRepository['listTasks'] => async (
  sortBy: keyof Pick<Task, 'id' | 'due' | 'priority'>,
  order: 'asc' | 'desc',
  limit: number,
  offset?: number,
) => {
  // build query
  const query = `SELECT id, title, due, priority 
    FROM tasks
    ORDER BY ${sortBy} ${order === 'asc' ? 'ASC' : 'DESC'}
    LIMIT ?
    ${offset ? 'OFFSET ?' : ''}
  `

  const stmt = db.prepare(query)
  const bound = offset !== undefined
    ? stmt.bind(limit, offset)
    : stmt.bind(limit)
  const results = await bound.run<TaskListItem>()
  return results.results
}

export const useTaskRepositoryD1 = (db: D1Database): TaskRepository => {
  return {
    getTask: getTask(db),
    saveTask: saveTask(db),
    deleteTask: deleteTask(db),
    listTasks: listTasks(db),
  }
}
