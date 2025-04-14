import { Hono } from 'hono'

import tasks from '@/features/tasks/presentation/route'
import users from '@/features/users/presentation/route'
import { corsMiddleware } from '@/logic/middlewares/cors'

const app = new Hono()
  .use(corsMiddleware)
  .route('/task', tasks)
  .route('/user', users)

export default app
export type AppType = typeof app
