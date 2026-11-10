import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { CAPABILITY_ICONS, type CapabilityIconName } from '@/components/ui/icons'
import { ENT_CAPABILITIES, ENT_AUDIENCES } from '@/lib/content/enterprise'

/**
 * 左侧标题固定在视野里，右侧是四条能力的纵向清单。
 * 刻意不用网格——首页已经有一个 3×2 的能力网格，
 * 企业版再用网格会和首页撞脸，且「规则」这件事本身就是清单式的。
 */
export function EnterpriseCapabilities() {
  return (
    <Section id="capabilities" tone="canvas" divided>
      <Container>
        <div className="grid gap-[clamp(28px,3.6vw,48px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-micro mb-3 font-medium text-brand normal-case">
              {ENT_CAPABILITIES.eyebrow}
            </p>
            <h2 className="text-section text-ink">
              {ENT_CAPABILITIES.title[0]}
              <br className="hidden sm:block" />
              {ENT_CAPABILITIES.title[1]}
            </h2>
            <p className="text-body mt-3 text-ink-secondary">
              {ENT_CAPABILITIES.lead}
            </p>

            <div className="mt-6 border-t border-line pt-4">
              <p className="text-[11px] mb-2 text-ink-muted">
                {ENT_AUDIENCES.label}
              </p>
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {ENT_AUDIENCES.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-field border border-line px-2 py-0.5 text-[11.5px] text-ink-secondary"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="divide-y divide-line border-t border-line">
            {ENT_CAPABILITIES.items.map((item) => {
              const Icon = CAPABILITY_ICONS[item.icon as CapabilityIconName]

              return (
                <li key={item.title} className="group flex gap-4 py-5">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-field border border-line bg-surface text-ink-secondary transition-colors group-hover:border-brand-line group-hover:bg-brand-soft group-hover:text-brand-hover">
                    <Icon className="size-4" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-card text-ink">{item.title}</h3>
                    <p className="text-small mt-1 text-ink-secondary">{item.body}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
