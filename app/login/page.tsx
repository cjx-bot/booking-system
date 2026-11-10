import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth'

export const metadata = { title: '登录' }

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}

/** Auth.js 跳回 /login?error=xxx 时，把代码翻成人话 */
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: '邮箱或密码不对',
  SessionRequired: '请先登录再访问这个页面',
  Configuration: '登录服务配置有问题，请联系管理员',
  AccessDenied: '这个账号没有访问权限',
}

/** 演示提示只在显式开启时出现，生产构建里这段 JSX 直接不存在 */
const SHOW_DEMO_HINT = process.env.NEXT_PUBLIC_SHOW_DEMO_HINT === '1'

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  const { callbackUrl, error } = await searchParams
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? '登录没有完成，请重试')
    : null

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

          {errorMessage ? (
            <div
              role="alert"
              className="mb-4 rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[12.5px] text-danger"
            >
              {errorMessage}
            </div>
          ) : null}

          <LoginForm callbackUrl={callbackUrl} />
        </div>

        {SHOW_DEMO_HINT ? (
          <p className="mt-5 text-center text-[12px] leading-relaxed text-ink-muted">
            演示账号：demo@example.com / demo1234
          </p>
        ) : null}
      </div>
    </main>
  )
}
