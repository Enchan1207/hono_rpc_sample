import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'
import { z } from 'zod'
import { TaskPriorities, type Task } from '@/resource/task'
import {
  deleteTask,
  getTask,
  listTasks,
  saveTask,
} from '@/repository/taskRepository'

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        key: z.enum(['id', 'limit', 'priority']).default('limit'),
        order: z.enum(['asc', 'desc']).default('desc'),
      }),
    ),
    (c) => {
      const { key, order } = c.req.valid('query')
      const items = listTasks(key, order)
      return c.json(items)
    },
  )
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        title: z.string(),
        limit: z.coerce.date().default(new Date()),
        priority: z.enum(TaskPriorities),
        description: z.string(),
      }),
    ),
    (c) => {
      const taskData = c.req.valid('json')
      const insertResult = saveTask({
        id: ulid(),
        ...taskData,
      })
      return c.json(insertResult, 201)
    },
  )
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({ id: z.string().ulid() }),
    ),
    (c) => {
      const id = c.req.valid('param').id
      const storedTask = getTask(id)
      if (storedTask === undefined) {
        return c.notFound()
      }
      return c.json(storedTask)
    },
  )
  .put(
    '/:id',
    zValidator(
      'json',
      z.object({
        title: z.string().optional(),
        limit: z.coerce.date().optional(),
        priority: z.enum(TaskPriorities).optional(),
        description: z.string().optional(),
      }),
    ),
    (c) => {
      // paramとjsonとを同時にvalidateできないか?
      const id = z.string().ulid().safeParse(c.req.param('id')).data
      if (id === undefined) {
        return c.notFound()
      }

      const storedTask = getTask(id)
      if (storedTask === undefined) {
        return c.notFound()
      }

      const taskData = c.req.valid('json')
      const updatedTask: Task = {
        ...storedTask,
        ...taskData,
      }
      const updateResult = saveTask(updatedTask)
      return c.json(updateResult, 200)
    },
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({ id: z.string().ulid() }),
    ),
    (c) => {
      const id = c.req.valid('param').id
      if (getTask(id) === undefined) {
        return c.notFound()
      }
      const deletedTask = deleteTask(id)
      return c.json(deletedTask, 200)
    },
  )

export default app
