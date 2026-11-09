import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  /** 必填标记，只影响展示，真正的必填校验在 Zod */
  required?: boolean
}

export function Label({
  className,
  required = false,
  children,
  ...rest
}: LabelProps) {
  return (
    <label
      className={cn('block text-[13px] font-medium text-ink', className)}
      {...rest}
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-danger">
          *
        </span>
      ) : null}
    </label>
  )
}
