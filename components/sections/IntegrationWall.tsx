import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { TOOLS } from '@/lib/content/home'

export function IntegrationWall() {
  return (
    <Section id="tools" tone="surface" divided>
      <Container>
        <div className="max-w-[54ch]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {TOOLS.eyebrow}
          </p>
          <h2 className="text-section text-ink">
            {TOOLS.title[0]}
            <br className="hidden sm:block" />
            {TOOLS.title[1]}
          </h2>
          <p className="text-body mt-3 text-ink-secondary">{TOOLS.lead}</p>
        </div>

        {/* 12 格：桌面 6 列、平板 4 列、手机 3 列 */}
        <ul className="mt-[clamp(28px,3.4vw,44px)] grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {TOOLS.items.map((name) => (
            <li
              key={name}
              className="flex h-[72px] flex-col items-center justify-center gap-2 rounded-card border border-line bg-canvas px-2 text-center transition-colors hover:border-line-strong"
            >
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-[7px] bg-surface-2 text-[11px] font-semibold text-ink-muted"
              >
                {name.slice(0, 1)}
              </span>
              <span className="text-[11.5px] leading-tight text-ink-secondary">
                {name}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-small mt-4 text-ink-muted">
          这些是使用场景，不是技术集成——预约系统不读取你的微信或日历。
        </p>
      </Container>
    </Section>
  )
}
