import { Hono } from 'hono'

import { userAuthMiddleware } from '@/logic/middlewares/auth'

const app = new Hono<{ Bindings: Env }>()
  .use(userAuthMiddleware)
  .get('/me', (c) => {
    const user = c.get('user')
    return c.json(user)
  })

export default app
