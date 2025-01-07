import type { AppType } from '@backend/index';
import { hc } from 'hono/client';

// TODO: unify backend URL
export const client = hc<AppType>('http://localhost:3000/');
