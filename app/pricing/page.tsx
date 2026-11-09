import Link from 'next/link'

export const metadata = { title: '定价' }

const PLANS = [
  {
    name: '免费',
    price: '¥0',
    unit: '永久',
    description: '一个人、一个预约项目，够用就先跑起来。',
    features: ['1 个事件类型', '周可用时间设置', '确认邮件', '预约列表'],
    cta: '直接开始',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '¥29',
    unit: '每月',
    description: '项目多、想控制得更细的时候再升级。',
    features: [
      '不限事件类型',
      '缓冲时间与提前量',
      '取消与改期',
      '导出预约记录',
    ],
    cta: '联系开通',
    highlight: true,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line">
        <div className="container-page flex h-14 items-center justify-between">
          <Link
            href="/"
            className="text-[13.5px] font-semibold tracking-tight"
          >
            预约系统
          </Link>
          <Link
            href="/login"
            className="rounded-field bg-brand px-3.5 py-1.5 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
          >
            开始使用
          </Link>
        </div>
      </header>

      <main className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-[28px] font-semibold tracking-tight sm:text-[34px]">
            先免费用到顺手
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
            单人也够用。等你真的需要更多项目、更细的时间控制，再考虑升级。
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlight
                  ? 'rounded-card border border-brand-line bg-canvas p-6 shadow-card ring-1 ring-brand/10'
                  : 'rounded-card border border-line bg-canvas p-6'
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold tracking-tight">
                  {plan.name}
                </h2>
                {plan.highlight ? (
                  <span className="rounded-pill bg-brand-soft px-2 py-0.5 text-[10.5px] font-medium text-brand-hover">
                    推荐
                  </span>
                ) : null}
              </div>

              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-[30px] font-semibold tracking-tight tabular-nums">
                  {plan.price}
                </span>
                <span className="text-[12px] text-ink-muted">/ {plan.unit}</span>
              </p>

              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-secondary">
                {plan.description}
              </p>

              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[12.5px] text-ink-secondary"
                  >
                    <span aria-hidden="true" className="mt-0.5 text-success">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={
                  plan.highlight
                    ? 'mt-6 block rounded-field bg-brand py-2.5 text-center text-[13.5px] font-medium text-on-brand transition-colors hover:bg-brand-hover'
                    : 'mt-6 block rounded-field border border-line-strong py-2.5 text-center text-[13.5px] font-medium text-ink transition-colors hover:bg-surface'
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-ink-muted">
          Pro 目前需要人工开通，直接联系主理人即可。
        </p>
      </main>
    </div>
  )
}
