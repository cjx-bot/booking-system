'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export type AccordionItem = {
  id: string
  question: string
  answer: string
}

export type AccordionProps = {
  items: AccordionItem[]
  /** 同时只允许展开一条（参考站的 FAQ 行为） */
  single?: boolean
  defaultOpenId?: string
  className?: string
}

/**
 * 用按钮 + aria-expanded 而不是 <details>：
 * 我们需要「同时只开一条」的行为，details 做不到；
 * 而 details 的 group-open 动画在不同浏览器下表现也不一致。
 * 键盘可访问性靠原生 button 保证：Tab 聚焦、Enter/Space 触发。
 */
export function Accordion({
  items,
  single = true,
  defaultOpenId,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : [],
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id)

      if (single) return isOpen ? [] : [id]

      return isOpen ? prev.filter((item) => item !== id) : [...prev, id]
    })
  }

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id)
        const panelId = `faq-panel-${item.id}`
        const buttonId = `faq-button-${item.id}`

        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-start gap-4 py-4 text-left transition-colors hover:text-brand-hover"
              >
                <span className="text-card flex-1">{item.question}</span>

                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 shrink-0 text-ink-muted transition-transform duration-200',
                    open && 'rotate-45',
                  )}
                >
                  <svg viewBox="0 0 16 16" className="size-4">
                    <path
                      d="M8 3.5v9M3.5 8h9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="pb-4 pr-8"
            >
              <p className="text-body text-ink-secondary">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
