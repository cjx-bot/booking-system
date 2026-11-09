import { describe, expect, it } from 'vitest'
import {
  formatDateInTimeZone,
  formatTimeInTimeZone,
  getLocalDateParts,
  getTimeZoneOffsetMs,
  isValidTimeZone,
  labelToMinutes,
  minutesToLabel,
  parseDateOnly,
  zonedMinuteToUtc,
} from './timezone'

const utc = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
) => new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))

describe('getTimeZoneOffsetMs', () => {
  it('上海恒为 +8 小时，不受夏令时影响', () => {
    expect(getTimeZoneOffsetMs(utc(2026, 1, 15, 0, 0), 'Asia/Shanghai')).toBe(
      8 * 3600_000,
    )
    expect(getTimeZoneOffsetMs(utc(2026, 7, 15, 0, 0), 'Asia/Shanghai')).toBe(
      8 * 3600_000,
    )
  })

  it('纽约冬季 -5、夏季 -4', () => {
    expect(getTimeZoneOffsetMs(utc(2026, 1, 15, 12, 0), 'America/New_York')).toBe(
      -5 * 3600_000,
    )
    expect(getTimeZoneOffsetMs(utc(2026, 7, 15, 12, 0), 'America/New_York')).toBe(
      -4 * 3600_000,
    )
  })

  it('偏移量不带毫秒零头', () => {
    const offset = getTimeZoneOffsetMs(new Date('2026-11-10T03:17:42.789Z'), 'Asia/Shanghai')
    expect(offset % 1000).toBe(0)
  })
})

describe('zonedMinuteToUtc', () => {
  it('上海 09:00 对应 UTC 01:00', () => {
    const result = zonedMinuteToUtc({ year: 2026, month: 11, day: 10 }, 540, 'Asia/Shanghai')
    expect(result.toISOString()).toBe('2026-11-10T01:00:00.000Z')
  })

  it('1440 分钟等于次日 00:00', () => {
    const result = zonedMinuteToUtc({ year: 2026, month: 11, day: 10 }, 1440, 'Asia/Shanghai')
    expect(result.toISOString()).toBe('2026-11-10T16:00:00.000Z')
  })

  it('纽约冬季 09:00 对应 UTC 14:00', () => {
    const result = zonedMinuteToUtc({ year: 2026, month: 1, day: 15 }, 540, 'America/New_York')
    expect(result.toISOString()).toBe('2026-01-15T14:00:00.000Z')
  })

  it('纽约夏季 09:00 对应 UTC 13:00', () => {
    const result = zonedMinuteToUtc({ year: 2026, month: 7, day: 15 }, 540, 'America/New_York')
    expect(result.toISOString()).toBe('2026-07-15T13:00:00.000Z')
  })

  // 2026-03-08 02:00 美东跳到 03:00，这一天只有 23 小时
  it('春季夏令时切换日：当天 00:00 到次日 00:00 只有 23 小时', () => {
    const start = zonedMinuteToUtc({ year: 2026, month: 3, day: 8 }, 0, 'America/New_York')
    const end = zonedMinuteToUtc({ year: 2026, month: 3, day: 8 }, 1440, 'America/New_York')

    expect((end.getTime() - start.getTime()) / 3600_000).toBe(23)
  })

  // 2026-11-01 02:00 美东拨回 01:00，这一天有 25 小时
  it('秋季夏令时切换日：当天 00:00 到次日 00:00 有 25 小时', () => {
    const start = zonedMinuteToUtc({ year: 2026, month: 11, day: 1 }, 0, 'America/New_York')
    const end = zonedMinuteToUtc({ year: 2026, month: 11, day: 1 }, 1440, 'America/New_York')

    expect((end.getTime() - start.getTime()) / 3600_000).toBe(25)
  })

  it('秋季切换前的 09:00 和切换后的 09:00 相差不到 24 小时也说得通', () => {
    const before = zonedMinuteToUtc({ year: 2026, month: 10, day: 31 }, 540, 'America/New_York')
    const after = zonedMinuteToUtc({ year: 2026, month: 11, day: 1 }, 540, 'America/New_York')

    // 10-31 09:00 EDT = 13:00Z，11-01 09:00 EST = 14:00Z，差 25 小时
    expect((after.getTime() - before.getTime()) / 3600_000).toBe(25)
  })
})

describe('getLocalDateParts', () => {
  it('UTC 16:30 在上海已是次日 00:30', () => {
    const parts = getLocalDateParts(utc(2026, 11, 10, 16, 30), 'Asia/Shanghai')
    expect(parts).toMatchObject({ year: 2026, month: 11, day: 11, minuteOfDay: 30 })
  })

  it('星期几按本地日期算，不按 UTC 日期算', () => {
    // 2026-11-10 是周二；UTC 周一 23:00 在上海已是周二 07:00
    const parts = getLocalDateParts(utc(2026, 11, 9, 23, 0), 'Asia/Shanghai')
    expect(parts.weekday).toBe(2)
  })
})

describe('格式化', () => {
  it('按纽约时区格式化日期和时间', () => {
    const instant = utc(2026, 11, 10, 2, 0)
    expect(formatDateInTimeZone(instant, 'America/New_York')).toBe('2026-11-09')
    expect(formatTimeInTimeZone(instant, 'America/New_York')).toBe('21:00')
  })

  it('分钟数与标签互转', () => {
    expect(minutesToLabel(540)).toBe('09:00')
    expect(minutesToLabel(0)).toBe('00:00')
    expect(minutesToLabel(1439)).toBe('23:59')
    expect(labelToMinutes('09:00')).toBe(540)
    expect(labelToMinutes('9:00')).toBe(540)
    expect(labelToMinutes('24:00')).toBeNull()
    expect(labelToMinutes('09:60')).toBeNull()
    expect(labelToMinutes('abc')).toBeNull()
  })
})

describe('边界输入', () => {
  it('解析非法日期返回 null 而不是抛异常', () => {
    expect(parseDateOnly('2026-13-01')).toBeNull()
    expect(parseDateOnly('2026-11-32')).toBeNull()
    expect(parseDateOnly('20261110')).toBeNull()
    expect(parseDateOnly('2026-11-10')).toEqual({ year: 2026, month: 11, day: 10 })
  })

  it('非法时区名被识别出来', () => {
    expect(isValidTimeZone('Asia/Shanghai')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus')).toBe(false)
    expect(isValidTimeZone('+08:00')).toBe(false)
  })
})
