'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import {
  LEAD_TIME_MINUTES,
  MAX_DAYS_AHEAD,
  MS_PER_DAY,
  MS_PER_MINUTE,
} from '@/lib/config/booking'
import { prisma } from '@/lib/db'
import { isUniqueViolation } from '@/lib/db/errors'
import { sendBookingEmails } from '@/lib/email/send'
import { getAvailabilityWindows, getBusyIntervals } from '@/lib/queries'
import { cancelBookingSchema, createBookingSchema } from '@/lib/schemas/booking'
import { isSlotBookable } from '@/lib/utils/slots'
import { requireUserId } from './guard'
import { fail, ok, toFieldErrors, type ActionResult } from './types'

/**
 * 创建预约。
 *
 * 防并发的真正闸门是 BookingLock 上的 @@unique([hostId, startAt])，
 * 不是「先查后写」——后者在两个请求错开时必然漏。
 * 锁与预约在同一个事务里，冲突时整体回滚，不会留下孤儿锁。
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

  const hostId = eventType.user.id
  const now = new Date()

  const maxAhead = new Date(now.getTime() + MAX_DAYS_AHEAD * MS_PER_DAY)
  if (startAt > maxAhead) {
    return fail(`只能预约 ${MAX_DAYS_AHEAD} 天以内的时间`)
  }

  const endAt = new Date(startAt.getTime() + eventType.duration * MS_PER_MINUTE)

  const [availability, busy] = await Promise.all([
    getAvailabilityWindows(hostId),
    getBusyIntervals(
      hostId,
      new Date(startAt.getTime() - MS_PER_DAY),
      new Date(endAt.getTime() + MS_PER_DAY),
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
    const created = await prisma.$transaction(async (tx) => {
      // 先抢锁。并发的第二个请求会在这里拿到 P2002，整个事务回滚。
      await tx.bookingLock.create({ data: { hostId, startAt } })

      return tx.booking.create({
        data: {
          eventTypeId: eventType.id,
          hostId,
          guestName,
          guestEmail,
          guestTimezone,
          startTime: startAt,
          endTime: endAt,
          notes,
        },
        select: { id: true },
      })
    })

    revalidatePath('/[username]/[slug]', 'page')
    revalidatePath('/dashboard/bookings')

    // 邮件放到响应之后发：访客不必等第三方 API 往返。
    // 失败不回滚预约——人已经约上了，通知发不出去是次要问题。
    after(async () => {
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
    })

    return ok(created)
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      // 跨事件类型撞同一时刻也会走到这里，这是 BookingLock 的作用
      return fail('这一时段刚被别人约走了，换一个吧', {
        startTime: ['该时段已被预约'],
      })
    }
    console.error('[createBooking]', error)
    return fail('预约失败，请稍后重试')
  }
}

/**
 * 表单直连版本：Dashboard 列表页的「取消」按钮走这里。
 * 单独导出是因为 <form action> 只接受 (formData) => void 的签名，
 * 而 cancelBooking 的入参是业务对象。
 */
export async function cancelBookingFromForm(formData: FormData): Promise<void> {
  const id = formData.get('id')
  if (typeof id !== 'string' || id === '') return

  const result = await cancelBooking({ id })
  if (!result.ok) {
    // 不抛错：列表刷新后会显示真实状态，用户能看出没取消成功
    console.error('[cancelBookingFromForm]', result.error)
  }

  revalidatePath('/dashboard/bookings')
}
/**
 * 主理人取消自己的预约。
 *
 * where 里带 hostId：别人的预约查不到，对外统一表现为「预约不存在」，
 * 不泄露存在性。
 *
 * 访客自助取消本期不做——它需要签名 token 而不是裸 id，
 * 与其留一个没验证的入口，不如先不开。
 */
export async function cancelBooking(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = cancelBookingSchema.safeParse(input)
  if (!parsed.success) {
    return fail('参数不合法', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.id, hostId: userId },
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
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'cancelled' },
      }),
      // 释放并发锁，否则这个时间再也约不了
      prisma.bookingLock.deleteMany({
        where: { hostId: userId, startAt: booking.startTime },
      }),
    ])

    revalidatePath('/dashboard/bookings')
    revalidatePath(`/booking/${booking.id}`)
    revalidatePath('/[username]/[slug]', 'page')

    return ok({ id: booking.id })
  } catch (error: unknown) {
    console.error('[cancelBooking]', error)
    return fail('取消失败，请稍后重试')
  }
}
