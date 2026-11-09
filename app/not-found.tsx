import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
        404
      </p>
      <h1 className="mt-3 text-[20px] font-semibold tracking-tight">
        这个页面不存在
      </h1>
      <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-ink-secondary">
        链接可能已经失效，或者这个人还没有开放预约。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-field bg-brand px-4 py-2 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
      >
        回到首页
      </Link>
    </main>
  )
}
