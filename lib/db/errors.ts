/**
 * Prisma 错误判定。
 *
 * 用鸭子类型而不是 instanceof：Prisma 7 把错误类挂在生成客户端的命名空间下，
 * 直接依赖那个类会让 lib/ 下的手写模块反向依赖生成产物。
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  )
}

/** P2025：记录不存在（update/delete 的 where 没命中） */
export function isRecordNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2025'
  )
}
