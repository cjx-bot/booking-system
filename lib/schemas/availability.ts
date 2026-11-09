import { z } from 'zod'

/**
 * 分钟数表示法：从当天 00:00 起算。
 * 用整数而不是 "09:00" 字符串，是为了让重叠判断变成简单的数值比较，
 * 也避免 "9:00" / "09:00" / "9:0" 三种写法各存一份。
 */
export const MINUTES_PER_DAY = 24 * 60

export const availabilityItemSchema = z
  .object({
    weekday: z
      .number()
      .int()
      .min(0, '星期取值 0-6')
      .max(6, '星期取值 0-6'),
    startMinute: z.number().int().min(0).max(MINUTES_PER_DAY - 1),
    endMinute: z.number().int().min(1).max(MINUTES_PER_DAY),
  })
  .refine((item) => item.endMinute > item.startMinute, {
    message: '结束时间必须晚于开始时间',
    path: ['endMinute'],
  })

export type AvailabilityItem = z.infer<typeof availabilityItemSchema>

/**
 * 全量覆盖式保存：前端每次提交「这个人这周的全部可用时间」。
 * 不做增量，因为增量要处理"删了哪一段"，比全量难对。
 */
export const setAvailabilitySchema = z
  .object({
    items: z.array(availabilityItemSchema).max(50, '最多 50 个时间段'),
  })
  .superRefine((value, ctx) => {
    // 同一天内不允许重叠。跨天不判断——23:00-24:00 和次日 00:00 是两回事。
    const byWeekday = new Map<number, Array<{ start: number; end: number; index: number }>>()

    value.items.forEach((item, index) => {
      const list = byWeekday.get(item.weekday)
      const entry = { start: item.startMinute, end: item.endMinute, index }
      if (list) {
        list.push(entry)
      } else {
        byWeekday.set(item.weekday, [entry])
      }
    })

    for (const [weekday, list] of byWeekday) {
      const sorted = [...list].sort((a, b) => a.start - b.start)

      for (let i = 1; i < sorted.length; i += 1) {
        const prev = sorted[i - 1]
        const current = sorted[i]
        if (!prev || !current) continue

        if (current.start < prev.end) {
          ctx.addIssue({
            code: 'custom',
            message: `星期 ${weekday} 的时间段有重叠，请先合并`,
            path: ['items', current.index, 'startMinute'],
          })
        }
      }
    }
  })

export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>
