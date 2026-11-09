import Link from 'next/link'

export const metadata = {
  title: '预约系统 · 一个链接，客户自己挑时间',
}

const FEATURES = [
  {
    title: '一个链接，代替十轮微信',
    body: '把 /你的名字/30min 发到私信、名片或主页。客户点开就能约，不用你一句句问「周三下午行吗」。',
  },
  {
    title: '只在你真有空的时间里约',
    body: '按星期设置可用时段，系统自动跳过已排满的时间和缓冲间隔。不会出现两个人约到同一个点。',
  },
  {
    title: '时区自动换算',
    body: '客户在纽约、你在上海，他看到的永远是他自己的时间。确认页和邮件里两个时区并排显示，不会约错。',
  },
]

const CHECKS = [
  '客户不用注册账号',
  '数据存在你自己的库里',
  '十五分钟配置完',
]

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line">
        <div className="container-page flex h-14 items-center justify-between">
          <span className="text-[13.5px] font-semibold tracking-tight">
            预约系统
          </span>
          <nav className="flex items-center gap-1 text-[13px]">
            <Link
              href="/pricing"
              className="rounded-field px-3 py-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
            >
              定价
            </Link>
            <Link
              href="/login"
              className="rounded-field px-3 py-1.5 text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
            >
              登录
            </Link>
            <Link
              href="/login"
              className="ml-1 rounded-field bg-brand px-3.5 py-1.5 font-medium text-on-brand transition-colors hover:bg-brand-hover"
            >
              开始使用
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container-page pt-16 pb-14 sm:pt-24 sm:pb-20">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-pill border border-brand-line bg-brand-soft px-2.5 py-1 text-[11.5px] font-medium text-brand-hover">
            给独立职业者的预约工具
          </p>

          <h1 className="max-w-2xl text-[30px] leading-[1.28] font-semibold tracking-tight sm:text-[42px]">
            把预约链接发出去，
            <br />
            剩下的交给它。
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
            客户点开就能看到你什么时候有空，自己挑时间。
            不用再一句句确认「你周三下午方便吗」。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-field bg-brand px-5 py-2.5 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
            >
              免费开始
            </Link>
            <Link
              href="/demo"
              className="rounded-field border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface"
            >
              看一个真实页面
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {CHECKS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[12.5px] text-ink-secondary"
              >
                <span aria-hidden="true" className="text-success">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 预约页预览：直接把真页面的结构画出来，比截图更清楚 */}
        <section className="border-y border-line bg-surface py-14 sm:py-18">
          <div className="container-page">
            <div className="mb-8 max-w-xl">
              <h2 className="text-[22px] font-semibold tracking-tight">
                客户看到的就是这一页
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
                左边告诉他这是谁、聊什么、多久；右边选日期、选时间、填名字邮箱。
                三步做完，邮件自动发出去。
              </p>
            </div>

            <div className="overflow-hidden rounded-card border border-line bg-canvas shadow-card">
              <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2">
                <span className="size-2 rounded-full bg-line-strong" />
                <span className="size-2 rounded-full bg-line-strong" />
                <span className="size-2 rounded-full bg-line-strong" />
                <span className="ml-2 truncate font-mono text-[11px] text-ink-muted">
                  yoursite.com/demo/30min
                </span>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand-hover">
                      林
                    </span>
                    <span className="text-[12px] text-ink-secondary">林小满</span>
                  </div>
                  <p className="text-[16px] font-semibold tracking-tight">
                    30 分钟初谈
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">
                    聊聊你在做什么、卡在哪，看看我能不能帮上忙。
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    <span className="rounded-pill bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-hover">
                      30 分钟
                    </span>
                    <span className="rounded-pill border border-line px-2 py-0.5 text-[11px] text-ink-secondary">
                      之后留 10 分钟
                    </span>
                  </div>
                </div>

                <div className="rounded-field border border-line p-3">
                  <p className="mb-1.5 text-[11px] text-ink-muted">选择时间</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['09:00', '09:15', '09:30', '09:45', '10:00', '10:15'].map(
                      (time, index) => (
                        <span
                          key={time}
                          className={
                            index === 1
                              ? 'tnum rounded-field bg-brand py-1.5 text-center text-[12px] font-medium text-on-brand'
                              : 'tnum rounded-field border border-line py-1.5 text-center text-[12px] text-ink'
                          }
                        >
                          {time}
                        </span>
                      ),
                    )}
                  </div>
                  <p className="mt-2 text-[10.5px] text-ink-muted">
                    时间按 Asia/Shanghai 显示
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-14 sm:py-18">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-card border border-line p-5"
              >
                <span className="text-[11px] font-semibold tracking-[0.1em] text-ink-muted tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-[14.5px] font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-secondary">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-surface py-14">
          <div className="container-page text-center">
            <h2 className="text-[22px] font-semibold tracking-tight">
              先看看它在真实场景里什么样
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-secondary">
              下面是一个已经配置好的演示页面，可以直接约一个时间试试。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/demo"
                className="rounded-field bg-brand px-5 py-2.5 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
              >
                打开演示页面
              </Link>
              <Link
                href="/login"
                className="rounded-field border border-line-strong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-canvas"
              >
                我要自己配一个
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="container-page flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12px] text-ink-muted">
            预约系统 · 给独立职业者的预约工具
          </span>
          <nav className="flex gap-4 text-[12px] text-ink-muted">
            <Link href="/pricing" className="transition-colors hover:text-ink">
              定价
            </Link>
            <Link href="/demo" className="transition-colors hover:text-ink">
              演示
            </Link>
            <Link href="/login" className="transition-colors hover:text-ink">
              登录
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
