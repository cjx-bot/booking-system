import { redirect } from 'next/navigation'
import { AccountSettings } from '@/components/dashboard/AccountSettings'
import { requireSession } from '@/lib/actions/guard'
import { getUserProfile } from '@/lib/queries/user'

export const dynamic = 'force-dynamic'
export const metadata = { title: '账号设置' }

export default async function SettingsPage() {
  const session = await requireSession()
  if (!session?.user) redirect('/login')

  const user = await getUserProfile(session.user.id)
  if (!user) redirect('/login')

  // 固定用账号自己的时区格式化，避免服务端时区和用户时区不同导致日期差一天
  const createdAt = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'long',
    timeZone: user.timezone,
  }).format(user.createdAt)

  return (
    <AccountSettings
      email={user.email}
      username={user.username}
      name={user.name}
      timezone={user.timezone}
      createdAt={createdAt}
    />
  )
}
