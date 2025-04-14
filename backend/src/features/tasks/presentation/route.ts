import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { validator as zValidator } from 'hono-openapi/zod'
import { z } from 'zod'

import { TaskPriorities } from '@/features/tasks/domain/entity'
import type { TaskUsecase } from '@/features/tasks/domain/usecase'
import { useTaskUsecase } from '@/features/tasks/domain/usecase'
import { useTaskRepositoryD1 } from '@/features/tasks/infrastructure/repositoryImpl'
import { userAuthMiddleware } from '@/features/users/presentation/middleware'

const taskUsecaseMiddleware = createMiddleware<{
  Bindings: Env
  Variables: { usecase: TaskUsecase }
}>(async (c, next) => {
  const repo = useTaskRepositoryD1(c.env.D1)
  const usecase = useTaskUsecase(repo)
  c.set('usecase', usecase)
  await next()
})

const app = new Hono<{ Bindings: Env }>()
  .use(userAuthMiddleware)
  .use(taskUsecaseMiddleware)
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        key: z.enum(['id', 'due', 'priority']).default('due'),
        order: z.enum(['asc', 'desc']).default('desc'),
        limit: z.string().pipe(z.coerce.number().min(1).int()).default('20'),
        offset: z.string().pipe(z.coerce.number().min(0).int()).optional(),
      }),
    ),
    async (c) => {
      const {
        key, order, limit, offset,
      } = c.req.valid('query')

      const items = await c.var.usecase.listTasks(c.get('user'), {
        sortBy: key,
        order,
        limit,
        offset,
      })
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

      const created = await c.var.usecase.createTask(c.get('user'), taskData)
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

      const stored = await c.var.usecase.getTask(c.get('user'), id)
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
    zValidator(
      'param',
      z.object({ id: z.string().ulid() }),
    ),
    async (c) => {
      const id = c.req.valid('param').id
      const taskData = c.req.valid('json')

      const updateResult = await c.var.usecase.updateTask(c.get('user'), id, taskData)
      if (updateResult === undefined) {
        return c.json({
          error: `no such task with id ${id}`,
          ok: false,
        }, 404)
      }
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

      const deleted = await c.var.usecase.deleteTask(c.get('user'), id)
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
