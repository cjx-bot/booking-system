import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink-secondary border-line',
  brand: 'bg-brand-soft text-brand-hover border-brand-line',
  success: 'bg-success-soft text-success border-success-line',
  warning: 'bg-warning-soft text-warning border-warning-line',
  danger: 'bg-danger-soft text-danger border-danger-line',
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5',
        'text-[11px] font-medium leading-5 whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}
