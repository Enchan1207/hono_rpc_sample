import { Miniflare } from 'miniflare'

const miniflare = new Miniflare({
  d1Databases: { DB: 'f1f9bbae-f053-4de7-a05d-0462b76185fe' },
  scriptPath: 'routes/index.ts',
})

export const db = await miniflare.getD1Database('D1')
