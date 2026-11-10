import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { CAPABILITY_ICONS, type CapabilityIconName } from '@/components/ui/icons'
import { CAPABILITIES } from '@/lib/content/home'

export function CapabilityGrid() {
  return (
    <Section id="capabilities" tone="canvas">
      <Container>
        <div className="max-w-[52ch]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {CAPABILITIES.eyebrow}
          </p>
          <h2 className="text-section text-ink">{CAPABILITIES.title}</h2>
          <p className="text-body mt-3 text-ink-secondary">{CAPABILITIES.lead}</p>
        </div>

        <ul className="mt-[clamp(32px,4vw,52px)] grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.items.map((item) => {
            const Icon = CAPABILITY_ICONS[item.icon as CapabilityIconName]

            return (
              <li
                key={item.title}
                className="group bg-canvas p-5 transition-colors hover:bg-surface"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-field border border-line bg-surface text-ink-secondary transition-colors group-hover:border-brand-line group-hover:bg-brand-soft group-hover:text-brand-hover">
                  <Icon className="size-[18px]" />
                </span>

                <h3 className="text-card mt-3.5 text-ink">{item.title}</h3>
                <p className="text-small mt-1.5 text-ink-secondary">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}
