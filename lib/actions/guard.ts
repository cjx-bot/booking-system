import { auth } from '@/lib/auth'

/**
 * 所有写操作的鉴权入口。
 * 返回 null 表示未登录，由调用方决定返回什么错误——
 * 不在这一层 redirect，因为 Server Action 里 redirect 会让表单失去错误提示。
 */
export async function requireUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/** 页面级守门：未登录直接跳登录页，并带上回跳地址 */
export async function requireSession() {
  const session = await auth()
  return session
}
