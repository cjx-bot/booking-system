import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { CheckIcon } from '@/components/ui/icons'
import { ENT_HERO } from '@/lib/content/enterprise'

/**
 * 组织排期示意：三条泳道 = 三个成员，每格是一个时间片。
 * 中间那列三人都是空的，就是「可以开会」的时刻——
 * 这个交集是企业版和单人版最本质的差别，所以放进 Hero。
 */
const LANES = [
  { name: '张', pattern: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1] },
  { name: '李', pattern: [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1] },
  { name: '王', pattern: [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0] },
]

/** 三人同时为空的那一格 */
const OVERLAP_INDEX = 6

function OrgPreview() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-card border border-line bg-canvas shadow-pop"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-2">
        <span className="font-mono text-[10.5px] text-ink-muted">
          yourcompany.com/team
        </span>
        <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-medium text-brand-hover">
          3 位成员
        </span>
      </div>

      <div className="p-3.5">
        <div className="space-y-1.5">
          {LANES.map((lane) => (
            <div key={lane.name} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[9.5px] font-medium text-ink-secondary">
                {lane.name}
              </span>

              <div className="grid flex-1 grid-cols-12 gap-[3px]">
                {lane.pattern.map((filled, index) => {
                  const isOverlap = index === OVERLAP_INDEX

                  if (isOverlap) {
                    return (
                      <span
                        key={index}
                        className="h-4 rounded-[2px] bg-brand ring-1 ring-brand ring-offset-1 ring-offset-canvas"
                      />
                    )
                  }

                  return (
                    <span
                      key={index}
                      className={
                        filled
                          ? 'h-4 rounded-[2px] bg-surface-2'
                          : 'h-4 rounded-[2px] border border-dashed border-line'
                      }
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 时间刻度 */}
        <div className="mt-2 flex items-center gap-2">
          <span className="size-5 shrink-0" />
          <div className="grid flex-1 grid-cols-4">
            {['09:00', '10:00', '11:00', '12:00'].map((time) => (
              <span key={time} className="tnum text-[9px] text-ink-muted">
                {time}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5">
          <span className="size-2 rounded-full bg-brand" />
          <span className="text-[10px] text-ink-secondary">
            三人都空的时段才会出现在客户眼前
          </span>
        </div>
      </div>
    </div>
  )
}

export function EnterpriseHero() {
  return (
    <section className="border-b border-line bg-canvas">
      <Container className="pt-[clamp(44px,5.4vw,80px)] pb-[clamp(40px,4.8vw,64px)]">
        <div className="grid items-center gap-[clamp(30px,4.2vw,52px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <div>
            <p className="text-micro mb-4 inline-flex items-center gap-1.5 rounded-pill border border-line px-2.5 py-1 font-medium tracking-normal text-ink-secondary normal-case">
              {ENT_HERO.eyebrow}
            </p>

            <h1 className="text-hero max-w-[15em] text-ink">
              {ENT_HERO.title[0]}
              <br />
              {ENT_HERO.title[1]}
            </h1>

            <p className="text-lead mt-5 max-w-[46ch] text-balance text-ink-secondary">
              {ENT_HERO.lead}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link
                href={ENT_HERO.primary.href}
                className="rounded-field bg-brand px-5 py-2.5 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
              >
                {ENT_HERO.primary.label}
              </Link>
              <Link
                href={ENT_HERO.secondary.href}
                className="rounded-field border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
              >
                {ENT_HERO.secondary.label}
              </Link>
            </div>
          </div>

          <div className="lg:pl-3">
            <OrgPreview />
          </div>
        </div>

        {/* 四条硬指标：用竖线分隔，不用卡片——这一行是「声明」不是「功能」 */}
        <ul className="mt-[clamp(32px,4vw,52px)] grid gap-y-2 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {ENT_HERO.proofs.map((proof, index) => (
            <li
              key={proof}
              className={
                index === 0
                  ? 'flex items-start gap-2 pr-4'
                  : 'flex items-start gap-2 border-line pr-4 lg:border-l lg:pl-4'
              }
            >
              <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-brand" />
              <span className="text-[12.5px] leading-snug text-ink-secondary">
                {proof}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
