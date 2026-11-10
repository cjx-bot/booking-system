import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

/**
 * Prisma 7 必须显式传 driver adapter，不再从 schema 的 url 自动连接。
 *
 * 后端由连接串本身决定，而不是另设一个 DATABASE_PROVIDER：
 * 少一个必须与 DATABASE_URL 保持同步的环境变量，就少一种「配错了才发现」的可能。
 * （DATABASE_PROVIDER 仍然存在，但它只用来给 prisma generate 选 schema 文件。）
 *
 * SQLite 的 adapter 用 require 延迟加载：better-sqlite3 是原生模块，
 * 在 Linux 的 serverless 环境里加载 Windows 编译的二进制会直接崩。
 * 生产走 Postgres 分支，压根不该碰它。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
  // Netlify Database 注入的是 NETLIFY_DATABASE_URL，本地上限用 DATABASE_URL。
  // 两个都读，省得在平台上再手工映射一次变量名。
  const url = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL
  if (!url) {
    throw new Error(
      '缺少环境变量 DATABASE_URL。复制 .env.example 为 .env 后重试。',
    )
  }

  let adapter

  if (url.startsWith('postgres')) {
    adapter = new PrismaPg({ connectionString: url })
  } else {
    // 只有本地 SQLite 才会走到这里
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    adapter = new PrismaBetterSqlite3({ url })
  }

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
