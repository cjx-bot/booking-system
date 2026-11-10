import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

/**
 * Prisma 的 provider 不能运行时切换，只能靠构建时选文件。
 * 本地开发走 SQLite（双击即用，不依赖任何外部服务），
 * 生产（Netlify）走 Postgres——serverless 的文件系统只读且不持久，SQLite 存不住。
 *
 * 两份 schema 内容必须一致，只有 datasource 的 provider 不同。
 */
const usePostgres = process.env.DATABASE_PROVIDER === 'postgres'

export default defineConfig({
  schema: usePostgres ? 'prisma/postgres.prisma' : 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
