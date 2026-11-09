import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

/**
 * 错误态用 aria-invalid 驱动样式，不额外传 error 布尔值——
 * 这样无障碍属性和视觉样式永远同步，不会出现「红了但屏幕阅读器不知道」。
 */
export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-field border border-line-strong bg-canvas px-3 text-sm text-ink',
        'placeholder:text-ink-muted',
        'transition-colors duration-150',
        'hover:border-ink-muted/60',
        'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted',
        'aria-invalid:border-danger aria-invalid:ring-danger/15',
        className,
      )}
      {...rest}
    />
  )
}
