import { prisma } from '@/lib/db'

export async function getAvailability(userId: string) {
  return prisma.availability.findMany({
    where: { userId },
    orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
  })
}

/** 时段算法用：只要数值，不要 id，方便直接进纯函数 */
export async function getAvailabilityWindows(userId: string) {
  const rows = await prisma.availability.findMany({
    where: { userId },
    select: { weekday: true, startMinute: true, endMinute: true },
    orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
  })

  return rows
}
