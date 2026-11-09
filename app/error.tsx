'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app/error]', error)
  }, [error])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-5">
      <h1 className="text-[20px] font-semibold tracking-tight">出了点问题</h1>
      <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-ink-secondary">
        页面没能正常加载。可以重试一次，如果还不行请稍后再来。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-field bg-brand px-4 py-2 text-[13px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
      >
        重试
      </button>
    </main>
  )
}
