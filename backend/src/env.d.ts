interface Env {
  D1: D1Database
  CORS_ALLOW_ORIGINS: string | string[]
  AUTH_DOMAIN: string
  AUTH_AUDIENCE: string
}

declare module 'cloudflare:test' {
  import type { SignatureKey } from 'hono/utils/jwt/jws'

  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[]

    /** テスト用の秘密鍵 */
    TEST_PRIVATE_KEY: SignatureKey
  }
}
