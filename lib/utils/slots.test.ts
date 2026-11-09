import { describe, expect, it } from 'vitest'
import {
  generateSlots,
  groupSlotsByDate,
  isSlotBookable,
  type GenerateSlotsInput,
} from './slots'
import type { AvailabilityWindow } from './slots'

/** 周一到周五 09:00-12:00，字段口径与 Availability 表一致 */
const WEEKDAY_MORNING: AvailabilityWindow[] = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  startMinute: 540,
  endMinute: 720,
}))

const EARLY = new Date('2026-01-01T00:00:00.000Z')

function makeInput(overrides: Partial<GenerateSlotsInput> = {}): GenerateSlotsInput {
  return {
    date: '2026-11-09',
    guestTimezone: 'Asia/Shanghai',
    hostTimezone: 'Asia/Shanghai',
    duration: 30,
    bufferBefore: 0,
    bufferAfter: 0,
    availability: WEEKDAY_MORNING,
    busy: [],
    now: EARLY,
    leadTimeMinutes: 60,
    slotIntervalMinutes: 15,
    ...overrides,
  }
}

const starts = (slots: ReadonlyArray<{ start: Date }>) =>
  slots.map((slot) => slot.start.toISOString())

const minutesOf = (slots: ReadonlyArray<{ start: Date }>, tz: string) =>
  slots.map((slot) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    }).format(slot.start),
  )

describe('基本生成', () => {
  it('周一 09:00-12:00、30 分钟会议、15 分钟步进 → 11 个时段', () => {
    const slots = generateSlots(makeInput())

    expect(slots).toHaveLength(11)
    expect(minutesOf(slots, 'Asia/Shanghai')[0]).toBe('09:00')
    expect(minutesOf(slots, 'Asia/Shanghai').at(-1)).toBe('11:30')
  })

  it('每个时段长度等于会议时长', () => {
    const slots = generateSlots(makeInput())
    for (const slot of slots) {
      expect(slot.end.getTime() - slot.start.getTime()).toBe(30 * 60_000)
    }
  })

  it('时段按时间升序且不重复', () => {
    const slots = generateSlots(makeInput())
    const times = slots.map((slot) => slot.start.getTime())
    expect(new Set(times).size).toBe(times.length)
    expect([...times].sort((a, b) => a - b)).toEqual(times)
  })

  it('没有可用时间的一天返回空数组，不抛异常', () => {
    const slots = generateSlots(makeInput({ availability: [] }))
    expect(slots).toEqual([])
  })

  it('周末没有可用时间时返回空数组', () => {
    // 2026-11-14 是周六
    const slots = generateSlots(makeInput({ date: '2026-11-14' }))
    expect(slots).toEqual([])
  })

  it('日期格式非法返回空数组', () => {
    expect(generateSlots(makeInput({ date: '2026-11-31' }))).toEqual([])
    expect(generateSlots(makeInput({ date: 'yesterday' }))).toEqual([])
  })

  it('会议时长超过窗口时一个时段都放不下', () => {
    // 09:00-12:00 只放得下 180 分钟的会议，181 分钟就不行
    expect(generateSlots(makeInput({ duration: 180 }))).toHaveLength(1)
    expect(generateSlots(makeInput({ duration: 181 }))).toHaveLength(0)
  })
})

describe('buffer 冲突', () => {
  const busy = [
    {
      start: new Date('2026-11-09T02:00:00.000Z'), // 上海 10:00
      end: new Date('2026-11-09T02:30:00.000Z'), // 上海 10:30
    },
  ]

  it('与已有预约重叠的时段被排除', () => {
    const slots = generateSlots(makeInput({ busy }))
    const labels = minutesOf(slots, 'Asia/Shanghai')

    expect(labels).not.toContain('10:00')
    expect(labels).not.toContain('10:15')
    expect(labels).toContain('09:30')
  })

  it('背靠背不算冲突（缓冲为 0 时）', () => {
    const slots = generateSlots(makeInput({ busy }))
    // 09:30 的会议 09:30-10:00，正好接上 10:00 的已有预约
    expect(minutesOf(slots, 'Asia/Shanghai')).toContain('09:30')
  })

  it('后缓冲把紧随其后的时段也排除掉', () => {
    // busy 语义：已含该预约自身的缓冲。这里 10:00-10:30 的预约，自己带 20 分钟尾缓冲
    const slots = generateSlots(
      makeInput({
        busy: [
          {
            start: new Date('2026-11-09T02:00:00.000Z'), // 上海 10:00
            end: new Date('2026-11-09T02:50:00.000Z'), // 上海 10:30 + 20 分钟尾缓冲
          },
        ],
        bufferAfter: 20,
      }),
    )
    const labels = minutesOf(slots, 'Asia/Shanghai')

    expect(labels).not.toContain('10:30')
    expect(labels).not.toContain('10:45')
    // 11:00 的会议 11:00-11:30，不再与 10:50 结束的占用区间相交
    expect(labels).toContain('11:00')
  })

  it('前缓冲把前面的时段排除掉', () => {
    // 已有预约 09:45-10:15，新预约 10:30 带 20 分钟前缓冲 → 从 10:10 起就占着，冲突
    const slots = generateSlots(
      makeInput({
        busy: [
          {
            start: new Date('2026-11-09T01:45:00.000Z'), // 上海 09:45
            end: new Date('2026-11-09T02:15:00.000Z'), // 上海 10:15
          },
        ],
        bufferBefore: 20,
      }),
    )
    const labels = minutesOf(slots, 'Asia/Shanghai')

    expect(labels).not.toContain('10:30')
    // 10:45 前缓冲到 10:25，已经越过 10:15 的终点
    expect(labels).toContain('10:45')
  })
})

