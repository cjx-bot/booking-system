/**
 * 鉴权守门。T1.2 阶段先留占位，T2.1 接入 Auth.js 后把这里换成真实实现。
 *
 * 为什么单独抽一个函数而不是每个 action 里写一遍 auth()：
 * 1. 所有 action 的鉴权口径只在一处改
 * 2. 以后要加「角色」「组织」时，改这里就够
 */
export async function requireUserId(): Promise<string | null> {
  // TODO(T2.1): const session = await auth(); return session?.user?.id ?? null
  return null
}
