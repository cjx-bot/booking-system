import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** 加载中：禁用点击，插入转圈，保留原宽度避免布局跳动 */
  loading?: boolean
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-field font-medium whitespace-nowrap ' +
  'transition-colors duration-150 select-none ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'aria-busy:cursor-wait'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-hover',
  secondary:
    'bg-canvas text-ink border border-line-strong hover:bg-surface active:bg-surface-2',
  ghost: 'bg-transparent text-ink-secondary hover:bg-surface hover:text-ink',
  danger: 'bg-danger text-on-brand hover:brightness-95 active:brightness-90',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-[15px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  )
}
