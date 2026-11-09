'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** 底部操作区 */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const

/**
 * 用原生 <dialog> + showModal()：
 * 焦点陷阱、ESC 关闭、背景 inert、屏幕阅读器语义都是浏览器给的，
 * 自己用 div 实现的版本几乎都会在某个环节漏掉。
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // 浏览器原生 close（点背景 / ESC）也要同步回 React 状态
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleClose = () => onClose()
    el.addEventListener('close', handleClose)
    return () => el.removeEventListener('close', handleClose)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      className={cn(
        'w-[calc(100vw-32px)] rounded-card border border-line bg-canvas p-0 text-ink',
        'backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]',
        'open:flex open:flex-col',
        sizes[size],
      )}
      // 点遮罩关闭：dialog 自身覆盖全屏时，点击目标是 dialog 本身
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="space-y-1">
          <h2 id="dialog-title" className="text-[15px] font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="-mr-1 -mt-1 rounded-field p-1.5 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
            <path
              d="m4 4 8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

      {footer ? (
        <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface px-5 py-3">
          {footer}
        </footer>
      ) : null}
    </dialog>
  )
}
