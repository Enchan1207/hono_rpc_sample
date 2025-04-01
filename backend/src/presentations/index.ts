import { Hono } from 'hono'

import tasks from '@/presentations/tasks'
import users from '@/presentations/users'

import { corsMiddleware } from './middlewares/cors'

const app = new Hono()
  .use(corsMiddleware)
  .route('/task', tasks)
  .route('/user', users)

export default app
export type AppType = typeof app
