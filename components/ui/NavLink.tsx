import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export type NavLinkProps = {
  href: string
  children: React.ReactNode
  /** 当前所在区块。首页用锚点导航时通常只有 hover，不传即可。 */
  active?: boolean
  /** 站外链接自动加 target 与 rel */
  external?: boolean
  className?: string
}

/**
 * 导航项：hover 时下划线从左展开。
 * 下划线用 ::after 的 scaleX 实现而不是 border-bottom——
 * border 会改变行盒高度，导致导航项在 hover 时轻微跳动。
 */
export function NavLink({
  href,
  children,
  active = false,
  external = false,
  className,
}: NavLinkProps) {
  const classes = cn(
    'relative inline-flex items-center text-small text-ink-secondary',
    'transition-colors duration-150 hover:text-ink',
    'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full',
    'after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200',
    'hover:after:scale-x-100',
    active && 'text-ink after:scale-x-100',
    className,
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
