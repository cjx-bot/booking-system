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
  // 优先级：
  //   1. NETLIFY_DB_URL —— Netlify 运行时注入的 owner 连接串（可写），只有生产才有
  //   2. DATABASE_URL   —— 本地 .env 里的 file:./dev.db
  //   3. NETLIFY_DATABASE_URL —— 另一个可能的注入名，留着兜底
  //
  // 顺序不能反：本地构建时 .env 会跟着打包进去，DATABASE_URL 会被污染成 file:，
  // 如果让它优先，生产就跑在 SQLite 上，所有数据库页面 500。
  const url =
    process.env.NETLIFY_DB_URL ??
    process.env.DATABASE_URL ??
    process.env.NETLIFY_DATABASE_URL
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

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient()
  }
  return globalForPrisma.prisma
}

/**
 * 懒初始化。
 *
 * 不能写成 `export const prisma = createClient()`——`next build` 收集页面数据时
 * 会 import 本模块，那一瞬间就会尝试建连接。构建机没有真实数据库，
 * 会直接让整个构建失败（而且报的是「adapter 与 provider 不匹配」这种误导读法）。
 * 包一层 Proxy，只有真正调用 prisma.xxx 时才创建。
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop as string, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
