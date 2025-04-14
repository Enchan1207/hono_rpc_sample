import type { D1Database } from '@cloudflare/workers-types'

import type {
  Task, TaskPriority,
  TaskSummary,
} from '@/features/tasks/domain/entity'
import type { TaskRepository } from '@/features/tasks/domain/repository'
import { TaskRecord, TaskSummaryRecord } from '@/features/tasks/infrastructure/entity'
import { condition } from '@/logic/queryBuilder/conditionTree'
import { d1 } from '@/logic/queryBuilder/d1'

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

const makeTask = ({
  id, user_id: userId, title, due, description, priority,
}: TaskRecord): Task => ({
  id,
  userId,
  title,
  due,
  priority: reversePriorityMap[priority] ?? 'low',
  description,
})

const makeTaskRecord = ({
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
  const stmt = d1(db)
    .select(TaskRecord, 'tasks')
    .where(condition('id', '==', id))
    .build()
  return stmt.first<TaskRecord>().then(item => item === null ? undefined : makeTask(item))
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
  const entity = makeTaskRecord(newTask)

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
  const baseStmt = d1(db)
    .select(TaskSummaryRecord, 'tasks')
    .orderBy(sortBy, order)
    .limit(limit, offset)

  const orderStmt = sortBy === 'id' ? baseStmt : baseStmt.orderBy('id')

  const stmt = userId ? orderStmt.where(condition('user_id', '==', userId)) : orderStmt

  return stmt.build().all<TaskSummaryRecord>().then(({ results }) => results.map(entity => makeTaskSummary(entity)))
}

export const useTaskRepositoryD1 = (db: D1Database): TaskRepository => {
  return {
    getTask: getTask(db),
    saveTask: saveTask(db),
    deleteTask: deleteTask(db),
    listTasks: listTasks(db),
  }
}
