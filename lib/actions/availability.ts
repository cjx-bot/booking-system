'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { setAvailabilitySchema } from '@/lib/schemas/availability'
import { requireUserId } from './guard'
import { fail, ok, toFieldErrors, type ActionResult } from './types'

/**
 * 全量覆盖保存：先删后插，包在同一个事务里。
 * 不做增量更新——增量要判断「哪段被删了、哪段改了」，
 * 在网络重试和并发下会出现「删了但没插回去」的半截状态。
 */
export async function saveAvailability(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const parsed = setAvailabilitySchema.safeParse(input)
  if (!parsed.success) {
    return fail('请检查时间设置', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  const rows = parsed.data.items.map((item) => ({
    userId,
    weekday: item.weekday,
    startMinute: item.startMinute,
    endMinute: item.endMinute,
  }))

  try {
    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { userId } }),
      prisma.availability.createMany({ data: rows }),
    ])

    revalidatePath('/dashboard/availability')
    revalidatePath('/[username]/[slug]', 'page')

    return ok({ count: rows.length })
  } catch (error: unknown) {
    console.error('[saveAvailability]', error)
    return fail('保存失败，请稍后重试')
  }
}
