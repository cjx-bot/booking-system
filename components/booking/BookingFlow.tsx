'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { createBooking } from '@/lib/actions/booking'

export type SerializedSlot = {
  start: string
  end: string
}

type Props = {
  eventTypeId: string
  duration: number
  hostTimezone: string
  slots: SerializedSlot[]
}

type DayGroup = {
  date: string
  weekdayLabel: string
  dayLabel: string
  isToday: boolean
  isTomorrow: boolean
  slots: SerializedSlot[]
}

const WEEKDAY_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

function weekdayFormatter(timeZone: string) {
  const cached = WEEKDAY_FORMATTER_CACHE.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    weekday: 'short',
  })
  WEEKDAY_FORMATTER_CACHE.set(timeZone, formatter)
  return formatter
}

function dateLabelFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    month: 'numeric',
    day: 'numeric',
  })
}

function timeFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** 把 UTC 时刻按访客时区分组成「一天一组」 */
function groupByDay(slots: SerializedSlot[], timeZone: string): DayGroup[] {
  const weekdayFmt = weekdayFormatter(timeZone)
  const dateFmt = dateLabelFormatter(timeZone)

  const todayMs = Date.now()
  const todayKey = new Date(todayMs).toLocaleDateString('en-CA', { timeZone })
  const tomorrowKey = new Date(todayMs + 86_400_000).toLocaleDateString('en-CA', {
    timeZone,
  })

  const groups = new Map<string, DayGroup>()

  for (const slot of slots) {
    const start = new Date(slot.start)
    const key = start.toLocaleDateString('en-CA', { timeZone })

    const existing = groups.get(key)
    if (existing) {
      existing.slots.push(slot)
      continue
    }

    groups.set(key, {
      date: key,
      weekdayLabel: weekdayFmt.format(start),
      dayLabel: dateFmt.format(start),
      isToday: key === todayKey,
      isTomorrow: key === tomorrowKey,
      slots: [slot],
    })
  }

  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function BookingFlow({ eventTypeId, duration, hostTimezone, slots }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 访客时区只能在浏览器拿到；服务端渲染时先用主理人时区占位，
  // 挂载后立刻用真实时区覆盖（分组在 memo 里重算，不会闪）
  const [guestTimezone] = useState<string>(() => {
    if (typeof Intl === 'undefined') return hostTimezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone || hostTimezone
  })

  const days = useMemo(() => groupByDay(slots, guestTimezone), [slots, guestTimezone])

  const [selectedDate, setSelectedDate] = useState<string | null>(
    days[0]?.date ?? null,
  )
  const [selectedSlot, setSelectedSlot] = useState<SerializedSlot | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeDay = days.find((day) => day.date === selectedDate) ?? days[0] ?? null
  const timeFmt = timeFormatter(guestTimezone)

  function handleSubmit(formData: FormData) {
    if (!selectedSlot) return
    setError(null)

    startTransition(async () => {
      const result = await createBooking({
        eventTypeId,
        guestName: formData.get('guestName'),
        guestEmail: formData.get('guestEmail'),
        notes: formData.get('notes') ?? undefined,
        guestTimezone,
        startTime: selectedSlot.start,
      })

      if (result.ok) {
        router.push(`/booking/${result.data.id}`)
        return
      }

      setError(result.error)
    })
  }

  if (days.length === 0) {
    return (
      <div className="rounded-card border border-line bg-canvas p-8 text-center">
        <p className="text-[14px] font-medium text-ink">最近两周都约满了</p>
        <p className="mt-1.5 text-[13px] text-ink-secondary">
          换个时间再来看看，或者直接联系主理人
        </p>
      </div>
    )
  }

  // ---- 已选时段：进入填表视图 ----
  if (selectedSlot) {
    return (
      <div className="min-w-0 rounded-card border border-line bg-canvas p-5">
        <button
          type="button"
          onClick={() => {
            setSelectedSlot(null)
            setError(null)
          }}
          className="mb-4 inline-flex items-center gap-1 text-[12px] text-ink-secondary transition-colors hover:text-ink"
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
          换一个时间
        </button>

        <div className="mb-5 rounded-field bg-brand-soft px-3.5 py-3">
          <p className="text-[13px] font-semibold text-brand-hover">
            {weekdayFormatter(guestTimezone).format(new Date(selectedSlot.start))}{' '}
            {dateLabelFormatter(guestTimezone).format(new Date(selectedSlot.start))}
          </p>
          <p className="tnum mt-0.5 text-[15px] font-semibold text-brand-hover">
            {timeFmt.format(new Date(selectedSlot.start))}
            <span className="ml-1.5 text-[12px] font-normal">
              — {timeFmt.format(new Date(selectedSlot.end))}
            </span>
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="guestName" required>
              你的名字
            </Label>
            <Input
              id="guestName"
              name="guestName"
              required
              maxLength={50}
              autoComplete="name"
              placeholder="怎么称呼你"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guestEmail" required>
              邮箱
            </Label>
            <Input
              id="guestEmail"
              name="guestEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="用来收确认邮件"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">想聊什么（选填）</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={500}
              placeholder="提前说一下背景，能省不少时间"
              className="w-full resize-y rounded-field border border-line-strong bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted transition-colors hover:border-ink-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[13px] text-danger"
            >
              {error}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="w-full" loading={isPending}>
            {isPending ? '提交中' : '确认预约'}
          </Button>

          <p className="text-center text-[11.5px] leading-relaxed text-ink-muted">
            提交后你会收到确认邮件。时间按
            <span className="mx-1 font-medium text-ink-secondary">{guestTimezone}</span>
            显示。
          </p>
        </form>
      </div>
    )
  }

  // ---- 未选时段：日期 + 时段 ----
  return (
    <div className="min-w-0 rounded-card border border-line bg-canvas">
      <div className="min-w-0 border-b border-line px-4 py-3">
        <p className="text-[12px] font-medium text-ink-muted">选择日期</p>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {days.map((day) => {
            const active = day.date === activeDay?.date

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                aria-pressed={active}
                className={
                  active
                    ? 'flex min-w-[58px] flex-col items-center rounded-field border border-brand bg-brand px-2.5 py-2 text-on-brand'
                    : 'flex min-w-[58px] flex-col items-center rounded-field border border-line px-2.5 py-2 text-ink transition-colors hover:border-line-strong hover:bg-surface'
                }
              >
                <span className="text-[10.5px] opacity-80">
                  {day.isToday ? '今天' : day.isTomorrow ? '明天' : day.weekdayLabel}
                </span>
                <span className="tnum mt-0.5 text-[13px] font-semibold">
                  {day.dayLabel}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[12px] font-medium text-ink-muted">选择时间</p>
          <Badge tone="neutral">{duration} 分钟</Badge>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {activeDay?.slots.map((slot) => (
            <button
              key={slot.start}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className="tnum rounded-field border border-line-strong bg-canvas py-2 text-[13px] font-medium text-ink transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-hover"
            >
              {timeFmt.format(new Date(slot.start))}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          时间按 {guestTimezone} 显示 · 主理人时区 {hostTimezone}
        </p>
      </div>
    </div>
  )
}
