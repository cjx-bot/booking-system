import {
  getLocalDateParts,
  parseDateOnly,
  zonedMinuteToUtc,
  type DateParts,
} from './timezone'

/**
 * 时段生成：整个系统里唯一「算错了不报错」的地方。
 * 纯函数，不碰数据库、不读系统时间（now 由调用方传入），可以逐条单测。
 */

export type AvailabilityWindow = {
  weekday: number
  startMinute: number
  endMinute: number
}

export type BusyInterval = {
  /**
   * 已占用区间的起点。
   * 重要：调用方传入时应当**已经把该预约自身的 buffer 扩张进去**——
   * 算法只做纯区间相交，不猜别人的 buffer 是多少。
   */
  start: Date
  /** 已占用区间的终点，同样含 buffer */
  end: Date
}

export type Slot = {
  /** UTC */
  start: Date
  /** UTC */
  end: Date
}

export type GenerateSlotsInput = {
  /** 访客时区下的日期，YYYY-MM-DD */
  date: string
  guestTimezone: string
  hostTimezone: string
  /** 会议时长（分钟） */
  duration: number
  bufferBefore: number
  bufferAfter: number
  availability: ReadonlyArray<AvailabilityWindow>
  /** 主理人已确认的预约，UTC */
  busy: ReadonlyArray<BusyInterval>
  /** 当前时刻，UTC */
  now: Date
  /** 距离现在至少多久之后才能约，分钟 */
  leadTimeMinutes?: number
  /** 候选时段的步进，默认 15 分钟 */
  slotIntervalMinutes?: number
}

const DEFAULT_LEAD_TIME = 60
const DEFAULT_SLOT_INTERVAL = 15
const MS_PER_MINUTE = 60_000

/**
 * 生成某一天在访客时区视角下所有可预约时段。
 *
 * 关键设计：**以访客时区的这一天为边界，反向枚举主理人的本地日期**。
 * 因为「访客的 11-10」在纽约主理人那里可能是 11-09，
 * 直接按访客日期取 weekday 会错一整天。
 */
export function generateSlots(input: GenerateSlotsInput): Slot[] {
  const {
    date,
    guestTimezone,
    hostTimezone,
    duration,
    bufferBefore,
    bufferAfter,
    availability,
    busy,
    now,
    leadTimeMinutes = DEFAULT_LEAD_TIME,
    slotIntervalMinutes = DEFAULT_SLOT_INTERVAL,
  } = input

  const dayParts = parseDateOnly(date)
  if (!dayParts) return []
  if (duration <= 0) return []

  // 访客时区这一天的 UTC 起止（end 是次日 00:00）
  const dayStart = zonedMinuteToUtc(dayParts, 0, guestTimezone)
  const dayEnd = zonedMinuteToUtc(dayParts, 24 * 60, guestTimezone)

  if (dayEnd <= dayStart) return []

  const windows = resolveWindows({
    dayParts,
    guestTimezone,
    hostTimezone,
    availability,
  })

  const earliestStart = new Date(now.getTime() + leadTimeMinutes * MS_PER_MINUTE)
  const durationMs = duration * MS_PER_MINUTE
  const intervalMs = slotIntervalMinutes * MS_PER_MINUTE

  const slots: Slot[] = []
  const seen = new Set<number>()

  for (const window of windows) {
    // 窗口可能完全落在访客这一天之外，先裁到当天范围内
    const rangeStart = Math.max(window.start.getTime(), dayStart.getTime())
    const rangeEnd = Math.min(window.end.getTime(), dayEnd.getTime())
    if (rangeEnd <= rangeStart) continue

    // 从窗口起点开始，按间隔步进。起点取整到 interval，避免出现 XX:07 这种时间
    const firstSlot =
      Math.ceil(rangeStart / intervalMs) * intervalMs === rangeStart
        ? rangeStart
        : Math.ceil(rangeStart / intervalMs) * intervalMs

    for (
      let startMs = firstSlot;
      startMs + durationMs <= rangeEnd;
      startMs += intervalMs
    ) {
      // 同一时刻可能被两个相邻窗口覆盖，去重
      if (seen.has(startMs)) continue

      const slotStart = new Date(startMs)
      const slotEnd = new Date(startMs + durationMs)

      if (slotStart < earliestStart) continue

      const occupiedStart = startMs - bufferBefore * MS_PER_MINUTE
      const occupiedEnd = slotEnd.getTime() + bufferAfter * MS_PER_MINUTE

      if (hasConflict(occupiedStart, occupiedEnd, busy)) continue

      seen.add(startMs)
      slots.push({ start: slotStart, end: slotEnd })
    }
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime())
  return slots
}

