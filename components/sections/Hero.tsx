import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { HERO } from '@/lib/content/home'

/** Hero 内的产品示意：用 CSS 画窗口框，不引外部图片 */
function SchedulePreview() {
  const days = [
    { label: '明天', date: '11/10' },
    { label: '周三', date: '11/11' },
    { label: '周四', date: '11/12', active: true },
    { label: '周五', date: '11/13' },
    { label: '周一', date: '11/16' },
  ]

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-card border border-line bg-canvas shadow-pop"
    >
      {/* 窗口栏 */}
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3 py-2">
        <span className="size-1.5 rounded-full bg-line-strong" />
        <span className="size-1.5 rounded-full bg-line-strong" />
        <span className="size-1.5 rounded-full bg-line-strong" />
        <span className="ml-1.5 truncate font-mono text-[10.5px] text-ink-muted">
          yoursite.com/demo/30min
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-tight text-ink">
              30 分钟初谈
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              林小满 · Asia/Shanghai
            </p>
          </div>
          <span className="shrink-0 rounded-pill bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-hover">
            30 分钟
          </span>
        </div>

        {/* 日期条 */}
        <div className="mt-3.5 flex gap-1 overflow-hidden">
          {days.map((day) => (
            <div
              key={day.date}
              className={
                day.active
                  ? 'flex min-w-0 flex-1 flex-col items-center rounded-[6px] bg-brand px-1 py-1.5 text-on-brand'
                  : 'flex min-w-0 flex-1 flex-col items-center rounded-[6px] border border-line px-1 py-1.5 text-ink'
              }
            >
              <span className="text-[8.5px] opacity-75">{day.label}</span>
              <span className="tnum mt-0.5 text-[10px] font-medium">{day.date}</span>
            </div>
          ))}
        </div>

        {/* 时段格 */}
        <div className="mt-2 grid grid-cols-3 gap-1">
          {times.map((time, index) => (
            <div
              key={time}
              className={
                index === 2
                  ? 'tnum rounded-[6px] bg-brand-soft py-1.5 text-center text-[10.5px] font-medium text-brand-hover ring-1 ring-brand-line'
                  : 'tnum rounded-[6px] border border-line py-1.5 text-center text-[10.5px] text-ink-secondary'
              }
            >
              {time}
            </div>
          ))}
        </div>

        <p className="mt-2.5 text-[9.5px] text-ink-muted">
          时间按访客所在时区显示
        </p>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="border-b border-line bg-canvas">
      <Container className="pt-[clamp(48px,6vw,88px)] pb-[clamp(44px,5.4vw,72px)]">
        <div className="grid items-center gap-[clamp(32px,4.6vw,56px)] lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]">
          <div>
            <p className="text-micro mb-4 inline-flex items-center gap-1.5 rounded-pill border border-brand-line bg-brand-soft px-2.5 py-1 font-medium tracking-normal text-brand-hover normal-case">
              {HERO.eyebrow}
            </p>

            {/* 两行是设计值：一行写完会失去停顿，三行则说明字太大了 */}
            <h1 className="text-hero max-w-[15em] text-ink">
              {HERO.title[0]}
              <br />
              {HERO.title[1]}
            </h1>

            <p className="text-lead mt-5 max-w-[42ch] text-ink-secondary">
              {HERO.lead}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link
                href={HERO.primaryCta.href}
                className="rounded-field bg-brand px-5 py-2.5 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
              >
                {HERO.primaryCta.label}
              </Link>
              <Link
                href={HERO.secondaryCta.href}
                className="rounded-field border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
              >
                {HERO.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="lg:pl-4">
            <SchedulePreview />
          </div>
        </div>

        {/* 受众行：5 个，灰色单色等距，替代 cal.com 的客户 logo 行 */}
        <div className="mt-[clamp(36px,4.6vw,60px)] border-t border-line pt-6">
          <p className="text-micro mb-3 text-ink-muted">{HERO.audienceLabel}</p>
          <ul className="flex flex-wrap items-center gap-x-[clamp(18px,3.4vw,42px)] gap-y-2">
            {HERO.audiences.map((name) => (
              <li
                key={name}
                className="text-[13px] font-medium tracking-tight text-ink-muted/85"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
