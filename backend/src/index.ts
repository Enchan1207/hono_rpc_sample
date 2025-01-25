import { Hono } from 'hono';
import { cors } from 'hono/cors';
import tasks from '@/routes/tasks';

const app = new Hono();
app.use('/task/*', cors());

// eslint-disable-next-line unusedImport/no-unused-vars
const routes = app.route('/task', tasks);

export default app;
export type AppType = typeof routes;
