'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const items = [
  { href: '/dashboard', label: '概览', exact: true },
  { href: '/dashboard/event-types', label: '事件类型' },
  { href: '/dashboard/availability', label: '可用时间' },
  { href: '/dashboard/bookings', label: '预约列表' },
  { href: '/dashboard/settings', label: '账号设置' },
] as const

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
      {items.map((item) => {
        const active =
          'exact' in item && item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-field px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-brand-soft text-brand-hover'
                : 'text-ink-secondary hover:bg-surface hover:text-ink',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
