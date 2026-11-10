import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ENT_OUTCOMES } from '@/lib/content/enterprise'

export function OutcomeStrip() {
  return (
    <Section tone="surface" divided spacing="tight">
      <Container>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-card text-ink">{ENT_OUTCOMES.title}</h2>
          <p className="text-[11.5px] max-w-[42ch] text-ink-muted">
            {ENT_OUTCOMES.note}
          </p>
        </div>

        <ul className="mt-5 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
          {ENT_OUTCOMES.items.map((item) => (
            <li key={item.headline} className="bg-canvas p-5">
              <p className="flex items-baseline gap-1">
                <span className="tnum text-[26px] leading-none font-semibold tracking-tight text-brand">
                  {item.metric}
                </span>
                <span className="text-[12px] text-ink-muted">{item.unit}</span>
              </p>

              <h3 className="text-card mt-3 text-ink">{item.headline}</h3>
              <p className="text-small mt-1.5 text-ink-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
