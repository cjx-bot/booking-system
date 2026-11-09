import { prisma } from '@/lib/db'

/**
 * 查询层约定：
 * 1. 第一参数永远是 userId / username，显式传入，不从 cookie/session 里偷偷拿
 * 2. 不读 cookies、不读 env、不调 revalidate
 * 3. 只返回数据，不做权限判断（权限在 action 层）
 */

export async function getEventTypesByUser(userId: string) {
  return prisma.eventType.findMany({
    where: { userId },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
  })
}

/** 公开预约页用：只返回启用中的，且带上主理人信息 */
export async function getEventTypeBySlug(username: string, slug: string) {
  return prisma.eventType.findFirst({
    where: {
      slug,
      isActive: true,
      user: { username },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          timezone: true,
          image: true,
        },
      },
    },
  })
}

/** 个人主页用：某个 username 下所有启用中的事件类型 */
export async function getPublicEventTypes(username: string) {
  return prisma.eventType.findMany({
    where: {
      isActive: true,
      user: { username },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getEventTypeById(userId: string, id: string) {
  return prisma.eventType.findFirst({
    where: { id, userId },
  })
}
