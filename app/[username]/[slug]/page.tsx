import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { Badge } from '@/components/ui/Badge'
import { getBookableSlots } from '@/lib/queries/booking-page'
import { getEventTypeBySlug } from '@/lib/queries/event-types'

// 可用时段必须实时，任何缓存都会让访客选到已被约走的时间
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username, slug } = await params
  const eventType = await getEventTypeBySlug(username, slug)

  if (!eventType) return { title: '页面不存在' }

  return {
    title: `${eventType.title} · 预约`,
    description: eventType.description ?? `与 ${eventType.user.name ?? username} 约 ${eventType.duration} 分钟`,
  }
}

export default async function BookingPage({ params }: Props) {
  const { username, slug } = await params

  const eventType = await getEventTypeBySlug(username, slug)
  if (!eventType) notFound()

  const data = await getBookableSlots(eventType.id)

  const slots = (data?.slots ?? []).map((slot) => ({
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
  }))

  return (
    <main className="min-h-dvh bg-surface">
      <div className="container-page py-8 sm:py-12">
        <Link
          href={`/${username}`}
          className="mb-5 inline-flex items-center gap-1 text-[12px] text-ink-secondary transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
            <path
              d="M7.5 2.5 4 6l3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          返回 {eventType.user.name ?? username}
        </Link>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6">
          <section className="min-w-0 rounded-card border border-line bg-canvas p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[14px] font-semibold text-brand-hover">
                {(eventType.user.name ?? username).slice(0, 1)}
              </div>
              <p className="text-[13px] font-medium text-ink-secondary">
                {eventType.user.name ?? `@${username}`}
              </p>
            </div>

            <h1 className="text-[20px] font-semibold tracking-tight">
              {eventType.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{eventType.duration} 分钟</Badge>
              {eventType.bufferAfter > 0 ? (
                <Badge tone="neutral">
                  之后留 {eventType.bufferAfter} 分钟
                </Badge>
              ) : null}
            </div>

            {eventType.description ? (
              <p className="mt-3.5 text-[13px] leading-relaxed text-ink-secondary">
                {eventType.description}
              </p>
            ) : null}

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[12.5px]">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-ink-muted">时区</dt>
                <dd className="text-ink-secondary">{eventType.user.timezone}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-ink-muted">可约范围</dt>
                <dd className="text-ink-secondary">
                  未来 {data?.windowDays ?? 0} 天
                </dd>
              </div>
            </dl>
          </section>

          <section className="min-w-0">
            <BookingFlow
              eventTypeId={eventType.id}
              duration={eventType.duration}
              hostTimezone={eventType.user.timezone}
              slots={slots}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
