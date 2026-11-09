'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { saveAvailability } from '@/lib/actions/availability'
import { minutesToLabel, labelToMinutes } from '@/lib/utils/timezone'

export type AvailabilityRow = {
  weekday: number
  startMinute: number
  endMinute: number
}

type Segment = { start: string; end: string }

const WEEKDAYS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 0, label: '周日' },
] as const

function buildInitial(rows: AvailabilityRow[]): Record<number, Segment[]> {
  const map: Record<number, Segment[]> = {}

  for (const { value } of WEEKDAYS) {
    const dayRows = rows
      .filter((row) => row.weekday === value)
      .sort((a, b) => a.startMinute - b.startMinute)
      .map((row) => ({
        start: minutesToLabel(row.startMinute),
        end: minutesToLabel(row.endMinute),
      }))

    map[value] = dayRows
  }

  return map
}

export function AvailabilityEditor({ rows }: { rows: AvailabilityRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState(() => buildInitial(rows))
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const totalSegments = useMemo(
    () => Object.values(state).reduce((sum, list) => sum + list.length, 0),
    [state],
  )

  function addSegment(weekday: number) {
    setState((prev) => ({
      ...prev,
      [weekday]: [...(prev[weekday] ?? []), { start: '09:00', end: '12:00' }],
    }))
    setSavedAt(null)
  }

  function removeSegment(weekday: number, index: number) {
    setState((prev) => ({
      ...prev,
      [weekday]: (prev[weekday] ?? []).filter((_, i) => i !== index),
    }))
    setSavedAt(null)
  }

  function updateSegment(
    weekday: number,
    index: number,
    field: 'start' | 'end',
    value: string,
  ) {
    setState((prev) => ({
      ...prev,
      [weekday]: (prev[weekday] ?? []).map((segment, i) =>
        i === index ? { ...segment, [field]: value } : segment,
      ),
    }))
    setSavedAt(null)
  }

  function handleSave() {
    setError(null)

    const items: Array<{ weekday: number; startMinute: number; endMinute: number }> = []
    const invalid: string[] = []

    for (const [weekdayKey, segments] of Object.entries(state)) {
      const weekday = Number(weekdayKey)

      for (const segment of segments) {
        const startMinute = labelToMinutes(segment.start)
        const endMinute = labelToMinutes(segment.end)

        if (startMinute === null || endMinute === null) {
          invalid.push('时间格式不对')
          continue
        }

        if (endMinute <= startMinute) {
          invalid.push(`${WEEKDAYS.find((d) => d.value === weekday)?.label ?? ''} 的结束时间必须晚于开始`)
          continue
        }

        items.push({ weekday, startMinute, endMinute })
      }
    }

    if (invalid.length > 0) {
      setError(invalid[0] ?? '请检查时间设置')
      return
    }

    startTransition(async () => {
      const result = await saveAvailability({ items })

      if (result.ok) {
        setSavedAt(Date.now())
        router.refresh()
        return
      }

      setError(result.error)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">可用时间</h1>
          <p className="mt-1 text-[13px] text-ink-secondary">
            只在这段时间里开放预约。时段按主理人所在时区计算。
          </p>
        </div>
        <Button onClick={handleSave} loading={pending} className="shrink-0">
          保存
        </Button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[12.5px] text-danger"
        >
          {error}
        </div>
      ) : null}

      {savedAt ? (
        <div
          role="status"
          className="rounded-field border border-success-line bg-success-soft px-3 py-2 text-[12.5px] text-success"
        >
          已保存，公开页的时段会立刻按新设置生成。
        </div>
      ) : null}

      <div className="overflow-hidden rounded-card border border-line bg-canvas">
        {WEEKDAYS.map((day, dayIndex) => {
          const segments = state[day.value] ?? []

          return (
            <div
              key={day.value}
              className={
                dayIndex === 0
                  ? 'grid gap-3 p-4 sm:grid-cols-[72px_1fr]'
                  : 'grid gap-3 border-t border-line p-4 sm:grid-cols-[72px_1fr]'
              }
            >
              <div className="flex items-center gap-2 sm:block">
                <span className="text-[13px] font-medium">{day.label}</span>
                {segments.length === 0 ? (
                  <span className="text-[11.5px] text-ink-muted sm:mt-1 sm:block">
                    休息
                  </span>
                ) : null}
              </div>

              <div className="space-y-2">
                {segments.map((segment, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={segment.start}
                      onChange={(event) =>
                        updateSegment(day.value, index, 'start', event.target.value)
                      }
                      className="tnum h-8 w-[92px] rounded-field border border-line-strong bg-canvas px-2 text-[12.5px] focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
                      aria-label={`${day.label}第 ${index + 1} 段的开始时间`}
                    />
                    <span className="text-[12px] text-ink-muted">—</span>
                    <input
                      type="time"
                      value={segment.end}
                      onChange={(event) =>
                        updateSegment(day.value, index, 'end', event.target.value)
                      }
                      className="tnum h-8 w-[92px] rounded-field border border-line-strong bg-canvas px-2 text-[12.5px] focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
                      aria-label={`${day.label}第 ${index + 1} 段的结束时间`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSegment(day.value, index)}
                      className="ml-0.5 rounded-field p-1 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
                      aria-label={`删除${day.label}第 ${index + 1} 段`}
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                        <path
                          d="m4 4 8 8M12 4l-8 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSegment(day.value)}
                  className="text-[12px] text-brand transition-colors hover:text-brand-hover"
                >
                  + 加一段
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11.5px] text-ink-muted">
        当前共 {totalSegments} 个时间段。同一天内的时间段不能重叠。
      </p>
    </div>
  )
}
