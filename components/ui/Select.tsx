import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

/**
 * 原生 select，只做外观定制。
 * 不自己实现下拉——自定义下拉要重写键盘导航、屏幕阅读器、移动端选择器，
 * 在本项目的收益远小于成本。
 */
export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-9 w-full appearance-none rounded-field border border-line-strong bg-canvas',
          'pl-3 pr-8 text-sm text-ink',
          'transition-colors duration-150 hover:border-ink-muted/60',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
          'disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted',
          'aria-invalid:border-danger aria-invalid:ring-danger/15',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-ink-muted"
      >
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
