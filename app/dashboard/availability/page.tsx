import { redirect } from 'next/navigation'
import { AvailabilityEditor } from '@/components/dashboard/AvailabilityEditor'
import { auth } from '@/lib/auth'
import { getAvailability } from '@/lib/queries/availability'

export const dynamic = 'force-dynamic'
export const metadata = { title: '可用时间' }

export default async function AvailabilityPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const rows = await getAvailability(session.user.id)

  const items = rows.map((row) => ({
    weekday: row.weekday,
    startMinute: row.startMinute,
    endMinute: row.endMinute,
  }))

  return <AvailabilityEditor rows={items} />
}
