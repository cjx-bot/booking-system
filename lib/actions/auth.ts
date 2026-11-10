'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/lib/auth'
import { loginFormSchema } from '@/lib/schemas/auth'
import { fail, ok, toFieldErrors, type ActionResult } from './types'

export async function loginAction(
  _prevState: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    callbackUrl: formData.get('callbackUrl') || undefined,
  })

  if (!parsed.success) {
    return fail('请检查填写的内容', toFieldErrors(parsed.error.issues))
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.callbackUrl ?? '/dashboard',
    })

    return ok(null)
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return fail('邮箱或密码不对')
      }
      return fail('登录失败，请稍后重试')
    }

    // signIn 成功时用异常实现跳转（NEXT_REDIRECT），必须原样抛出
    throw error
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
