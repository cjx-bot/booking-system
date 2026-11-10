import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { PROBLEM } from '@/lib/content/home'

export function ProblemSolution() {
  return (
    <Section id="how" tone="surface" divided>
      <Container>
        <div className="max-w-[52ch]">
          <p className="text-micro mb-3 font-medium text-brand normal-case">
            {PROBLEM.eyebrow}
          </p>
          <h2 className="text-section text-ink">
            {PROBLEM.title[0]}
            <br className="hidden sm:block" />
            {PROBLEM.title[1]}
          </h2>
          <p className="text-body mt-3 text-ink-secondary">{PROBLEM.lead}</p>
        </div>

        <div className="mt-[clamp(32px,4vw,52px)] grid gap-[clamp(28px,4vw,48px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* 左：三步 */}
          <ol className="space-y-6">
            {PROBLEM.steps.map((step) => (
              <li key={step.index} className="flex gap-4">
                <span className="tnum mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas text-[11.5px] font-semibold text-ink-muted">
                  {step.index}
                </span>
                <div className="min-w-0">
                  <h3 className="text-card text-ink">{step.title}</h3>
                  <p className="text-small mt-1 text-ink-secondary">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* 右：邮件流示意。用卡片叠放 + 底部渐隐表现「越滚越多」。 */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="relative overflow-hidden rounded-card border border-line bg-canvas shadow-card"
              style={{ maxHeight: '340px' }}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="text-[11.5px] font-medium text-ink-secondary">
                  收件箱
                </span>
                <span className="text-[11px] text-ink-muted">3 封未读</span>
              </div>

              <ul className="divide-y divide-line/70">
                {PROBLEM.inbox.map((message, index) => (
                  <li key={index} className="px-4 py-2.5">
                    <p className="text-[11px] text-ink-muted">
                      {message.from} · {message.time}
                    </p>
                    <p className="text-small mt-0.5 truncate text-ink-secondary">
                      {message.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-card bg-gradient-to-t from-surface to-transparent"
            />
          </div>
        </div>

        {/* 数据条 */}
        <div className="mt-[clamp(32px,4vw,52px)] flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-line pt-6">
          <span className="tnum text-[clamp(26px,3vw,34px)] leading-none font-semibold tracking-tight text-ink">
            {PROBLEM.stat.value}
          </span>
          <span className="text-small text-ink-secondary">{PROBLEM.stat.label}</span>
          <span className="text-small w-full text-ink-muted sm:ml-auto sm:w-auto">
            {PROBLEM.stat.note}
          </span>
        </div>
      </Container>
    </Section>
  )
}
