import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  /** narrow 用于阅读型内容（FAQ、条款），default 用于常规区块 */
  width?: 'default' | 'narrow'
}

/**
 * 全站唯一的内容宽度来源。
 * 直接用 globals.css 里已有的 container-page / container-narrow 工具类，
 * 不另建一套 max-width——两套宽度是「左右边缘对不齐」的根源。
 */
export function Container({
  width = 'default',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cn(
        width === 'narrow' ? 'container-narrow' : 'container-page',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
