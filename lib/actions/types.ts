/**
 * 所有 Server Action 的统一返回形状。
 * 约定：action 不抛异常给调用方，失败也要返回结构化错误。
 * 例外只有 redirect() 和 notFound()——Next 用异常实现控制流，必须让它穿透。
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function fail<T = never>(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return { ok: false, error, fieldErrors }
}

/** Zod 校验失败时把 issue 转成 { 字段名: [错误...] }，给表单逐字段标红用 */
export function toFieldErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  for (const issue of issues) {
    const key = String(issue.path[0] ?? '_')
    const bucket = result[key]
    if (bucket) {
      bucket.push(issue.message)
    } else {
      result[key] = [issue.message]
    }
  }

  return result
}
