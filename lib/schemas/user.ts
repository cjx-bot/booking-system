import { z } from 'zod'

/**
 * bcrypt 只取前 72 字节，超出的部分会被静默截断。
 * 按字符数限制不够（一个汉字 3 字节），所以按 UTF-8 字节数算。
 */
function byteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '请输入当前密码'),
    newPassword: z
      .string()
      .min(8, '新密码至少 8 位')
      .refine((value) => byteLength(value) <= 72, {
        message: '新密码太长了，换短一点的',
      }),
    confirmPassword: z.string().min(1, '请再输一次新密码'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: '新密码不能和当前密码相同',
    path: ['newPassword'],
  })

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(40, '名字最多 40 个字')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
