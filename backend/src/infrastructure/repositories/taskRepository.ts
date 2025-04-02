import type { D1Database } from '@cloudflare/workers-types'

import type {
  Task, TaskPriority,
  TaskSummary,
} from '@/domain/entities/task'
import type { TaskRepository } from '@/domain/repositories/taskRepository'
import type { TaskRecord, TaskSummaryRecord } from '@/infrastructure/entities/task'

const priorityMap: Record<TaskPriority, number> = {
  high: 100,
  middle: 50,
  low: 0,
}

const reversePriorityMap: Record<number, TaskPriority> = {
  100: 'high',
  50: 'middle',
  0: 'low',
}

const makeTaskRecord = ({
  id, user_id: userId, title, due, description, priority,
}: TaskRecord): Task => ({
  id,
  userId,
  title,
  due,
  priority: reversePriorityMap[priority] ?? 'low',
  description,
})

const makeTask = ({
  id, userId: user_id, title, due, description, priority,
}: Task): TaskRecord => ({
  id,
  user_id,
  title,
  due,
  priority: priorityMap[priority],
  description,
})

const makeTaskSummary = ({
  id, user_id: userId, title, due, priority,
}: TaskSummaryRecord): TaskSummary => ({
  id,
  userId,
  title,
  due,
  priority: reversePriorityMap[priority] ?? 'low',
})

const getTask = (db: D1Database): TaskRepository['getTask'] => async (id) => {
  const stmt = 'SELECT id, user_id, title, due, priority, description FROM tasks WHERE id=?'
  const result = await db.prepare(stmt).bind(id).first<TaskRecord>()
  if (!result) {
    return undefined
  }
  return makeTaskRecord(result)
}

const saveTask = (db: D1Database): TaskRepository['saveTask'] => async (newTask) => {
  const stmt = `INSERT INTO tasks
      VALUES (?1,?2,?3,?4,?5,?6)
      ON CONFLICT (id) DO UPDATE SET
        title = ?3,
        due = ?4,
        priority = ?5,
        description = ?6
    `
  const entity = makeTask(newTask)

  await db.prepare(stmt).bind(
    entity.id,
    entity.user_id,
    entity.title,
    entity.due,
    entity.priority,
    entity.description,
  ).run()

  return newTask
}

const deleteTask = (db: D1Database): TaskRepository['deleteTask'] => async (id) => {
  const storedTask = await getTask(db)(id)
  if (storedTask === undefined) {
    return undefined
  }
  const stmt = 'DELETE FROM tasks WHERE id=?'
  await db.prepare(stmt).bind(id).run()
  return storedTask
}

const listTasks = (db: D1Database): TaskRepository['listTasks'] => async ({
  sortBy, order, limit, offset, userId,
}) => {
  // TODO: userIdで絞り込む
  // build query
  const query = `SELECT id, title, due, priority 
    FROM tasks
    ORDER BY ${sortBy} ${order === 'asc' ? 'ASC' : 'DESC'}
    ${sortBy !== 'id' ? ', id ASC' : ''}
    LIMIT ?
    ${offset !== undefined ? 'OFFSET ?' : ''}
  `

  const stmt = db.prepare(query)
  const bound = offset !== undefined
    ? stmt.bind(limit, offset)
    : stmt.bind(limit)
  const result = await bound.run<TaskSummaryRecord>()
  return result.results.map(entity => makeTaskSummary(entity))
}

export const useTaskRepositoryD1 = (db: D1Database): TaskRepository => {
  return {
    getTask: getTask(db),
    saveTask: saveTask(db),
    deleteTask: deleteTask(db),
    listTasks: listTasks(db),
  }
}
