import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

/**
 * Prisma 7 必须显式传 driver adapter，不再从 schema 的 url 自动连接。
 *
 * 后端由连接串本身决定，而不是另设一个 DATABASE_PROVIDER：
 * 少一个必须与 DATABASE_URL 保持同步的环境变量，就少一种「配错了才发现」的可能。
 * （DATABASE_PROVIDER 仍然存在，但它只用来给 prisma generate 选 schema 文件。）
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      '缺少环境变量 DATABASE_URL。复制 .env.example 为 .env 后重试。',
    )
  }

  const adapter = url.startsWith('postgres')
    ? new PrismaPg({ connectionString: url })
    : new PrismaBetterSqlite3({ url })

  return new PrismaClient({
    adapter,
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
