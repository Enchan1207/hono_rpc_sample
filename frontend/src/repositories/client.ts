// NOTE: バックエンドは極力importしない
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { AppType } from '@routes/index'
import { hc } from 'hono/client'

// TODO: unify backend URL
export const client = hc<AppType>('http://localhost:3000/')
