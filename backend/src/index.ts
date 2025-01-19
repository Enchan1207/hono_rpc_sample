import { Hono } from 'hono';
import tasks from '@/routes/tasks';

const app = new Hono();

// eslint-disable-next-line unusedImport/no-unused-vars
const routes = app.route('/task', tasks);

export default app;
export type AppType = typeof routes;
