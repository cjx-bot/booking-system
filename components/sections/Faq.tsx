import { Accordion } from '@/components/ui/Accordion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { FAQ } from '@/lib/content/home'

export function Faq() {
  return (
    <Section id="faq" tone="canvas" divided>
      <Container width="narrow">
        <div className="mb-[clamp(24px,3vw,36px)]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {FAQ.eyebrow}
          </p>
          <h2 className="text-section text-ink">{FAQ.title}</h2>
        </div>

        <Accordion items={[...FAQ.items]} single defaultOpenId="guest-account" />
      </Container>
    </Section>
  )
}
