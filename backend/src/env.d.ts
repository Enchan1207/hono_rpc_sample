interface Env {
  D1: D1Database
  FRONTEND_URL: string | string[]
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env { TEST_MIGRATIONS: D1Migration[] }
}
