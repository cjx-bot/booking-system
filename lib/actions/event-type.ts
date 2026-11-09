'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import {
  createEventTypeSchema,
  deleteEventTypeSchema,
  updateEventTypeSchema,
} from '@/lib/schemas/event-type'
import { requireUserId } from './guard'
import { fail, ok, toFieldErrors, type ActionResult } from './types'

/**
 * Prisma 唯一约束冲突。用鸭子类型判断而不是 instanceof，
 * 是因为 Prisma 7 把错误类挂在生成客户端的命名空间下，
 * 直接依赖那个类会让 lib/actions 反向依赖生成产物。
 */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  )
}

export async function createEventType(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createEventTypeSchema.safeParse(input)
  if (!parsed.success) {
    return fail('请检查填写的内容', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  const { title, slug, description, duration, bufferBefore, bufferAfter, isActive } =
    parsed.data

  try {
    const created = await prisma.eventType.create({
      data: {
        userId,
        title,
        slug,
        description,
        duration,
        bufferBefore,
        bufferAfter,
        isActive,
      },
      select: { id: true },
    })

    revalidatePath('/dashboard/event-types')
    revalidatePath('/[username]', 'layout')

    return ok(created)
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return fail('这个短标识已经被占用，换一个', {
        slug: ['这个短标识已经被占用'],
      })
    }
    console.error('[createEventType]', error)
    return fail('创建失败，请稍后重试')
  }
}

export async function updateEventType(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateEventTypeSchema.safeParse(input)
  if (!parsed.success) {
    return fail('请检查填写的内容', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  const { id, ...rest } = parsed.data

  try {
    // where 同时带 userId：越权修改别人的事件类型会得到 P2025，而不是改成功
    const updated = await prisma.eventType.update({
      where: { id, userId },
      data: rest,
      select: { id: true },
    })

    revalidatePath('/dashboard/event-types')
    revalidatePath('/[username]', 'layout')

    return ok(updated)
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return fail('这个短标识已经被占用，换一个', {
        slug: ['这个短标识已经被占用'],
      })
    }
    console.error('[updateEventType]', error)
    return fail('保存失败，请稍后重试')
  }
}

export async function deleteEventType(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = deleteEventTypeSchema.safeParse(input)
  if (!parsed.success) {
    return fail('参数不合法', toFieldErrors(parsed.error.issues))
  }

  const userId = await requireUserId()
  if (!userId) return fail('请先登录')

  try {
    const deleted = await prisma.eventType.delete({
      where: { id: parsed.data.id, userId },
      select: { id: true },
    })

    revalidatePath('/dashboard/event-types')
    revalidatePath('/[username]', 'layout')

    return ok(deleted)
  } catch (error: unknown) {
    console.error('[deleteEventType]', error)
    return fail('删除失败：该事件类型可能已不存在')
  }
}
