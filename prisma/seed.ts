import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../lib/generated/prisma/client'

/**
 * 种子数据必须幂等：连跑两次，每张表的行数不变。
 * 做法：有唯一键的用 upsert，没有唯一键的（Availability）先删后插。
 */

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('缺少 DATABASE_URL，检查 .env')
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: DATABASE_URL }),
})

const DEMO = {
  email: 'demo@example.com',
  username: 'demo',
  name: '林小满',
  timezone: 'Asia/Shanghai',
  // 演示账号密码，生产环境必须删掉
  password: 'demo1234',
}

const EVENT_TYPES = [
  {
    slug: '30min',
    title: '30 分钟初谈',
    description: '聊聊你在做什么、卡在哪，看看我能不能帮上忙。',
    duration: 30,
    bufferBefore: 0,
    bufferAfter: 10,
  },
  {
    slug: '60min',
    title: '60 分钟深度咨询',
    description: '带着具体问题来，一次讲透，会后给一份文字纪要。',
    duration: 60,
    bufferBefore: 10,
    bufferAfter: 10,
  },
] as const

/** 周一到周五，上午 09:00-12:00、下午 14:00-18:00 */
const WORKING_HOURS = [
  [540, 720],
  [840, 1080],
] as const

const WORKDAYS = [1, 2, 3, 4, 5] as const

async function main() {
  const passwordHash = await bcrypt.hash(DEMO.password, 10)

  const user = await prisma.user.upsert({
    where: { email: DEMO.email },
    // 刻意不更新 password：种子可以重复跑，但不该把用户改过的密码重置回去。
    // 忘记密码时用后台「账号设置」改，或直接改库。
    update: {
      username: DEMO.username,
      name: DEMO.name,
      timezone: DEMO.timezone,
    },
    create: {
      email: DEMO.email,
      username: DEMO.username,
      name: DEMO.name,
      timezone: DEMO.timezone,
      password: passwordHash,
    },
  })

  for (const eventType of EVENT_TYPES) {
    await prisma.eventType.upsert({
      where: { userId_slug: { userId: user.id, slug: eventType.slug } },
      update: { ...eventType },
      create: { ...eventType, userId: user.id },
    })
  }

  // 全量覆盖：先清空该用户的可用时间，再按当前定义重建
  await prisma.availability.deleteMany({ where: { userId: user.id } })
  await prisma.availability.createMany({
    data: WORKDAYS.flatMap((weekday) =>
      WORKING_HOURS.map(([startMinute, endMinute]) => ({
        userId: user.id,
        weekday,
        startMinute,
        endMinute,
      })),
    ),
  })

  const [users, eventTypes, availability, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.eventType.count(),
    prisma.availability.count(),
    prisma.booking.count(),
  ])

  console.log('种子完成：', { users, eventTypes, availability, bookings })
  console.log(`演示账号：${DEMO.email} / ${DEMO.password}`)
  console.log(`公开页：http://localhost:3000/${DEMO.username}`)
}

main()
  .catch((error: unknown) => {
    console.error('种子失败：', error)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
