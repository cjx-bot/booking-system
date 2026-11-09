import { z } from 'zod'

/**
 * slug 规则：小写字母数字 + 连字符，不能以连字符开头或结尾，不能连续连字符。
 * 这个规则同时用于公开页 URL 和后台表单，改一处即全站生效。
 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, '请填写短标识')
  .max(40, '短标识最多 40 个字符')
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    '只能用英文小写字母、数字和连字符，且连字符不能出现在首尾',
  )

export const eventTypeBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '请填写标题')
    .max(60, '标题最多 60 个字'),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .max(500, '描述最多 500 个字')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  duration: z
    .number()
    .int('时长必须是整数分钟')
    .min(5, '时长至少 5 分钟')
    .max(480, '时长最多 480 分钟'),
  bufferBefore: z.number().int().min(0).max(120).default(0),
  bufferAfter: z.number().int().min(0).max(120).default(0),
  isActive: z.boolean().default(true),
})

export const createEventTypeSchema = eventTypeBaseSchema

export const updateEventTypeSchema = eventTypeBaseSchema.extend({
  id: z.string().min(1, '缺少事件类型 ID'),
})

export const deleteEventTypeSchema = z.object({
  id: z.string().min(1, '缺少事件类型 ID'),
})

export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>
export type DeleteEventTypeInput = z.infer<typeof deleteEventTypeSchema>
