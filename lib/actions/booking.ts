'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { sendBookingEmails } from '@/lib/email/send'
import {
  getAvailabilityWindows,
  getBusyIntervals,
} from '@/lib/queries'
import { cancelBookingSchema, createBookingSchema } from '@/lib/schemas/booking'
import { isSlotBookable } from '@/lib/utils/slots'
import { fail, ok, toFieldErrors, type ActionResult } from './types'

const LEAD_TIME_MINUTES = 60
const MAX_DAYS_AHEAD = 60

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  )
}

/**
 * 创建预约。
 * 防重复靠数据库唯一约束，不靠「先查后写」——
 * 两个请求同时通过校验时，只有一条能插入成功，另一条拿到 P2002。
 */
export async function createBooking(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createBookingSchema.safeParse(input)
  if (!parsed.success) {
    return fail('请检查填写的内容', toFieldErrors(parsed.error.issues))
  }

  const { eventTypeId, guestName, guestEmail, guestTimezone, startTime, notes } =
    parsed.data

  const startAt = new Date(startTime)

  const eventType = await prisma.eventType.findFirst({
    where: { id: eventTypeId, isActive: true },
    include: {
      user: {
        select: { id: true, timezone: true, email: true, name: true, username: true },
      },
    },
  })

  if (!eventType) {
    return fail('这个预约类型不存在或已下架')
  }

  const now = new Date()

  // 时间窗上限：防止有人约到三年后
  const maxAhead = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 3600_000)
  if (startAt > maxAhead) {
    return fail(`只能预约 ${MAX_DAYS_AHEAD} 天以内的时间`)
  }

  const endAt = new Date(startAt.getTime() + eventType.duration * 60_000)

  const [availability, busy] = await Promise.all([
    getAvailabilityWindows(eventType.user.id),
    getBusyIntervals(
      eventType.user.id,
      new Date(startAt.getTime() - 24 * 3600_000),
      new Date(endAt.getTime() + 24 * 3600_000),
    ),
  ])

  const bookable = isSlotBookable({
    startTime: startAt,
    duration: eventType.duration,
    bufferBefore: eventType.bufferBefore,
    bufferAfter: eventType.bufferAfter,
    hostTimezone: eventType.user.timezone,
    availability,
    busy,
    now,
    leadTimeMinutes: LEAD_TIME_MINUTES,
  })

  if (!bookable) {
    return fail('这个时段已经不能约了，换一个试试', {
      startTime: ['该时段不可预约'],
    })
  }

  try {
    const created = await prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        hostId: eventType.user.id,
        guestName,
        guestEmail,
        guestTimezone,
        startTime: startAt,
        endTime: endAt,
        notes,
      },
      select: { id: true },
    })

    revalidatePath('/[username]/[slug]', 'page')
    revalidatePath('/dashboard/bookings')

    // 邮件失败不回滚预约：人已经约上了，通知发不出去是次要问题
    try {
      await sendBookingEmails({
        eventTitle: eventType.title,
        duration: eventType.duration,
        hostName: eventType.user.name ?? eventType.user.username,
        hostEmail: eventType.user.email,
        guestName,
        guestEmail,
        guestTimezone,
        hostTimezone: eventType.user.timezone,
        startTime: startAt,
        endTime: endAt,
        bookingId: created.id,
        notes,
      })
    } catch (error: unknown) {
      console.error('[createBooking] 邮件发送失败', error)
    }

    return ok(created)
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      // 并发下的第二次提交会走到这里，给的是「已被约走」而不是「系统错误」
      return fail('这一时段刚被别人约走了，换一个吧', {
        startTime: ['该时段已被预约'],
      })
    }
    console.error('[createBooking]', error)
    return fail('预约失败，请稍后重试')
  }
}

/**
 * 取消预约。
 * 访客凭预约 ID 也能取消——所以这里不做用户鉴权，
 * 而是要求 ID 不可枚举（cuid）+ 状态机合法（不能取消已取消的）。
 */
export async function cancelBooking(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = cancelBookingSchema.safeParse(input)
  if (!parsed.success) {
    return fail('参数不合法', toFieldErrors(parsed.error.issues))
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, status: true, startTime: true },
  })

  if (!booking) {
    return fail('预约不存在')
  }

  if (booking.status === 'cancelled') {
    return ok({ id: booking.id })
  }

  if (booking.startTime.getTime() < Date.now()) {
    return fail('已经开始或结束的预约不能取消')
  }

  try {
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'cancelled' },
      select: { id: true },
    })

    revalidatePath('/dashboard/bookings')
    revalidatePath(`/booking/${booking.id}`)

    return ok(updated)
  } catch (error: unknown) {
    console.error('[cancelBooking]', error)
    return fail('取消失败，请稍后重试')
  }
}
