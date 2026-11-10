import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { FOOTER_COLUMNS, FOOTER_NOTE } from '@/lib/content/home'

type FooterColumn = {
  title: string
  links: ReadonlyArray<{ label: string; href: string }>
}

type Props = {
  columns?: ReadonlyArray<FooterColumn>
  tagline?: string
  note?: string
}

export function SiteFooter({
  columns = FOOTER_COLUMNS,
  tagline = '一个人也够用的排期工具。发链接，客户自己挑时间。',
  note = FOOTER_NOTE,
}: Props) {
  return (
    <footer className="border-t border-line bg-canvas py-10">
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-[13.5px] font-semibold tracking-tight text-ink">
              预约系统
            </p>
            <p className="text-small mt-2 max-w-[26ch] text-ink-muted">
              {tagline}
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-[11.5px] mb-2.5 font-medium text-ink-muted">
                {column.title}
              </p>
              <ul className="space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-small text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5">
          <p className="text-[11.5px] text-ink-muted">{note}</p>
          <p className="text-[11.5px] text-ink-muted">
            © {new Date().getFullYear()} 保留所有权利
          </p>
        </div>
      </Container>
    </footer>
  )
}
