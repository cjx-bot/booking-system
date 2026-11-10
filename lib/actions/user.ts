'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { changePasswordSchema, updateProfileSchema } from '@/lib/schemas/user'
import { requireUserId } from './guard'
import { fail, ok, toFieldErrors, type ActionResult } from './types'

/**
 * 改密码。
 *
 * 必须验旧密码——否则拿到别人 session 的人可以直接改密码把账号锁死。
 * 改完不踢下线：JWT 里没有密码，当前会话继续有效；
 * 下次登录才需要新密码。
 */
export async function changePassword(
  input: unknown,
): Promise<ActionResult<null>> {
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return fail('请检查填写的内容', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })

  if (!user?.password) {
    return fail('这个账号还没有设置密码，无法通过这里修改')
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!matches) {
    return fail('当前密码不对', { currentPassword: ['当前密码不对'] })
  }

  try {
    const hash = await bcrypt.hash(parsed.data.newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    })

    revalidatePath('/dashboard/settings')

    return ok(null)
  } catch (error: unknown) {
    console.error('[changePassword]', error)
    return fail('修改失败，请稍后重试')
  }
}

export async function updateProfile(
  input: unknown,
): Promise<ActionResult<null>> {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return fail('请检查填写的内容', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: parsed.data.name ?? null },
    })

    // 名字出现在导航和公开页上，两处都要刷
    revalidatePath('/dashboard')
    revalidatePath('/[username]', 'layout')

    return ok(null)
  } catch (error: unknown) {
    console.error('[updateProfile]', error)
    return fail('保存失败，请稍后重试')
  }
}
