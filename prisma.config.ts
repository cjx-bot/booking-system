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

/**
 * 连接串优先级与 lib/db/index.ts 保持一致：
 * Netlify 注入的 NETLIFY_DB_URL（owner，可写）优先，其次本地 .env 的 DATABASE_URL。
 * 顺序反了，构建期的 db push 会打到本地 SQLite 上。
 */
const databaseUrl =
  process.env.NETLIFY_DB_URL ??
  process.env.DATABASE_URL ??
  process.env.NETLIFY_DATABASE_URL

export default defineConfig({
  schema: usePostgres ? 'prisma/postgres.prisma' : 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // 本地只跑 generate 时可以没有连接串
    url: databaseUrl ?? env('DATABASE_URL'),
  },
})
