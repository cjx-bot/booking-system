import { z } from 'zod'
import { isValidTimeZone } from '@/lib/utils/timezone'

/** 访客时区：必须是 IANA 名，不接受 "+08:00" 这种偏移量 */
const timezoneSchema = z
  .string()
  .trim()
  .min(1, '缺少时区')
  .refine(isValidTimeZone, {
    message: '时区名不合法，应为 Asia/Shanghai 这类 IANA 名称',
  })

/** ISO 8601 且必须带时区信息（Z 或偏移），否则会被当成服务器本地时间 */
const isoDateTimeSchema = z
  .string()
  .min(1, '缺少时间')
  .refine((value) => /(?:Z|[+-]\d{2}:\d{2})$/.test(value), {
    message: '时间必须带时区标记（如 2026-11-10T02:00:00.000Z）',
  })
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: '时间格式不合法',
  })

export const createBookingSchema = z.object({
  eventTypeId: z.string().min(1, '缺少事件类型'),
  guestName: z
    .string()
    .trim()
    .min(1, '请填写姓名')
    .max(50, '姓名最多 50 个字'),
  guestEmail: z.email('邮箱格式不对'),
  guestTimezone: timezoneSchema,
  startTime: isoDateTimeSchema,
  notes: z
    .string()
    .trim()
    .max(500, '备注最多 500 个字')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export const bookingQuerySchema = z.object({
  status: z.enum(['all', 'confirmed', 'cancelled']).default('all'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

export const cancelBookingSchema = z.object({
  id: z.string().min(1, '缺少预约 ID'),
})

/** 公开预约页拉取某天可用时段时的入参 */
export const slotsQuerySchema = z.object({
  eventTypeId: z.string().min(1, '缺少事件类型'),
  /** 期望查看的日期，YYYY-MM-DD，按访客时区解释 */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  guestTimezone: timezoneSchema,
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type SlotsQueryInput = z.infer<typeof slotsQuerySchema>
