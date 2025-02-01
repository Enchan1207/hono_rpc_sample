import type { D1Database } from '@cloudflare/workers-types'
import type { TaskEntity, TaskListItemEntity } from '@/infrastructure/entities/task'
import type { TaskRepository } from '@/domain/repositories/taskRepository'
import type {
  Task, TaskListItem, TaskPriority,
} from '@/domain/entities/task'

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

const makeTask = (entity: TaskEntity): Task => ({
  ...entity,
  priority: reversePriorityMap[entity.priority] ?? 'low',
})

const makeTaskEntity = (task: Task): TaskEntity => ({
  ...task,
  priority: priorityMap[task.priority],
})

const makeTaskListItem = (entity: TaskListItemEntity): TaskListItem => ({
  ...entity,
  priority: reversePriorityMap[entity.priority] ?? 'low',
})

const getTask = (db: D1Database): TaskRepository['getTask'] =>
  async (id: Task['id']) => {
    const stmt = 'SELECT id, title, due, priority, description FROM tasks WHERE id=?'
    const result = await db.prepare(stmt).bind(id).first<TaskEntity>()
    if (!result) {
      return undefined
    }
    return makeTask(result)
  }

const saveTask = (db: D1Database): TaskRepository['saveTask'] =>
  async (newTask: Task) => {
    const stmt = `INSERT INTO tasks
      VALUES (?1,?2,?3,?4,?5)
      ON CONFLICT (id) DO UPDATE SET
        title = ?2,
        due = ?3,
        priority = ?4,
        description = ?5
    `
    const entity = makeTaskEntity(newTask)

    await db.prepare(stmt).bind(
      entity.id,
      entity.title,
      entity.due,
      entity.priority,
      entity.description,
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
    ${sortBy !== 'id' ? ', id ASC' : ''}
    LIMIT ?
    ${offset ? 'OFFSET ?' : ''}
  `

  const stmt = db.prepare(query)
  const bound = offset !== undefined
    ? stmt.bind(limit, offset)
    : stmt.bind(limit)
  const result = await bound.run<TaskListItemEntity>()
  return result.results.map(entity => makeTaskListItem(entity))
}

export const useTaskRepositoryD1 = (db: D1Database): TaskRepository => {
  return {
    getTask: getTask(db),
    saveTask: saveTask(db),
    deleteTask: deleteTask(db),
    listTasks: listTasks(db),
  }
}
