import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { CheckIcon } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { FINAL_CTA } from '@/lib/content/home'

export function FinalCta() {
  return (
    <Section tone="inverse" spacing="loose">
      <Container>
        <div className="mx-auto max-w-[34em] text-center">
          <h2 className="text-section text-balance text-canvas">
            {FINAL_CTA.title[0]}
            <br className="hidden sm:block" />
            {FINAL_CTA.title[1]}
          </h2>
          <p className="text-lead mt-3 text-balance text-canvas/70">{FINAL_CTA.lead}</p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href={FINAL_CTA.primary.href}
              className="rounded-field bg-canvas px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-canvas/90"
            >
              {FINAL_CTA.primary.label}
            </Link>
            <Link
              href={FINAL_CTA.secondary.href}
              className="rounded-field border border-canvas/25 px-5 py-2.5 text-[14px] font-medium text-canvas transition-colors hover:bg-canvas/10"
            >
              {FINAL_CTA.secondary.label}
            </Link>
          </div>

          <p className="text-[12px] mt-5 inline-flex items-center gap-1.5 text-canvas/55">
            <CheckIcon className="size-3.5" />
            {FINAL_CTA.footnote}
          </p>
        </div>
      </Container>
    </Section>
  )
}
