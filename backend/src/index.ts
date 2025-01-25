import { Hono } from 'hono'
import { cors } from 'hono/cors'
import tasks from '@/routes/tasks'

const app = new Hono()
app.use('/task/*', cors())

app.route('/task', tasks)

export default app
export type AppType = typeof app
