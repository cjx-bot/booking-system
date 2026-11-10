import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PRINCIPLES } from '@/lib/content/home'

/**
 * 「证言」段的替身。
 * 我们没有可署名的真实客户证言，编三条假的比不做更糟。
 * 所以保留同样的版式节奏（大字引文 + 来源 + 三列），内容换成产品自己承认的取舍。
 */
export function Principles() {
  return (
    <Section id="principles" tone="surface" divided>
      <Container>
        <div className="max-w-[54ch]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {PRINCIPLES.eyebrow}
          </p>
          <h2 className="text-section text-ink">{PRINCIPLES.title}</h2>
          <p className="text-body mt-3 text-ink-secondary">{PRINCIPLES.lead}</p>
        </div>

        <ul className="mt-[clamp(32px,4vw,52px)] grid gap-3 md:grid-cols-3">
          {PRINCIPLES.items.map((item) => (
            <li
              key={item.source}
              className="flex flex-col rounded-card border border-line bg-canvas p-5"
            >
              <p className="text-[15px] leading-[1.7] text-ink">
                <span aria-hidden="true" className="mr-0.5 text-brand">
                  「
                </span>
                {item.quote}
                <span aria-hidden="true" className="text-brand">
                  」
                </span>
              </p>

              <p className="text-[11.5px] mt-auto pt-4 text-ink-muted">
                没有做的 · {item.source}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
