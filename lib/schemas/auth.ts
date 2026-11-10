import { z } from 'zod'

/**
 * 凭证契约：只认邮箱和密码。
 *
 * 不要往里加 callbackUrl 之类的表单字段——Auth.js 传给 authorize 的
 * credentials 是整个 POST body，带任何额外字段都会让凭证校验因为
 * 「填错了别的东西」而失败，而错误却被报成「密码不对」。
 */
export const credentialsSchema = z.object({
  email: z.email('邮箱格式不对'),
  password: z.string().min(8, '密码至少 8 位'),
})

/** 表单契约：在凭证之外多一个回跳地址 */
export const loginFormSchema = credentialsSchema.extend({
  /** 登录成功后回跳的路径，必须站内相对路径，防止开放重定向 */
  callbackUrl: z
    .string()
    .startsWith('/', '回跳地址必须是站内路径')
    .optional(),
})

export type CredentialsInput = z.infer<typeof credentialsSchema>
export type LoginFormInput = z.infer<typeof loginFormSchema>
