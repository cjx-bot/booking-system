import Link from 'next/link'
import { Accordion } from '@/components/ui/Accordion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ENT_CTA, ENT_FAQ } from '@/lib/content/enterprise'

export function EnterpriseFaq() {
  return (
    <Section id="faq" tone="surface" divided>
      <Container width="narrow">
        <div className="mb-[clamp(24px,3vw,34px)]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {ENT_FAQ.eyebrow}
          </p>
          <h2 className="text-section text-ink">{ENT_FAQ.title}</h2>
        </div>

        <Accordion items={[...ENT_FAQ.items]} single defaultOpenId="sso" />
      </Container>
    </Section>
  )
}

export function EnterpriseCta() {
  return (
    <Section tone="canvas" spacing="loose">
      <Container>
        <div className="mx-auto max-w-[34em] text-center">
          <h2 className="text-section text-balance text-ink">{ENT_CTA.title}</h2>
          <p className="text-lead mt-3 text-balance text-ink-secondary">
            {ENT_CTA.lead}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href={ENT_CTA.primary.href}
              className="rounded-field bg-brand px-5 py-2.5 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
            >
              {ENT_CTA.primary.label}
            </Link>
            <Link
              href={ENT_CTA.secondary.href}
              className="rounded-field border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
            >
              {ENT_CTA.secondary.label}
            </Link>
          </div>

          <p className="text-[12px] mt-5 text-ink-muted">{ENT_CTA.footnote}</p>
        </div>
      </Container>
    </Section>
  )
}
