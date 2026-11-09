import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { getPublicEventTypes } from '@/lib/queries/event-types'
import { getUserByUsername } from '@/lib/queries/user'

export const revalidate = 300

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user) return { title: '页面不存在' }

  return {
    title: user.name ? `${user.name} 的预约页` : `@${username} 的预约页`,
    description: `选择一项服务，直接约时间。`,
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params

  const user = await getUserByUsername(username)
  if (!user) notFound()

  const eventTypes = await getPublicEventTypes(username)

  return (
    <main className="min-h-dvh bg-surface">
      <div className="container-narrow py-12 sm:py-16">
        <div className="mb-8 flex items-center gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[17px] font-semibold text-brand-hover">
            {(user.name ?? user.username).slice(0, 1)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-tight">
              {user.name ?? `@${user.username}`}
            </h1>
            <p className="text-[12.5px] text-ink-muted">
              {user.timezone.replace('_', ' ')}
            </p>
          </div>
        </div>

        <h2 className="mb-3 text-[13px] font-medium text-ink-secondary">
          选一项，直接约时间
        </h2>

        {eventTypes.length === 0 ? (
          <div className="rounded-card border border-line bg-canvas p-8 text-center">
            <p className="text-[14px] font-medium">还没有开放预约</p>
            <p className="mt-1.5 text-[13px] text-ink-secondary">
              主理人还没有创建任何可预约的项目
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {eventTypes.map((eventType) => (
              <li key={eventType.id}>
                <Link
                  href={`/${username}/${eventType.slug}`}
                  className="group flex items-start gap-3 rounded-card border border-line bg-canvas p-4 transition-colors hover:border-brand-line hover:bg-brand-soft/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[14.5px] font-semibold tracking-tight">
                        {eventType.title}
                      </h3>
                      <Badge tone="neutral">{eventType.duration} 分钟</Badge>
                    </div>

                    {eventType.description ? (
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-secondary">
                        {eventType.description}
                      </p>
                    ) : null}
                  </div>

                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ink-muted transition-colors group-hover:text-brand"
                  >
                    <svg viewBox="0 0 16 16" className="size-4">
                      <path
                        d="m6 3.5 4.5 4.5L6 12.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-[11.5px] text-ink-muted">
          由预约系统驱动
        </p>
      </div>
    </main>
  )
}
