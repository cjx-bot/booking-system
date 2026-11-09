import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { getBookingById } from '@/lib/queries/bookings'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export const metadata = { title: '预约详情' }

function formatFull(instant: Date, timeZone: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant)
}

function formatTime(instant: Date, timeZone: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant)
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params

  const booking = await getBookingById(id)
  if (!booking) notFound()

  const cancelled = booking.status === 'cancelled'

  return (
    <main className="min-h-dvh bg-surface">
      <div className="container-narrow py-10 sm:py-14">
        {cancelled ? (
          <div className="mb-5 rounded-card border border-danger-line bg-danger-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-danger">这次预约已取消</p>
            <p className="mt-0.5 text-[12.5px] text-danger/90">
              时间已经释放，其他人可以约了。
            </p>
          </div>
        ) : (
          <div className="mb-5 rounded-card border border-success-line bg-success-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-success">预约已确认</p>
            <p className="mt-0.5 text-[12.5px] text-success/90">
              确认邮件正在发送，注意查收（含日历附件）。
            </p>
          </div>
        )}

        <div className="rounded-card border border-line bg-canvas p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[18px] font-semibold tracking-tight">
                {booking.eventType.title}
              </h1>
              <p className="mt-1 text-[12.5px] text-ink-secondary">
                与 {booking.host.name ?? `@${booking.host.username}`}
              </p>
            </div>
            <Badge tone={cancelled ? 'danger' : 'success'}>
              {cancelled ? '已取消' : '已确认'}
            </Badge>
          </div>

          <div className="mt-5 space-y-3 border-t border-line pt-4">
            <div>
              <p className="text-[11.5px] font-medium text-ink-muted">
                你的时区 · {booking.guestTimezone}
              </p>
              <p className="tnum mt-0.5 text-[15px] font-semibold text-ink">
                {formatFull(booking.startTime, booking.guestTimezone)}
              </p>
              <p className="tnum text-[12.5px] text-ink-secondary">
                {formatTime(booking.startTime, booking.guestTimezone)} —{' '}
                {formatTime(booking.endTime, booking.guestTimezone)}
              </p>
            </div>

            {booking.guestTimezone !== booking.host.timezone ? (
              <div className="rounded-field bg-surface px-3 py-2.5">
                <p className="text-[11.5px] font-medium text-ink-muted">
                  主理人时区 · {booking.host.timezone}
                </p>
                <p className="tnum mt-0.5 text-[13px] font-medium text-ink-secondary">
                  {formatFull(booking.startTime, booking.host.timezone)}
                </p>
              </div>
            ) : null}
          </div>

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[12.5px]">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-ink-muted">姓名</dt>
              <dd className="text-ink">{booking.guestName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-ink-muted">邮箱</dt>
              <dd className="break-all text-ink">{booking.guestEmail}</dd>
            </div>
            {booking.notes ? (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-ink-muted">备注</dt>
                <dd className="whitespace-pre-wrap text-ink-secondary">
                  {booking.notes}
                </dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-ink-muted">编号</dt>
              <dd className="break-all font-mono text-[11.5px] text-ink-muted">
                {booking.id}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-6 text-center text-[11.5px] leading-relaxed text-ink-muted">
          这个页面可以收藏，之后凭链接回来查看。
          <br />
          需要改期请直接联系主理人。
        </p>

        <div className="mt-5 text-center">
          <Link
            href={`/${booking.host.username}`}
            className="text-[12.5px] text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
          >
            再约一个时间
          </Link>
        </div>
      </div>
    </main>
  )
}
