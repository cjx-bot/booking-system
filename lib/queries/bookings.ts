import { prisma } from '@/lib/db'
import type { BookingQueryInput } from '@/lib/schemas/booking'

export async function getBookingsByHost(
  userId: string,
  options: Partial<BookingQueryInput> = {},
) {
  const { status = 'all', page = 1, pageSize = 20 } = options

  const where = {
    hostId: userId,
    ...(status === 'all' ? {} : { status }),
  }

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        eventType: { select: { id: true, title: true, duration: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** 判断某时段是否已被占用（含 boundary 之外由算法负责，这里只查精确命中） */
export async function getBookingsBySlot(eventTypeId: string, startTime: Date) {
  return prisma.booking.findUnique({
    where: {
      eventTypeId_startTime: { eventTypeId, startTime },
    },
  })
}

/** 时段算法用：拉取某主理人在 [from, to) 内所有未取消的预约 */
export async function getBookingsInRange(
  hostId: string,
  from: Date,
  to: Date,
) {
  return prisma.booking.findMany({
    where: {
      hostId,
      status: 'confirmed',
      // 用相交判断而不是只看 startTime，跨过边界的预约才不会漏
      startTime: { lt: to },
      endTime: { gt: from },
    },
    select: { startTime: true, endTime: true, eventTypeId: true },
    orderBy: { startTime: 'asc' },
  })
}

/**
 * 给时段算法用的占用区间：**已把每条预约自身的 buffer 扩张进去**。
 * 这样算法只做纯区间相交，不需要知道 buffer 是谁的。
 */
export async function getBusyIntervals(hostId: string, from: Date, to: Date) {
  const rows = await prisma.booking.findMany({
    where: {
      hostId,
      status: 'confirmed',
      startTime: { lt: to },
      endTime: { gt: from },
    },
    select: {
      startTime: true,
      endTime: true,
      eventType: { select: { bufferBefore: true, bufferAfter: true } },
    },
  })

  return rows.map((row) => ({
    start: new Date(
      row.startTime.getTime() - row.eventType.bufferBefore * 60_000,
    ),
    end: new Date(row.endTime.getTime() + row.eventType.bufferAfter * 60_000),
  }))
}

/** 确认页用：凭 ID 查，不带 userId（访客没有账号） */
export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      eventType: {
        select: { id: true, title: true, duration: true, slug: true },
      },
      host: {
        select: { name: true, username: true, timezone: true, email: true },
      },
    },
  })
}
