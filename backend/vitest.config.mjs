import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config'

const migrations = await readD1Migrations(`${__dirname}/migrations`)

export default defineWorkersConfig({
  resolve: { alias: { '@': `${__dirname}/src` } },
  test: {
    setupFiles: [
      'src/apply_d1_migrations.ts',
    ],
    poolOptions: {
      workers: {
        main: 'src/routes/index.ts',
        miniflare: {
          d1Databases: ['D1'],
          // NOTE: テスト用のマイグレーションを定義
          bindings: { TEST_MIGRATIONS: migrations },
        },
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
})
