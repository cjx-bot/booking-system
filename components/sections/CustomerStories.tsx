import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { STORIES } from '@/lib/content/home'

export function CustomerStories() {
  return (
    <Section id="stories" tone="canvas" divided>
      <Container>
        <div className="max-w-[54ch]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {STORIES.eyebrow}
          </p>
          <h2 className="text-section text-ink">{STORIES.title}</h2>
          <p className="text-body mt-3 text-ink-secondary">{STORIES.lead}</p>
        </div>

        <div className="mt-[clamp(32px,4vw,52px)] space-y-3">
          {/* 大卡：三组数据 */}
          <div className="rounded-card border border-line bg-surface p-6 sm:p-7">
            <h3 className="text-card text-ink">{STORIES.primary.title}</h3>

            <dl className="mt-5 grid gap-5 sm:grid-cols-3">
              {STORIES.primary.metrics.map((metric) => (
                <div key={metric.label}>
                  <dd className="tnum text-[clamp(24px,2.6vw,30px)] leading-none font-semibold tracking-tight text-ink">
                    {metric.value}
                  </dd>
                  <dt className="text-small mt-1.5 text-ink-secondary">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>

            <p className="text-[11.5px] mt-5 border-t border-line pt-4 text-ink-muted">
              {STORIES.primary.note}
            </p>
          </div>

          {/* 三小卡 */}
          <div className="grid gap-3 sm:grid-cols-3">
            {STORIES.secondary.map((item) => (
              <div
                key={item.title}
                className="rounded-card border border-line bg-canvas p-5"
              >
                <h3 className="text-card text-ink">{item.title}</h3>
                <p className="text-small mt-1.5 text-ink-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
