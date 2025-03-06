interface Env {
  D1: D1Database
  CORS_ALLOW_ORIGINS: string | string[]
  AUTH_DOMAIN: string
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env { TEST_MIGRATIONS: D1Migration[] }
}
