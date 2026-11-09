import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth'

export const metadata = { title: '登录' }

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  const { callbackUrl } = await searchParams

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-5 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-[13px] font-semibold tracking-tight text-ink"
        >
          预约系统
        </Link>

        <div className="rounded-card border border-line bg-canvas p-6 shadow-card">
          <h1 className="text-lg font-semibold tracking-tight">登录</h1>
          <p className="mt-1 mb-5 text-[13px] text-ink-secondary">
            管理你的事件类型和预约
          </p>

          <LoginForm callbackUrl={callbackUrl} />
        </div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-ink-muted">
          演示账号：demo@example.com / demo1234
        </p>
      </div>
    </main>
  )
}
