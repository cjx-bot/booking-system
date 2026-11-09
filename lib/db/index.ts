import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/lib/generated/prisma/client'

/**
 * Prisma 7 必须显式传 driver adapter，不再从 schema 的 url 自动连接。
 * 换成 PostgreSQL 时：装 @prisma/adapter-pg，这里换成 PrismaPg 即可。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      '缺少环境变量 DATABASE_URL。复制 .env.example 为 .env 后重试。',
    )
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  })
}

// 开发期热更新会反复执行模块顶层代码，不缓存会耗尽连接
export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
