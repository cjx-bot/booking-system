import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ENT_SCALE } from '@/lib/content/enterprise'

/**
 * 整页唯一的深色区。
 * 深色在这里不是装饰——它把「系统的边界」这一段和上面的功能介绍分开，
 * 让读者知道接下来是另一类信息（规格，不是卖点）。
 */
export function ScaleBand() {
  return (
    <Section id="scale" tone="inverse" spacing="loose">
      <Container>
        <div className="max-w-[52ch]">
          <p className="text-micro mb-3 font-medium text-canvas/50 normal-case">
            {ENT_SCALE.eyebrow}
          </p>
          <h2 className="text-section text-canvas">{ENT_SCALE.title}</h2>
          <p className="text-body mt-3 text-canvas/65">{ENT_SCALE.lead}</p>
        </div>

        <dl className="mt-[clamp(32px,4vw,52px)] grid gap-y-7 border-t border-canvas/15 pt-7 sm:grid-cols-2 lg:grid-cols-4">
          {ENT_SCALE.metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={
                index === 0
                  ? 'pr-5'
                  : 'border-canvas/15 pr-5 sm:border-l sm:pl-5'
              }
            >
              <dd className="flex items-baseline gap-1.5">
                <span className="tnum text-[clamp(30px,3.4vw,40px)] leading-none font-semibold tracking-tight text-canvas">
                  {metric.value}
                </span>
                <span className="text-[12px] text-canvas/60">{metric.unit}</span>
              </dd>

              <dt className="mt-2.5 text-[13px] font-medium text-canvas/80">
                {metric.label}
              </dt>
              {/* 55% 是在 ink 底色上仍能过 4.5:1 的最低值，再低就不合格了 */}
              <p className="mt-1 text-[11.5px] leading-relaxed text-canvas/55">
                {metric.note}
              </p>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  )
}
