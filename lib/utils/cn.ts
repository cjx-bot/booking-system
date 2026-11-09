/**
 * 类名拼接。只做真值过滤，不做 Tailwind 冲突合并。
 * 冲突靠「后写的类放在组件变体映射里」而不是运行时 merge，故意的：
 * runtime merge 会掩盖真正的问题——同一元素上写了互斥的类。
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}
