import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'
import { z } from 'zod'
import { TaskPriorities } from '@/domain/entities/task'
import type { Task } from '@/domain/entities/task'
import { useTaskRepositoryD1 } from '@/infrastructure/repositories/taskRepository'

const app = new Hono<{ Bindings: Env }>()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        key: z.enum(['id', 'due', 'priority']).default('due'),
        order: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().optional().default(30),
      }),
    ),
    async (c) => {
      const {
        key, order, limit,
      } = c.req.valid('query')
      const repo = useTaskRepositoryD1(c.env.D1)
      const items = await repo.listTasks(key, order, limit)
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
    async (c) => {
      const taskData = c.req.valid('json')
      const repo = useTaskRepositoryD1(c.env.D1)
      const created = await repo.saveTask({
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
    async (c) => {
      const id = c.req.valid('param').id
      const repo = useTaskRepositoryD1(c.env.D1)
      const stored = await repo.getTask(id)
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
    async (c) => {
      // paramとjsonとを同時にvalidateできないか?
      const id = z.string().ulid().safeParse(c.req.param('id')).data
      if (id === undefined) {
        return c.json({
          error: 'Please specify task id',
          ok: false,
        }, 400)
      }

      const repo = useTaskRepositoryD1(c.env.D1)
      const storedTask = await repo.getTask(id)
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
      const updateResult = await repo.saveTask(updated)
      return c.json(updateResult, 200)
    },
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({ id: z.string().ulid() }),
    ),
    async (c) => {
      const id = c.req.valid('param').id
      const repo = useTaskRepositoryD1(c.env.D1)
      const deleted = await repo.deleteTask(id)
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
