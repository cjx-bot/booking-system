import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: '概览' }

const MS_DAY = 86_400_000

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id
  const now = new Date()
  const weekLater = new Date(now.getTime() + 7 * MS_DAY)

  const [upcoming, totalConfirmed, cancelledCount, eventTypeCount, recent] =
    await Promise.all([
      prisma.booking.count({
        where: {
          hostId: userId,
          status: 'confirmed',
          startTime: { gte: now, lt: weekLater },
        },
      }),
      prisma.booking.count({ where: { hostId: userId, status: 'confirmed' } }),
      prisma.booking.count({ where: { hostId: userId, status: 'cancelled' } }),
      prisma.eventType.count({ where: { userId, isActive: true } }),
      prisma.booking.findMany({
        where: { hostId: userId },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: { eventType: { select: { title: true, duration: true } } },
      }),
    ])

  const stats = [
    { label: '未来 7 天', value: upcoming, hint: '已确认的预约' },
    { label: '累计预约', value: totalConfirmed, hint: '不含已取消' },
    { label: '已取消', value: cancelledCount, hint: '访客主动取消' },
    { label: '在售项目', value: eventTypeCount, hint: '启用中的事件类型' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">概览</h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          {session.user.name ?? session.user.email}，这是你最近的预约情况。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-[11.5px] font-medium text-ink-muted">{stat.label}</p>
            <p className="tnum mt-1 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <Card flush>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <CardTitle>最近预约</CardTitle>
          <Link
            href="/dashboard/bookings"
            className="text-[12px] text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
          >
            查看全部
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <CardDescription>还没有人预约。把你的链接发出去试试。</CardDescription>
            <Link
              href={`/${session.user.username}`}
              target="_blank"
              className="mt-3 inline-block rounded-field bg-brand px-3.5 py-2 text-[12.5px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
            >
              打开我的公开页
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {booking.guestName}
                    <span className="ml-1.5 font-normal text-ink-muted">
                      {booking.eventType.title}
                    </span>
                  </p>
                  <p className="tnum mt-0.5 text-[12px] text-ink-secondary">
                    {new Intl.DateTimeFormat('zh-CN', {
                      timeZone: session.user.timezone ?? 'Asia/Shanghai',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    }).format(booking.startTime)}
                  </p>
                </div>
                <Badge tone={booking.status === 'cancelled' ? 'danger' : 'success'}>
                  {booking.status === 'cancelled' ? '已取消' : '已确认'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
