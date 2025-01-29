import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'
import { z } from 'zod'
import { TaskPriorities } from '@/entities/task'
import type { Task } from '@/entities/task'
import {
  deleteTask,
  getTask,
  listTasks,
  saveTask,
} from '@/repositories/taskRepository'

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        key: z.enum(['id', 'due', 'priority']).default('due'),
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
        due: z.number(),
        priority: z.enum(TaskPriorities),
        description: z.string(),
      }),
    ),
    (c) => {
      const taskData = c.req.valid('json')
      const created = saveTask({
        id: ulid(),
        ...taskData,
      })
      return c.json(created, 201)
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
      const stored = getTask(id)
      if (stored === undefined) {
        return c.json({
          error: `no such task with id ${id}`,
          ok: false,
        }, 404)
      }
      return c.json(stored)
    },
  )
  .put(
    '/:id',
    zValidator(
      'json',
      z.object({
        title: z.string().optional(),
        due: z.number().optional(),
        priority: z.enum(TaskPriorities).optional(),
        description: z.string().optional(),
      }),
    ),
    (c) => {
      // paramとjsonとを同時にvalidateできないか?
      const id = z.string().ulid().safeParse(c.req.param('id')).data
      if (id === undefined) {
        return c.json({
          error: 'Please specify task id',
          ok: false,
        }, 400)
      }

      const storedTask = getTask(id)
      if (storedTask === undefined) {
        return c.json({
          error: `no such task with id ${id}`,
          ok: false,
        }, 404)
      }

      const taskData = c.req.valid('json')
      const updated: Task = {
        ...storedTask,
        ...taskData,
      }
      const updateResult = saveTask(updated)
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
      const deleted = deleteTask(id)
      if (deleted === undefined) {
        return c.json({
          error: `no such task with id ${id}`,
          ok: false,
        }, 404)
      }
      return c.json(deleted, 200)
    },
  )

export default app
