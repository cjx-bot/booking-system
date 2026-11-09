import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { logoutAction } from '@/lib/actions/auth'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  // 鉴权必须在服务端做，否则会闪一下未授权内容
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line bg-canvas">
        <div className="container-page flex h-14 items-center gap-4">
          <Link href="/" className="text-[13px] font-semibold tracking-tight">
            预约系统
          </Link>

          <span className="hidden text-[12px] text-ink-muted sm:inline">
            {session.user.name ?? session.user.email}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href={`/${session.user.username}`}
              target="_blank"
              className="text-[12px] text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
            >
              查看公开页
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-field px-2.5 py-1.5 text-[12px] text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
              >
                退出
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-page flex flex-col gap-6 py-6 lg:flex-row lg:gap-8">
        <aside className="lg:w-44 lg:shrink-0">
          <DashboardNav />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