/**
 * 把「主理人时区的可用窗口」翻译成一段段 UTC 区间。
 *
 * 访客这一天可能横跨主理人的两个本地日期（最多两个，时区差不会超过 26 小时），
 * 所以按候选本地日期逐个展开，再用访客当天范围裁剪。
 */
function resolveWindows(args: {
  dayParts: DateParts
  guestTimezone: string
  hostTimezone: string
  availability: ReadonlyArray<AvailabilityWindow>
}): Array<{ start: Date; end: Date }> {
  const { dayParts, guestTimezone, hostTimezone, availability } = args

  // 访客当天的起点，在主理人时区里是几号
  const guestDayStartUtc = zonedMinuteToUtc(dayParts, 0, guestTimezone)
  const hostDayOfStart = getLocalDateParts(guestDayStartUtc, hostTimezone)

  // 候选：主理人本地的前一天 / 当天 / 后一天，去重后逐个检查
  const candidates: DateParts[] = []
  for (const shift of [-1, 0, 1]) {
    const shifted = shiftDate(hostDayOfStart, shift)
    if (
      !candidates.some(
        (item) =>
          item.year === shifted.year &&
          item.month === shifted.month &&
          item.day === shifted.day,
      )
    ) {
      candidates.push(shifted)
    }
  }

  const windows: Array<{ start: Date; end: Date }> = []

  for (const candidate of candidates) {
    const weekday = new Date(
      Date.UTC(candidate.year, candidate.month - 1, candidate.day),
    ).getUTCDay()

    for (const window of availability) {
      if (window.weekday !== weekday) continue
      if (window.endMinute <= window.startMinute) continue

      windows.push({
        start: zonedMinuteToUtc(candidate, window.startMinute, hostTimezone),
        end: zonedMinuteToUtc(candidate, window.endMinute, hostTimezone),
      })
    }
  }

  return windows
}

export function shiftDate(
  parts: DateParts,
  days: number,
): DateParts {
  const shifted = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days),
  )

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

/** 半开区间相交判断：[aStart, aEnd) 与 [bStart, bEnd) 有交集即冲突 */
function hasConflict(
  startMs: number,
  endMs: number,
  busy: ReadonlyArray<BusyInterval>,
): boolean {
  for (const interval of busy) {
    if (startMs < interval.end.getTime() && interval.start.getTime() < endMs) {
      return true
    }
  }
  return false
}

/**
 * 校验某个具体时刻是否可约（提交预约时用，防止前端绕过 UI 直接 POST）。
 * 与 generateSlots 共用同一套判断口径，避免「列表里能选、提交时说不行」。
 */
export function isSlotBookable(input: {
  startTime: Date
  duration: number
  bufferBefore: number
  bufferAfter: number
  hostTimezone: string
  availability: ReadonlyArray<AvailabilityWindow>
  busy: ReadonlyArray<BusyInterval>
  now: Date
  leadTimeMinutes?: number
}): boolean {
  const {
    startTime,
    duration,
    bufferBefore,
    bufferAfter,
    hostTimezone,
    availability,
    busy,
    now,
    leadTimeMinutes = DEFAULT_LEAD_TIME,
  } = input

  const durationMs = duration * MS_PER_MINUTE
  const endMs = startTime.getTime() + durationMs

  if (startTime.getTime() < now.getTime() + leadTimeMinutes * MS_PER_MINUTE) {
    return false
  }

  // 必须完整落在主理人某个可用窗口内
  const local = getLocalDateParts(startTime, hostTimezone)
  const startMinute = local.minuteOfDay
  const endMinute = startMinute + duration

  const fitsWindow = availability.some(
    (window) =>
      window.weekday === local.weekday &&
      startMinute >= window.startMinute &&
      endMinute <= window.endMinute,
  )

  if (!fitsWindow) return false

  return !hasConflict(
    startTime.getTime() - bufferBefore * MS_PER_MINUTE,
    endMs + bufferAfter * MS_PER_MINUTE,
    busy,
  )
}

/** 按访客时区把时段分组，前端按天渲染时直接取 */
export function groupSlotsByDate(
  slots: ReadonlyArray<Slot>,
  timeZone: string,
): Map<string, Slot[]> {
  const grouped = new Map<string, Slot[]>()

  for (const slot of slots) {
    const { year, month, day } = getLocalDateParts(slot.start, timeZone)
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const list = grouped.get(key)

    if (list) {
      list.push(slot)
    } else {
      grouped.set(key, [slot])
    }
  }

  return grouped
}
