interface Env { D1: D1Database }

declare module 'cloudflare:test' {
  interface ProvidedEnv extends Env { TEST_MIGRATIONS: D1Migration[] }
}
