import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ENT_ASSURANCE } from '@/lib/content/enterprise'

/**
 * 规格表布局：左标题 / 右说明，逐行分隔线。
 * 不用卡片是为了让「这是可以逐条核对的事实」这件事在视觉上成立——
 * 卡片会把它变成卖点，表格会把它变成条款。
 */
export function AssuranceList() {
  return (
    <Section id="assurance" tone="canvas" divided>
      <Container>
        <div className="max-w-[52ch]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {ENT_ASSURANCE.eyebrow}
          </p>
          <h2 className="text-section text-ink">{ENT_ASSURANCE.title}</h2>
          <p className="text-body mt-3 text-ink-secondary">{ENT_ASSURANCE.lead}</p>
        </div>

        <ul className="mt-[clamp(28px,3.4vw,44px)] border-t border-line">
          {ENT_ASSURANCE.items.map((item) => (
            <li
              key={item.title}
              className="grid gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)] sm:items-baseline sm:gap-6"
            >
              <h3 className="text-[13.5px] font-medium text-ink">{item.title}</h3>
              <p className="text-small text-ink-secondary">{item.body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[11.5px] text-ink-muted">
          这四条都写在代码里，可以当场复现，不是承诺。
        </p>
      </Container>
    </Section>
  )
}
