// NOTE: バックエンドは極力importしない
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import type { AppType } from '@routes/index'
import { hc } from 'hono/client'

const env = import.meta.env
export const client = hc<AppType>(env.VITE_BACKEND_URL)
