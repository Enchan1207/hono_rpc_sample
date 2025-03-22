import { Hono } from 'hono'

import tasks from '@/presentations/tasks'

import { corsMiddleware } from './middlewares/cors'

const app = new Hono()
  .use(corsMiddleware)
  .route('/task', tasks)

export default app
export type AppType = typeof app
