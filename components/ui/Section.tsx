import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export type SectionTone = 'canvas' | 'surface' | 'inverse'
export type SectionSpacing = 'normal' | 'tight' | 'loose'

export type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: SectionTone
  spacing?: SectionSpacing
  /** 顶部是否画一条分隔线。相邻同底色区块靠它区分。 */
  divided?: boolean
}

const tones: Record<SectionTone, string> = {
  canvas: 'bg-canvas text-ink',
  surface: 'bg-surface text-ink',
  // 深色区块：整页只允许出现一次，用来打断节奏
  inverse: 'bg-ink text-canvas',
}

/**
 * 区块间距的唯一来源。
 * clamp 让移动端不会太空、桌面端不会太挤，且不需要为每个区块单独写断点。
 */
const spacings: Record<SectionSpacing, string> = {
  normal: 'py-[clamp(52px,6.4vw,84px)]',
  tight: 'py-[clamp(36px,4.4vw,56px)]',
  loose: 'py-[clamp(64px,8vw,104px)]',
}

export function Section({
  tone = 'canvas',
  spacing = 'normal',
  divided = false,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        'relative',
        tones[tone],
        spacings[spacing],
        divided && 'border-t border-line',
        tone === 'inverse' && divided && 'border-white/10',
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  )
}
