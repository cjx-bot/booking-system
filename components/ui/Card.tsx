import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** 去掉内边距，用于图片/表格贴边 */
  flush?: boolean
  /** 可点击卡片：加 hover 微交互 */
  interactive?: boolean
}

export function Card({
  className,
  flush = false,
  interactive = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-canvas shadow-card',
        !flush && 'p-5',
        interactive &&
          'transition-shadow duration-150 hover:border-line-strong hover:shadow-pop',
        className,
      )}
      {...rest}
    />
  )
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1', className)} {...rest} />
}

export function CardTitle({
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-[15px] font-semibold tracking-tight text-ink', className)}
      {...rest}
    />
  )
}

export function CardDescription({
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[13px] leading-relaxed text-ink-secondary', className)} {...rest} />
  )
}
