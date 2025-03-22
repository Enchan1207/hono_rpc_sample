import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config'

const migrationRelPath = 'src/infrastructure/migrations'

const migrations = await readD1Migrations(`${__dirname}/${migrationRelPath}`)

export default defineWorkersConfig({
  resolve: { alias: { '@': `${__dirname}/src` } },
  test: {
    globals: true,
    setupFiles: [
      `${migrationRelPath}/apply_d1.ts`,
      'src/vitest.setup.ts',
    ],
    poolOptions: {
      workers: {
        main: 'src/presentations/index.ts',
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
