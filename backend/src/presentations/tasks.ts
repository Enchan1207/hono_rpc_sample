import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { TaskPriorities } from '@/domain/entities/task'
import { useTaskRepositoryD1 } from '@/infrastructure/repositories/taskRepository'
import { useTaskUsecase } from '@/usecases/taskUsecase'

const app = new Hono<{ Bindings: Env }>()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        key: z.enum(['id', 'due', 'priority']).default('due'),
        order: z.enum(['asc', 'desc']).default('desc'),
        limit: z.number().optional().default(30),
        offset: z.number().optional(),
      }),
    ),
    async (c) => {
      const {
        key, order, limit, offset,
      } = c.req.valid('query')

      const repo = useTaskRepositoryD1(c.env.D1)
      const usecase = useTaskUsecase(repo)
      const items = await usecase.listTasks(key, order, limit, offset)
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
      const usecase = useTaskUsecase(repo)
      const created = await usecase.createTask(taskData)
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
      const usecase = useTaskUsecase(repo)
      const stored = await usecase.getTask(id)
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
      const taskData = c.req.valid('json')

      const repo = useTaskRepositoryD1(c.env.D1)
      const usecase = useTaskUsecase(repo)
      const updateResult = await usecase.updateTask(id, taskData)
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
      const usecase = useTaskUsecase(repo)

      const deleted = await usecase.deleteTask(id)
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
