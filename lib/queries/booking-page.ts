import {
  BOOKING_WINDOW_DAYS,
  LEAD_TIME_MINUTES,
  MS_PER_DAY,
  SLOT_INTERVAL_MINUTES,
} from '@/lib/config/booking'
import { prisma } from '@/lib/db'
import { getAvailabilityWindows } from '@/lib/queries/availability'
import { getBusyIntervals } from '@/lib/queries/bookings'
import { generateSlots, shiftDate, type Slot } from '@/lib/utils/slots'
import { getLocalDateParts } from '@/lib/utils/timezone'

export type BookingPageData = {
  slots: Slot[]
  /** 主理人时区，页面用来标注「以下时间均为 XX 时区」 */
  hostTimezone: string
  /** 展示窗口天数。页面文案从这里取，不写字面量。 */
  windowDays: number
}

/**
 * 生成未来 N 天的可约时段。
 *
 * 关键设计：**按主理人时区枚举自然日，不按访客时区**。
 * 因为「哪些时刻可以约」是客观事实，与访客在哪无关；
 * 访客时区只决定这些时刻归到哪一天显示，那一步放在客户端做。
 * 这样服务端渲染一次就够，访客换时区不需要重新请求。
 */
export async function getBookableSlots(
  eventTypeId: string,
): Promise<BookingPageData | null> {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: { select: { id: true, timezone: true } } },
  })

  if (!eventType) return null

  const hostTimezone = eventType.user.timezone
  const now = new Date()

  const availability = await getAvailabilityWindows(eventType.user.id)

  const windowEnd = new Date(
    now.getTime() + (BOOKING_WINDOW_DAYS + 2) * MS_PER_DAY,
  )
  const busy = await getBusyIntervals(
    eventType.user.id,
    new Date(now.getTime() - MS_PER_DAY),
    windowEnd,
  )

  const today = getLocalDateParts(now, hostTimezone)
  const slots: Slot[] = []

  for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
    const day = shiftDate(today, offset)
    const date = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`

    const daySlots = generateSlots({
      date,
      // 用主理人时区生成，保证「一天」的边界与可用时间定义一致
      guestTimezone: hostTimezone,
      hostTimezone,
      duration: eventType.duration,
      bufferBefore: eventType.bufferBefore,
      bufferAfter: eventType.bufferAfter,
      availability,
      busy,
      now,
      leadTimeMinutes: LEAD_TIME_MINUTES,
      slotIntervalMinutes: SLOT_INTERVAL_MINUTES,
    })

    slots.push(...daySlots)
  }

  return { slots, hostTimezone, windowDays: BOOKING_WINDOW_DAYS }
}