describe('最小提前量', () => {
  it('距离现在不足 60 分钟的时段被排除', () => {
    // 上海 2026-11-09 08:30
    const now = new Date('2026-11-09T00:30:00.000Z')
    const slots = generateSlots(makeInput({ now, leadTimeMinutes: 60 }))

    expect(minutesOf(slots, 'Asia/Shanghai')).not.toContain('09:00')
    expect(minutesOf(slots, 'Asia/Shanghai')).not.toContain('09:15')
    expect(minutesOf(slots, 'Asia/Shanghai')).toContain('09:30')
  })

  it('整天都已过去时返回空数组', () => {
    const now = new Date('2026-11-09T10:00:00.000Z') // 上海 18:00
    expect(generateSlots(makeInput({ now }))).toEqual([])
  })
})

describe('跨时区', () => {
  it('访客在纽约看上海主理人的周一：对应纽约周日晚上', () => {
    // 主理人上海周一 09:00-12:00 = UTC 01:00-04:00 = 纽约周日 20:00-23:00
    const slots = generateSlots(
      makeInput({
        date: '2026-11-09', // 纽约的周一
        guestTimezone: 'America/New_York',
      }),
    )

    // 纽约周一看不到上海周一的上午，只看到上海周二的上午（纽约周一 20:00-23:00）
    expect(slots.length).toBeGreaterThan(0)
    expect(minutesOf(slots, 'America/New_York')[0]).toBe('20:00')
    expect(starts(slots)[0]).toBe('2026-11-10T01:00:00.000Z')
  })

  it('访客在北京看纽约主理人的同一天：能看到凌晨和深夜两段', () => {
    // 纽约周一 09:00-12:00 EST = UTC 14:00-17:00 = 北京 22:00-01:00（次日）
    const slots = generateSlots(
      makeInput({
        date: '2026-11-10', // 北京的周二
        guestTimezone: 'Asia/Shanghai',
        hostTimezone: 'America/New_York',
      }),
    )

    const labels = minutesOf(slots, 'Asia/Shanghai')
    // 纽约周一的尾巴（北京周二凌晨）和纽约周二的开始（北京周二晚上）都在
    expect(labels).toContain('00:00')
    expect(labels).toContain('22:00')
  })

  it('时区差超过 12 小时也不会漏掉任何一段', () => {
    // 奥克兰 UTC+13，与上海 +8 相差 5 小时；这里测的是枚举候选日期没漏
    const slots = generateSlots(
      makeInput({
        date: '2026-11-09',
        guestTimezone: 'Pacific/Auckland',
        hostTimezone: 'Asia/Shanghai',
      }),
    )
    expect(slots.length).toBeGreaterThan(0)
  })
})

