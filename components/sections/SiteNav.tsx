import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { NavLink } from '@/components/ui/NavLink'
import { NAV_ITEMS } from '@/lib/content/home'

/**
 * 顶部导航。
 * 粘顶 + 半透明毛玻璃，不需要滚动监听：滚动状态变化用 JS 会让首屏多一次
 * 强制同步布局，而视觉收益只有「加一条阴影」。
 */
export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/88 backdrop-blur-md">
      <Container className="flex h-14 items-center gap-6">
        <Link
          href="/"
          className="shrink-0 text-[13.5px] font-semibold tracking-tight text-ink"
        >
          预约系统
        </Link>

        <nav
          aria-label="主导航"
          className="hidden items-center gap-5 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/login"
            className="rounded-field px-3 py-1.5 text-small text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
          >
            登录
          </Link>
          <Link
            href="/login"
            className="rounded-field bg-brand px-3.5 py-1.5 text-small font-medium text-on-brand transition-colors hover:bg-brand-hover"
          >
            免费开始
          </Link>
        </div>
      </Container>

      {/* 移动端导航：横向可滚，不折叠成汉堡菜单——只有 5 项，折叠反而多一次点击 */}
      <div className="border-t border-line md:hidden">
        <Container className="flex gap-4 overflow-x-auto py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} className="whitespace-nowrap">
              {item.label}
            </NavLink>
          ))}
        </Container>
      </div>
    </header>
  )
}
