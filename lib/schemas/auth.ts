import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('邮箱格式不对'),
  password: z.string().min(8, '密码至少 8 位'),
  /** 登录成功后回跳的路径，必须站内相对路径，防止开放重定向 */
  callbackUrl: z
    .string()
    .startsWith('/', '回跳地址必须是站内路径')
    .optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