describe('夏令时', () => {
  /** 纽约主理人，周一到周五 09:00-12:00 */
  const NY_WEEKDAY: AvailabilityWindow[] = [1, 2, 3, 4, 5].map((weekday) => ({
    weekday,
    startMinute: 540,
    endMinute: 720,
  }))

  it('春季切换日（2026-03-08 前后）时段数量正常，不重复不丢失', () => {
    // 2026-03-06 周五，普通日
    const normal = generateSlots(
      makeInput({
        date: '2026-03-06',
        guestTimezone: 'America/New_York',
        hostTimezone: 'America/New_York',
        availability: NY_WEEKDAY,
      }),
    )

    // 2026-03-09 周一，切换日之后
    const afterSwitch = generateSlots(
      makeInput({
        date: '2026-03-09',
        guestTimezone: 'America/New_York',
        hostTimezone: 'America/New_York',
        availability: NY_WEEKDAY,
      }),
    )

    expect(normal).toHaveLength(11)
    expect(afterSwitch).toHaveLength(11)
    expect(new Set(starts(afterSwitch)).size).toBe(11)
  })

  it('秋季切换日（2026-11-02 前后）时段数量正常', () => {
    const before = generateSlots(
      makeInput({
        date: '2026-10-30',
        guestTimezone: 'America/New_York',
        hostTimezone: 'America/New_York',
        availability: NY_WEEKDAY,
      }),
    )
    const after = generateSlots(
      makeInput({
        date: '2026-11-02',
        guestTimezone: 'America/New_York',
        hostTimezone: 'America/New_York',
        availability: NY_WEEKDAY,
      }),
    )

    expect(before).toHaveLength(11)
    expect(after).toHaveLength(11)
  })

  it('切换后同一本地时刻的 UTC 值确实变了（证明真在处理 DST）', () => {
    const summer = generateSlots(
      makeInput({
        date: '2026-07-06',
        guestTimezone: 'America/New_York',
        hostTimezone: 'America/New_York',
        availability: NY_WEEKDAY,
      }),
    )
    const winter = generateSlots(
      makeInput({
        date: '2026-12-07',
        guestTimezone: 'America/New_York',
        hostTimezone: 'America/New_York',
        availability: NY_WEEKDAY,
      }),
    )

    // 都是本地 09:00 开始，夏令时是 13:00Z，冬令时是 14:00Z
    expect(starts(summer)[0]).toBe('2026-07-06T13:00:00.000Z')
    expect(starts(winter)[0]).toBe('2026-12-07T14:00:00.000Z')
  })
})

describe('isSlotBookable 与 generateSlots 口径一致', () => {
  it('列表里生成的每个时段都能通过提交校验', () => {
    const input = makeInput()
    const slots = generateSlots(input)

    for (const slot of slots) {
      expect(
        isSlotBookable({
          startTime: slot.start,
          duration: input.duration,
          bufferBefore: input.bufferBefore,
          bufferAfter: input.bufferAfter,
          hostTimezone: input.hostTimezone,
          availability: input.availability,
          busy: input.busy,
          now: input.now,
          leadTimeMinutes: input.leadTimeMinutes,
        }),
      ).toBe(true)
    }
  })

  it('不在列表里的时刻提交会被拒绝', () => {
    const input = makeInput()

    // 12:30 —— 超出上午窗口
    expect(
      isSlotBookable({
        startTime: new Date('2026-11-09T04:30:00.000Z'),
        duration: 30,
        bufferBefore: 0,
        bufferAfter: 0,
        hostTimezone: 'Asia/Shanghai',
        availability: WEEKDAY_MORNING,
        busy: [],
        now: EARLY,
      }),
    ).toBe(false)
  })

  it('与已有预约重叠的时刻提交会被拒绝', () => {
    expect(
      isSlotBookable({
        startTime: new Date('2026-11-09T02:00:00.000Z'), // 上海 10:00
        duration: 30,
        bufferBefore: 0,
        bufferAfter: 0,
        hostTimezone: 'Asia/Shanghai',
        availability: WEEKDAY_MORNING,
        busy: [
          {
            start: new Date('2026-11-09T02:00:00.000Z'),
            end: new Date('2026-11-09T02:30:00.000Z'),
          },
        ],
        now: EARLY,
      }),
    ).toBe(false)
  })

  it('超出窗口边缘的时刻被拒绝（差一分钟也不行）', () => {
    // 11:31 开始 30 分钟 → 12:01 结束，超出 12:00 窗口
    expect(
      isSlotBookable({
        startTime: new Date('2026-11-09T03:31:00.000Z'),
        duration: 30,
        bufferBefore: 0,
        bufferAfter: 0,
        hostTimezone: 'Asia/Shanghai',
        availability: WEEKDAY_MORNING,
        busy: [],
        now: EARLY,
      }),
    ).toBe(false)
  })
})

describe('分组', () => {
  it('按访客时区分组成 Map', () => {
    const slots = generateSlots(makeInput())
    const grouped = groupSlotsByDate(slots, 'Asia/Shanghai')

    expect(grouped.size).toBe(1)
    expect(grouped.get('2026-11-09')).toHaveLength(11)
  })
})
