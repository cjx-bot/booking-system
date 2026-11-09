/**
 * 时区工具。
 *
 * 为什么不用 Temporal：Node 22 还没内置，引 polyfill 会把这套逻辑变成
 * 「依赖库版本」问题。Intl 是平台能力，行为由 ICU 保证，够用且零依赖。
 *
 * 核心难点只有两个：
 * 1. 从「某时区的年月日时分」反推 UTC 时刻（夏令时会让偏移不是常量）
 * 2. 夏令时切换当天会出现 23 小时或 25 小时，不能假设一天固定 86400 秒
 */

/** 某个 UTC 时刻在指定时区的偏移（毫秒，东八区为 +8h） */
export function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const parts = formatter.formatToParts(instant)
  const values: Record<string, number> = {}

  for (const part of parts) {
    if (part.type === 'literal') continue
    values[part.type] = Number(part.value)
  }

  const asIfUtc = Date.UTC(
    values.year ?? 1970,
    (values.month ?? 1) - 1,
    values.day ?? 1,
    values.hour ?? 0,
    values.minute ?? 0,
    values.second ?? 0,
  )

  // 抹掉毫秒：formatToParts 只到秒，不抹会让偏移量带零头
  const truncatedMs = Math.floor(instant.getTime() / 1000) * 1000

  return asIfUtc - truncatedMs
}

export type DateParts = {
  year: number
  month: number
  day: number
}

/**
 * 把「某时区的某天 + 从 00:00 起的分钟数」转成 UTC 时刻。
 *
 * 夏令时处理：先按 UTC 猜一次，用猜出的时刻反查真实偏移，再修正一次。
 * 两次迭代足以覆盖所有现实时区——偏移的变化幅度远小于 24 小时，
 * 不会出现需要无限迭代的振荡。
 */
export function zonedMinuteToUtc(
  dateParts: DateParts,
  minuteOfDay: number,
  timeZone: string,
): Date {
  const baseUtc = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    0,
    0,
    0,
    0,
  )

  const wallClockAsUtc = baseUtc + minuteOfDay * 60_000

  const firstOffset = getTimeZoneOffsetMs(new Date(wallClockAsUtc), timeZone)
  const firstGuess = wallClockAsUtc - firstOffset

  const secondOffset = getTimeZoneOffsetMs(new Date(firstGuess), timeZone)
  if (secondOffset === firstOffset) return new Date(firstGuess)

  return new Date(wallClockAsUtc - secondOffset)
}

/** 某个 UTC 时刻在指定时区是几月几号星期几 */
export function getLocalDateParts(
  instant: Date,
  timeZone: string,
): DateParts & { weekday: number; minuteOfDay: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const parts = formatter.formatToParts(instant)
  const values: Record<string, number> = {}

  for (const part of parts) {
    if (part.type === 'literal') continue
    values[part.type] = Number(part.value)
  }

  const year = values.year ?? 1970
  const month = values.month ?? 1
  const day = values.day ?? 1
  const hour = values.hour ?? 0
  const minute = values.minute ?? 0

  // 0 = 周日 … 6 = 周六，与 Availability.weekday 的口径一致
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()

  return { year, month, day, weekday, minuteOfDay: hour * 60 + minute }
}

/** 解析 YYYY-MM-DD，不做时区解释——解释交给调用方 */
export function parseDateOnly(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  // 回读校验：Date 会把 11-31 静默溢出成 12-01，
  // 不比对回来就接受，等于让非法日期变成另一个合法日期
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null
  }

  return { year, month, day }
}

/** YYYY-MM-DD，按指定时区格式化 */
export function formatDateInTimeZone(instant: Date, timeZone: string): string {
  const { year, month, day } = getLocalDateParts(instant, timeZone)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** HH:mm，按指定时区格式化 */
export function formatTimeInTimeZone(instant: Date, timeZone: string): string {
  const { minuteOfDay } = getLocalDateParts(instant, timeZone)
  const hour = Math.floor(minuteOfDay / 60)
  const minute = minuteOfDay % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function isValidTimeZone(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '') return false

  // Intl 会把 "+08:00" / "-0500" 这类纯偏移当合法时区接受，
  // 但业务上必须禁止：偏移量在夏令时地区会直接算错一小时。
  // 这一条是整个系统「只存 IANA 名」的唯一防线，别删。
  if (/^[+-]/.test(trimmed)) return false

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: trimmed })
    return true
  } catch {
    return false
  }
}

/** 分钟数 → "09:00"，后台可用时间设置页展示用 */
export function minutesToLabel(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60)
  const minute = minuteOfDay % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** "09:00" → 540，非法输入返回 null（不用 0 兜底，0 是合法值） */
export function labelToMinutes(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(label.trim())
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null

  return hour * 60 + minute
}
