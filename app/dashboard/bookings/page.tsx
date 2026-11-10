import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { auth } from '@/lib/auth'
import { cancelBookingFromForm } from '@/lib/actions/booking'
import { getBookingsByHost } from '@/lib/queries/bookings'
import { cn } from '@/lib/utils/cn'

export const dynamic = 'force-dynamic'
export const metadata = { title: '预约列表' }

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'confirmed', label: '已确认' },
  { value: 'cancelled', label: '已取消' },
] as const

type Status = (typeof FILTERS)[number]['value']

type Props = {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function BookingsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const params = await searchParams
  const status: Status = FILTERS.some((item) => item.value === params.status)
    ? (params.status as Status)
    : 'all'
  const requestedPage = Math.max(1, Number(params.page) || 1)

  const data = await getBookingsByHost(session.user.id, {
    status,
    page: requestedPage,
    pageSize: 20,
  })

  // 页码超出上界时跳到最后一页。
  // 不夹上界的话 ?page=999999 会执行一个巨大的 skip，且页脚显示「第 999999 / 1 页」。
  if (data.items.length === 0 && requestedPage > 1) {
    redirect(`/dashboard/bookings?status=${status}&page=${data.totalPages}`)
  }

  const timezone = session.user.timezone ?? 'Asia/Shanghai'

  // Server Component 每次请求只执行一次，取当前时间不会造成「重渲染结果不稳定」
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()

  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone,
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">预约列表</h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          共 {data.total} 条 · 时间按 {timezone} 显示
        </p>
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/dashboard/bookings?status=${filter.value}`}
            className={cn(
              'rounded-field px-3 py-1.5 text-[12.5px] font-medium transition-colors',
              status === filter.value
                ? 'bg-brand-soft text-brand-hover'
                : 'text-ink-secondary hover:bg-surface-2',
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {data.items.length === 0 ? (
        <div className="rounded-card border border-line bg-canvas p-10 text-center">
          <p className="text-[14px] font-medium">没有预约</p>
          <p className="mt-1.5 text-[13px] text-ink-secondary">
            把公开页链接发出去，第一条预约就会出现在这里。
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.items.map((booking) => {
            const cancelled = booking.status === 'cancelled'
            const past = booking.startTime.getTime() < nowMs

            return (
              <li
                key={booking.id}
                className="rounded-card border border-line bg-canvas p-4"
              >
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold tracking-tight">
                        {booking.guestName}
                      </span>
                      <Badge tone={cancelled ? 'danger' : past ? 'neutral' : 'success'}>
                        {cancelled ? '已取消' : past ? '已完成' : '已确认'}
                      </Badge>
                    </div>

                    <p className="tnum mt-1 text-[13px] text-ink">
                      {dateFormatter.format(booking.startTime)}
                      <span className="ml-2 text-[12px] text-ink-muted">
                        {booking.eventType.title} · {booking.eventType.duration} 分钟
                      </span>
                    </p>

                    <p className="mt-0.5 break-all text-[12px] text-ink-secondary">
                      {booking.guestEmail}
                      <span className="ml-2 text-ink-muted">
                        {booking.guestTimezone}
                      </span>
                    </p>

                    {booking.notes ? (
                      <p className="mt-1.5 whitespace-pre-wrap rounded-field bg-surface px-2.5 py-1.5 text-[12px] leading-relaxed text-ink-secondary">
                        {booking.notes}
                      </p>
                    ) : null}
                  </div>

                  {!cancelled && !past ? (
                    <form action={cancelBookingFromForm} className="shrink-0">
                      <input type="hidden" name="id" value={booking.id} />
                      <button
                        type="submit"
                        className="rounded-field px-2.5 py-1.5 text-[12px] text-ink-secondary transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        取消
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/booking/${booking.id}`}
                      target="_blank"
                      className="shrink-0 rounded-field px-2.5 py-1.5 text-[12px] text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
                    >
                      查看
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {data.totalPages > 1 ? (
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-ink-muted">
            第 {data.page} / {data.totalPages} 页
          </span>
          <div className="flex gap-1.5">
            {data.page > 1 ? (
              <Link
                href={`/dashboard/bookings?status=${status}&page=${data.page - 1}`}
                className="rounded-field border border-line px-2.5 py-1.5 text-ink-secondary transition-colors hover:bg-surface"
              >
                上一页
              </Link>
            ) : null}
            {data.page < data.totalPages ? (
              <Link
                href={`/dashboard/bookings?status=${status}&page=${data.page + 1}`}
                className="rounded-field border border-line px-2.5 py-1.5 text-ink-secondary transition-colors hover:bg-surface"
              >
                下一页
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
